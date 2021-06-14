// Start Up
process.title = `Intbot - Ver. ${require('../package.json').version}, ${
  process.platform
}-${process.arch}`

// Dependencies
const Discord = require('discord.js')
const client = new Discord.Client()
const Event = require('./event')
const Modules = require('./modules')

// Variables
require('dotenv').config()
const PORT = process.env.PORT || 3000
const prefix = process.env.PREFIX
client.status = '오프라인'

// Discord bot client
client.aliases = new Discord.Collection()
client.developers = [
  '687866011013218349',
  '745758911012929550',
  '714736989106208791',
  '418677556322107412',
  '552103947662524416',
  '647736678815105037',
  '694131960125325374',
  '648022788002676737',
]
client.commands = new Discord.Collection()
client.module = Modules
client.color = color
client.mode = process.env.MODE || 'hosting'

// Function
function color(color, ...string) {
  if (!Modules.colorData[color])
    throw new TypeError(`There is no color ${color}`)
  else
    return `${Modules.colorData[color]}${string.join(' ')}${
      Modules.colorData.reset
    }`
}

// Booting
(async () => {
  client.status = '부팅중...'
  await Modules.dataBase(client)

  console.clear()
  console.log(
    '---------------------------------------------------------------------'
  )
  console.log('Author(s) : chul0721, sujang958, MadeGOD')
  console.log('(C) Team Int. All rights reserved.')
  console.log(
    '---------------------------------------------------------------------'
  )
  console.log(client.color('blue', '[System] '), process.title)

  client.login(process.env.BOT_TOKEN)
  await Event.ready(client)
  await Modules.handler(client, prefix, Modules)
  await Modules.web(client, PORT)
})()
