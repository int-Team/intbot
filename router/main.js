const express = require('express');
const config = require("../config.json");
const redirectURI = "https://discord.com/api/oauth2/authorize?client_id=798709769929621506&redirect_uri=http%3A%2F%2Fchul0721.iptime.org%3A8000%2Fcallback&response_type=code&scope=identify"
const API_ENDPOINT = 'https://discord.com/api/v8'
const CLIENT_ID = '798709769929621506';
const CLIENT_SECRET = config.CLIENT_SECRET;
const REDIRECT_URI = 'http://chul0721.iptime.org:8000/callback';
// const REDIRECT_URI = "http://localhost:8000/callback";
const fetch = require('node-fetch');
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
});
let accessToken = {}


module.exports =
/**
 * @param {express.Application} app express app
 * @param {Client} client client
 */
(app, client) => {
    app.get('/', (req,res) => {
        res.render('../views/index.html');
    });

    app.post('/shop/:id', async (req, res, nextf) => {
        try {
            if (req.body.id == undefined || isNaN(req.body.id) || req.params.id != req.body.id) {
                return res.redirect(redirectURI);
            }
            const { id, username } = req.body;

            var userDB = await client.db.findOne({_id: `${id}`});
            var money = userDB.money;

            res.render('shop.ejs', {
                username: username,
                money: money,
                id: id,
            })
        } catch (e) {
            res.send(`<script>alert("이런! 문제가 발생했어요, 아마도 인트봇의 돈 서비스에 가입 하지 않아 생긴일 같아요!");location.href="${redirectURI}";</script>`);
        }
    })

    app.post('/buy_process', async (req, res) => {
        const { id, goods_id } = req.body;
        const recaptcha_res = req.body['g-recaptcha-response'];

        console.log(req.body);

        if (recaptcha_res == undefined || recaptcha_res == '') {
            return res.send(`<script>alert("리캡챠 인증을 해주세요!");history.back();</script>`);
        }
        
        fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${config.RECAPTCHA_SECRET}&response=${recaptcha_res}`
        }).then(re_res => {
            return re_res.json();
        }).then(async json => {
            const { success } = json;

            if (success) {
                let userDB = await client.db.findOne({_id: `${id}`});
                if (userDB == undefined) {
                    return res.send(`<script>alert("이런! 문제가 발생했어요, 아마도 인트봇의 돈 서비스에 가입 하지 않아 생긴일 같아요");history.back();</script>`);
                } else {
                    let goodsDB = await client.goods.findOne({_id: `${goods_id}`})
                    const total = userDB.money - goodsDB.price;

                    if (total < 0) {
                        return res.send(`<script>alert("돈이 부족합니다.");history.back();</script>`);
                    } else {
                        await client.db.findOneAndUpdate({_id: `${id}`}, {
                            $push: {
                                goods: goods_id,
                            },
                            $set: {
                                money: Number(total)
                            }
                        })
                        res.send(`<script>alert("성공적으로 구입했어요!");location.href="/"</script>`);
                    }
                }
            } else {
                return res.send(`<script>alert("올바르지 않은 리캡챠 토큰입니다!");history.back();</script>`);
            }
        })
    })

    app.get('/shop/:id', (a, b) => {
        return b.redirect(redirectURI);
    })

    app.get('/callback', (req, res) => {
        const { code } = req.query;
        // 이론
        // Oauth로 코드 받았으면 디스코드를 통해 액세스 토큰을 발급받아야 됨
        // 액세스 토큰으로 유저 ID를 가져올수 있음
        // 액세스 토큰을 사용하지 않고 API에 접근할때에는
        // 봇 토큰이 필요함, 디스코드 API 접근시 필요한 토큰은 두가지 종류가 있음
        // 첫번째 berblabla 토큰, 두번째 봇 토큰


        oauth.tokenRequest({
            code: code,
            scope: "identify",
            grantType: "authorization_code",
        }).then(discordOauth_res => {
            accessToken.token = discordOauth_res.access_token;
            accessToken.token_type = discordOauth_res.token_type;
            fetch(`${API_ENDPOINT}/users/@me`, {
                headers: {
                    Authorization: `${accessToken.token_type} ${accessToken.token}`
                }
            }).then(userRes => {
                return userRes.json();
            }).then(json => {
                res.send(`<form action="/shop/${json.id}" method="post">
                <input type="hidden" name="id" value="${json.id}">
                <input type="hidden" name="username" value="${json.username}">
            </form><script>document.querySelector("form").submit()</script>`);
            })
        })
    })
}