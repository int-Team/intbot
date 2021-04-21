const express = require("express");
const { Client } = require("discord.js");
const config = require("../config.json");
const redirectURI =
  "https://discord.com/api/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Fchul0721.iptime.org%3A5001%2Fcallback&response_type=code&scope=identify";
const CLIENT_SECRET = config.CLIENT_SECRET;
const API_ENDPOINT = "https://discord.com/api/v8";
const CLIENT_ID = "798709769929621506";
const REDIRECT_URI = 'http://localhost:5001/callback';
// const REDIRECT_URI = "http://asdf/callback";
const REDIRECT_URI_PROFILE = "http://localhost:5001/profile_callback";
const DiscordOauth2 = require("discord-oauth2");
const { default: fetch } = require("node-fetch");
let accessToken = {};

module.exports =
  /**
   * @param {express.Application} app express app
   * @param {Client} client client
   */
  (app, client) => {
    app.get("/", (req, res) => {
      console.log("req");
      res.render("../views/index.html");
    });

    app.get("/shop/:code", async (req, res, next) => {
      try {
        const { code } = req.params;

        if (!code)  res.send(`<script>alert('이런! 뭔가 잘못된것같아요, 다시 로그인해 보아요!');location.href='https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fcallback&response_type=code&scope=identify';</script>`)

        var oauth = new DiscordOauth2({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectUri: REDIRECT_URI,
        });

        const token = await oauth
        .tokenRequest({
          code: code,
          scope: "identify",
          grantType: "authorization_code",
        });
        
        let userJSON = await fetch(`${API_ENDPOINT}/users/@me`, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          }
        });
        userJSON = await userJSON.json();
        let userDB = await client.db.findOne({_id: userJSON.id});

        client.goods.insertOne({
          _id: `${code}`,
          refresh_token: `${token.refresh_token}`,
          type: `${token.token_type}`
        });

        res.render('shop', {
          code: `${code}`,
          user: {
            name: `${userJSON.username}#${userJSON.discriminator}`,
            money: `${userDB.money}`
          }
        });
      } catch (e) {
        console.log(e);
        res.send(`<script>alert('이런! 뭔가 잘못된것같아요, 다시 로그인해 보아요!');location.href='https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fcallback&response_type=code&scope=identify';</script>`)
      }
    });

    app.get("/buy_process", async (req, res) => {
      const { code, itemID } = req.query;
      console.log(req.query);

      if (!code || !itemID) return res.redirect(`https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fcallback&response_type=code&scope=identify`);
      let goodsDB = await client.goods.findOne({_id: `${itemID}`});
      if (!goodsDB) return res.send(`<script>alert('유효하지않은 상품입니다!');history.back();</script>`);
      let tokenDB = await client.goods.findOne({_id: `${code}`});
      if (!tokenDB) return res.redirect(`https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fcallback&response_type=code&scope=identify`);

      try {
        var oauth = new DiscordOauth2({
          clientId: CLIENT_ID,
          clientSecret: `${CLIENT_SECRET}`,
          redirectUri: REDIRECT_URI,
        });

        let token = await oauth
        .tokenRequest({
          refreshToken: `${tokenDB.refresh_token}`,
          scope: "identify",
          grantType: `refresh_token`,
        });

        let userJSON = await fetch(`${API_ENDPOINT}/users/@me`, {
          headers: {
            Authorization: `${token.token_type} ${token.access_token}`,
          }
        });
        userJSON = await userJSON.json();
        console.log(userJSON);
        let userDB = await client.db.findOne({_id: userJSON.id});
        
        if (!userDB) return res.send(`<script>alert('뭔가 잘못된것 같아요, 아마도 인트의 돈 서비스의 가입하지 않아 생긴 일 같아요');history.back();</script>`);

        let total = userDB.money - goodsDB.price;

        if (total < 0) return res.send(`<script>alert('돈이 부족합니다!');history.back();</script>`);

        client.db.findOneAndUpdate({_id: userJSON.id}, {
          $push: {
            goods: itemID,
          }
        });

        client.goods.deleteOne({_id: code});

        return res.send(`<script>alert('성공적으로 구입했습니다!');location.href="/profile/${userJSON.id}";</script>`);
      } catch (e) {
        console.log(e);
        res.send(`<script>alert('이런! 뭔가 잘못된것같아요, 다시 로그인해 보아요!');location.href='https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Flocalhost%3A5001%2Fcallback&response_type=code&scope=identify';</script>`);
      }
    });

    app.get("/callback", (req, res) => {
      return res.redirect(`/shop/${req.query.code}`);
    });

    

    app.get("/profile/:id", async (req, res) => {
      const { id } = req.params;
      var userDB = await client.db.findOne({ _id: id });

      if (userDB == undefined || userDB == null) {
        res.status(404).send(`<h1>이런! 찾으시려는 유저가 없는것 같아요..</h1>`);
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
                profile_img: `https://blog.kakaocdn.net/dn/cyOIpg/btqx7JTDRTq/1fs7MnKMK7nSbrM9QTIbE1/img.jpg`,
                username: "Unknown User",
                tag: "Unknown Tag",
                money: `unknown`,
                level: `unknown`,
                xp: `unknown`,
                money_rank: `unknown`,
                level_rank: `unknown`,
                xp_rank: `unknown`,
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
    })
    rank.level.rank = levelRankArr.findIndex(e => {
        return e._id == id;
    })
    rank.xp.rank = levelRankArr.findIndex(e => {
        return e._id == id;
    })
    rank.level.rank += 1;
    rank.money.rank += 1;
    rank.xp.rank += 1;
    rank.level.count = await (await client.db.findOne({_id: id})).level;
    rank.money.count = await (await client.db.findOne({_id: id})).money;
    rank.xp.count = await (await client.db.findOne({_id: id})).xp;

    return rank;
}