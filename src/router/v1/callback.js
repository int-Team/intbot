const { MessageEmbed } = require('discord.js')
const Oauth = require('../../modules/DiscordOauth')

const callbackRouter = async (req, res) => {
  const client = req.app.get('discord_client')
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
      return res.status(404).send({
        code : 404,
        message : '인트봇 서비스 가입한 유저가 아닙니다.'
      })

    res.send({
      code: 200, 
      user: {id : dscUser.id, db : userDB},
      oauth: {code : user}
    })
  } catch (e) {
    console.log(e)
    res.send('<script>alert("다시 해봐요!");location.back();</script>')
    client.channels.cache.get('836917703075823636').send(new MessageEmbed
      .setTitle('ERROR')
      .setColor('RED')
      .addField('요청 장소', req.path)
      .addField('오류내용', e.toString())
      .setTimestamp()
    )
  }
}

module.exports = callbackRouter