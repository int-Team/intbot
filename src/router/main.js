require('dotenv').config()
const DiscordOauth = require('oauth-discord')
const Discord = require('discord.js')
const { numberToKorean } = require('../util/index.js')
const Oauth = new DiscordOauth({
  version: 'v8',
  client_id: '798709769929621506',
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
})

module.exports =
  /**
   * @param {import('express').Application} app express app
   * @param {import('discord.js').Client} client client
   */
(app, client) => {
  app.get('/', (_req, res) => res.render('index'))
	
  app.get('/status', (_req, res) => res.render('status'))

  app.get('/stock', async (req, res) => {
    const stocks = await client.stock.find().toArray()
    const user = client.users.cache.get(req.session.userID)
    let options = {
      stocks,
      user: {}
    }

    if (user) {
      const userDB = await client.db.findOne({_id: user.id})
      options.user.isLogined = true
      options.user.tag = user.tag
      options.user.money = (userDB === null || userDB === void 0 ? void 0 : userDB.money) || '가입되지 않음'
    }

    res.render('stock', options)
  })

  app.get('/callback', async (req, res) => {
    try {
      const { code } = req.query

      if (!code)
        return res.redirect(process.env.OAUTH_URL)
      if (req.session.user_id)
        return res.redirect('/')

      const token = await Oauth.getToken({
        grant_type: 'authorization_code',
        code,
      })
      const user = await Oauth.user(token.access_token)
      
      if (!client.users.cache.has(user.id))
        return res.send('<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");location.back();</script>')
            
      const dscUser = await client.users.cache.get(user.id)
      const userDB = await client.db.findOne({_id: dscUser.id})

      if (!userDB)
        return res.send('<script>alert("인트봇에 가입한 유저가 아니에요!");location.back();</script>')

      req.session.user_id = dscUser.id

      res.redirect('/shop')
    } catch (e) {
      console.log(e)
      client.channels.cache.get('836917703075823636').send(new Discord.MessageEmbed()
        .setTitle('ERROR')
        .setColor('RED')
        .addField('요청 장소', req.path)
        .addField('오류내용', e.toString())
        .setTimestamp()
      )
      res.redirect(process.env.OAUTH_URL)
    }
  })

  app.get('/shop', async (req, res) => {
    try {
      if (!req.session.user_id)
        return res.redirect(process.env.OAUTH_URL)
      if (!client.users.cache.has(req.session.user_id))
        return res.send('<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");history.back();</script>')
            
      const dscUser = await client.users.cache.get(req.session.user_id)
      const userDB = await client.db.findOne({_id: dscUser.id})
      const merchs = await client.goods.find().toArray()

      if (!userDB)
        return res.send('<script>alert("인트봇에 가입한 유저가 아니에요!");history.back();</script>')

      res.render('shop', {
        user: {
          tag: dscUser.tag,
          money: numberToKorean(userDB.money),
        },
        merchs
      })
    } catch (e) {
      console.log(e)
      client.channels.cache.get('836917703075823636').send(new Discord.MessageEmbed()
        .setTitle('ERROR')
        .setColor('RED')
        .addField('요청장소', req.path)
        .addField('오류내용', e.toString())
        .setTimestamp()
      )
      res.redirect(process.env.OAUTH_URL)
    }
  })

  app.get('/buy/:merch_id', async (req, res) => {
    const { merch_id } = req.params

    if (!merch_id)
      return res.status(404).send('<script>alert("살 수 있는 상품이 아니에요!");location.back();</script>')
    if (!req.session.user_id)
      return res.status(200).redirect('/shop')
    if (!client.users.cache.has(req.session.user_id))
      return res.status(404).send('<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");location.back();</script>')
        
    const dscUser = client.users.cache.get(req.session.user_id)
    const userDB = await client.db.findOne({_id: dscUser.id})
    const merch = await client.goods.findOne({_id: merch_id})

    if (!userDB)
      return res.send('<script>alert("인트봇 서비스에 가입한 유저가 아니에요!");location.back();</script>')
    if (userDB.money < merch.price)
      return res.send('<script>alert("돈이 부족해요!");location.back();location.back();</script>')

    userDB.merchs[merch._id] = {
      count: userDB.merchs[merch._id] + 1 || 1,
    }

    await client.db.updateOne({_id: req.session.user_id}, {
      $set: {
        money: Number(userDB.money - merch.price),
        merchs: userDB.merchs
      },
      $push: {
        goods: merch._id
      }
    })
            
    res.status(200).send('<script>alert("아이템이 구매되었어요!");location.href="/shop";</script>')
  })

  app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
  })

  app.get('/profile/:id', async (req, res) => {
    const { id } = req.params
    const userDB = await client.db.findOne({_id: id})

    if (!client.users.cache.has(id) || !userDB)
      return res.send('<script>alert("인트봇이 볼 수 없는 유저에요!");history.back();</script>')

    try {
      let user = await client.users.fetch(id)
      let rank = await getMyRank(user.id, client)

      res.render('profile.ejs', {
        profile_img: user.displayAvatarURL(),
        username: `${user.username}`,
        status: client.status,
        tag: `${user.tag}`,
        money: rank.money.count,
        level: rank.level.count,
        xp: rank.level.count,
        money_rank: rank.money.rank,
        xp_rank: rank.level.rank,
        goods: userDB.goods,
      })
    } catch (e) {
      console.log(e)
      client.channels.cache.get('836917703075823636').send(new Discord.MessageEmbed()
        .setTitle('ERRORㅣOAuth 이동')
        .setColor('RED')
        .addField('오류내용', e.toString())
        .setTimestamp()
      )
      return res.send('<script>alert("인트봇이 볼 수 없는 유저에요!");</script>')
    }
  })
}

/**
 * @param {Discord.Client} client 
 */
const getMyRank = async (id, client) => {
  let userDB = await client.db.findOne({_id: id})
  let moneyRankArr = await client.db.find().sort({money:-1}).toArray()
  let rank = {}
  rank.money = {}
  rank.money.rank = moneyRankArr.findIndex(e => e._id == id)
  rank.money.rank += 1
  rank.money.count = numberToKorean(userDB.money)

  return rank
}