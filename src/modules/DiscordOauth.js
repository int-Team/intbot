require('dotenv').config()
const DiscordOauth = require('oauth-discord')
const Oauth = new DiscordOauth({
  version: 'v8',
  client_id: '798709769929621506',
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
})

module.exports = Oauth