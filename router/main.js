require('dotenv').config();
const DiscordOauth2 = require("discord-oauth2");
const Oauth = new DiscordOauth2({
    version: 'v8',
    clientId: '798709769929621506',
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});
// 세션챗 와바

module.exports =
  /**
   * @param {import('express').Application} app express app
   * @param {import('discord.js').Client} client client
   */
(app, client) => {
    app.get("/", (req, res) => {
        res.render("index");
    });

    app.get('/callback', async (req, res) => {
        try {
            const { code } = req.query;

            if (!code)
                return res.redirect(process.env.OAUTH_URL);
            if (req.session.user_id)
                return res.redirect('/');

            const token = await Oauth.tokenRequest({
                code,
                scope: ['identify'],
                grantType: 'authorization_code',
            });
            const user = await Oauth.getUser(token.access_token);
            
            if (!client.users.cache.has(user.id))
                return res.send(`<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");location.back();</script>`);
            
            const dscUser = await client.users.cache.get(user.id);
            const userDB = await client.db.findOne({_id: dscUser.id});

            if (!userDB)
                return res.send(`<script>alert("인트봇에 가입한 유저가 아니에요!");location.back();</script>`);

            req.session.user_id = dscUser.id;

            res.redirect(`/shop`);
        } catch (e) {
            console.log(e);
            res.redirect(process.env.OAUTH_URL);
        }
    });

    app.get("/shop", async (req, res) => {
        try {
            if (!req.session.user_id)
                return res.redirect(process.env.OAUTH_URL);
            
            if (!client.users.cache.has(req.session.user_id))
                return res.send(`<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");location.back();</script>`);
            
            const dscUser = await client.users.cache.get(req.session.user_id);
            const userDB = await client.db.findOne({_id: dscUser.id});

            if (!userDB)
                return res.send(`<script>alert("인트봇에 가입한 유저가 아니에요!");location.back();</script>`);

            res.render('shop', {
                user: {
                    tag: dscUser.tag,
                    money: userDB.money
                }
            });
        } catch (e) {
            console.log(e);
            res.redirect(process.env.OAUTH_URL);
        }
    });

    app.get("/buy/:merch_id", async (req, res) => {
        const { merch_id } = req.params;

        if (!merch_id)
            return res.send(`<script>alert("살 수 있는 상품이 아니에요!");location.back();</script>`);
        if (!req.session.user_id)
            return res.redirect('/shop');
        
        if (!client.users.cache.has(req.session.user_id))
            return res.send(`<script>alert("인트봇이 접근할 수 있는 유저가 아니에요!");location.back();</script>`);
        
        const dscUser = await client.users.cache.get(req.session.user_id);
        const userDB = await client.db.findOne({_id: dscUser.id});
        const merch = await client.goods.findOne({_id: merch_id});

        if (!userDB)
            return res.send(`<script>alert("인트봇 서비스에 가입한 유저가 아니에요!");location.back();</script>`);
        if (userDB.money < merch.price)
            return res.send(`<script>alert("인트봇 머니가 부족해요!");location.back();</script>`);

        await client.db.updateOne({_id: req.session.user_id}, {
            $set: {
                money: (userDB.money - merch.price),
            },
            $push: {
                goods: merch._id
            }
        });
            
        res.send(`<script>alert("인트봇 아이템이 구매되었어요!");location.href="/shop";</script>`)
    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

      app.get("/profile/:id", async (req, res) => {
          const { id } = req.params;
          var userDB = await client.db.findOne({ _id: id });

          if (userDB == undefined || userDB == null) {
              res.status(404).send("<h1>이런! 찾으시려는 유저가 없는것 같아요..</h1>");
          } else {
              try {
                  var discordUser = await client.users.fetch(id);
                  var rank = await getMyRank(discordUser.id, client);

                  res.render("profile.ejs", {
                      profile_img: discordUser.displayAvatarURL(),
                      username: `${discordUser.username}`,
                      tag: `${discordUser.tag}`,
                      money: rank.money.count,
                      level: rank.level.count,
                      xp: rank.xp.count,
                      money_rank: rank.money.rank,
                      level_rank: rank.level.rank,
                      xp_rank: rank.xp.rank,
                      goods: userDB.goods,
                  });
              } catch (e) {
                  console.log(e);

                  res.render("profile.ejs", {
                      profile_img: "https://blog.kakaocdn.net/dn/cyOIpg/btqx7JTDRTq/1fs7MnKMK7nSbrM9QTIbE1/img.jpg",
                      username: "Unknown User",
                      tag: "Unknown Tag",
                      money: "unknown",
                      level: "unknown",
                      xp: "unknown",
                      money_rank: "unknown",
                      level_rank: "unknown",
                      xp_rank: "unknown",
                      goods: []
                  });
              }
          }
      });
  };


const getMyRank = async (id, client) => {
    let moneyRankArr = await client.db.find().sort({money: -1}).toArray();
    let levelRankArr = await client.db.find().sort({level: -1}).toArray();
    let rank = {};
    rank.level = {};
    rank.money = {};
    rank.xp = {};
    rank.money.rank = moneyRankArr.findIndex(e => {
        return e._id == id;
    });
    rank.level.rank = levelRankArr.findIndex(e => {
        return e._id == id;
    });
    rank.xp.rank = levelRankArr.findIndex(e => {
        return e._id == id;
    });
    rank.level.rank += 1;
    rank.money.rank += 1;
    rank.xp.rank += 1;
    rank.level.count = await (await client.db.findOne({_id: id})).level;
    rank.money.count = await (await client.db.findOne({_id: id})).money;
    rank.xp.count = await (await client.db.findOne({_id: id})).xp;

    return rank;
};