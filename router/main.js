const express = require("express");
const { Client } = require("discord.js");
const config = require("../config.json");
const redirectURI =
  "https://discord.com/api/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Fchul0721.iptime.org%3A5001%2Fcallback&response_type=code&scope=identify";

const API_ENDPOINT = "https://discord.com/api/v8";
const CLIENT_ID = "798709769929621506";
const CLIENT_SECRET = config.CLIENT_SECRET;
const REDIRECT_URI = 'http://chul0721.iptime.org:5001/callback';
// const REDIRECT_URI = "http://asdf/callback";
const REDIRECT_URI_PROFILE = "http://chul0721.iptime.org:5001/profile_callback";
const fetch = require("node-fetch");
const DiscordOauth2 = require("discord-oauth2");
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

    app.post("/shop/:id", async (req, res, nextf) => {
        try {
            if (
            req.body.id == undefined ||
            isNaN(req.body.id) ||
            req.params.id != req.body.id
            ) {
                return res.redirect(redirectURI);
            }
            const { id, username } = req.body;
            var userDB = await client.db.findOne({ _id: req.body.id });
            console.log(userDB);
            var money = userDB.money;
            console.log(money);
            res.render("../views/shop.ejs", {
                username: username,
                id: id,
                money: money
            });
      } catch (e) {
        res.send(
          `<script>alert("이런! 문제가 발생했어요, 아마도 인트봇의 돈 서비스에 가입 하지 않아 생긴일 같아요! ${e}");location.href="${redirectURI}";</script>`
        );
      }
    });

    app.post("/buy_process", async (req, res) => {
      const { id, goods_id } = req.body;
      const recaptcha_res = req.body["g-recaptcha-response"];

      console.log(req.body);

      if (recaptcha_res == undefined || recaptcha_res == "") {
        return res.send(
          `<script>alert("리캡챠 인증을 해주세요!");history.back();</script>`
        );
      }

      fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${config.RECAPTCHA_SECRET}&response=${recaptcha_res}`,
      })
        .then((re_res) => {
          return re_res.json();
        })
        .then(async (json) => {
          const { success } = json;

          if (success) {
            let userDB = await client.db.findOne({ _id: `${id}` });
            if (userDB == undefined) {
              return res.send(
                `<script>alert("이런! 문제가 발생했어요, 아마도 인트봇의 돈 서비스에 가입 하지 않아 생긴일 같아요");history.back();</script>`
              );
            } else {
              let goodsDB = await client.goods.findOne({ _id: `${goods_id}` });
              const total = userDB.money - goodsDB.price;

              if (total < 0) {
                return res.send(
                  `<script>alert("돈이 부족합니다.");history.back();</script>`
                );
              } else {
                    if (userDB.goods.includes(goods_id)) {
                        return res.send(
                            `<script>alert("이미 상품을 보유하고 있습니다!");history.back();</script>`
                        );
                    } else {
                        await client.db.findOneAndUpdate(
                            { _id: `${id}` },
                            {
                                $push: {
                                goods: goods_id,
                                },
                                $set: {
                                money: Number(total),
                                },
                            }
                        );
                        return res.send(
                        `<script>alert("성공적으로 구입했어요!");history.back();</script>`
                        );
                    }
              }
            }
          } else {
            return res.send(
              `<script>alert("올바르지 않은 리캡챠 토큰입니다!");history.back();</script>`
            );
          }
        });
    });

    app.get("/shop/:id", (a, b) => {
      return b.redirect(redirectURI);
    });

    app.get("/callback", (req, res) => {
      const { code } = req.query;
      console.log("asdf");
      var oauth = new DiscordOauth2({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: REDIRECT_URI,
      });

      oauth
        .tokenRequest({
          code: code,
          scope: "identify",
          grantType: "authorization_code",
        })
        .then((discordOauth_res) => {
          accessToken.token = discordOauth_res.access_token;
          accessToken.token_type = discordOauth_res.token_type;
          fetch(`${API_ENDPOINT}/users/@me`, {
            headers: {
              Authorization: `${accessToken.token_type} ${accessToken.token}`,
            },
          })
            .then((userRes) => {
              return userRes.json();
            })
            .then((json) => {
              res.send(`<form action="/shop/${json.id}" method="post">
                <input type="hidden" name="id" value="${json.id}">
                <input type="hidden" name="username" value="${json.username}">
            </form><script>document.querySelector("form").submit()</script>`);
            });
        });
    });

    app.get("/profile_callback", (req, res) => {
      const { code } = req.query;

      var oauth = new DiscordOauth2({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: REDIRECT_URI_PROFILE,
      });

      oauth
        .tokenRequest({
          code: code,
          scope: "identify",
          grantType: "authorization_code",
        })
        .then((discordOauth_res) => {
          accessToken.token = discordOauth_res.access_token;
          accessToken.token_type = discordOauth_res.token_type;
          fetch(`${API_ENDPOINT}/users/@me`, {
            headers: {
              Authorization: `${accessToken.token_type} ${accessToken.token}`,
            },
          })
            .then(userRes => {
              return userRes.json();
            })
            .then(json => {
              console.log(json);
              res.redirect(`/profile/${json.id}`)
            });
        });
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

    app.get("/profile", (req, res) => {
      res.redirect(`https://discord.com/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Fchul0721.iptime.org:5001%2Fprofile_callback&response_type=code&scope=identify`)
    })
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