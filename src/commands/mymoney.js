const { MessageEmbed } = require('discord.js')
const { numberToKorean } = require('../util/index')

module.exports = {
  name: '지갑',
  aliases: ['지갑', 'wlrkq', 'sowntlr', '내주식', '내돈', '돈', 'money'],
  description: '뒤적 뒤적 지갑속에 뭐가 있을까요?',
  usage: '인트야 지갑',
  run: async (client, message, args, ops) => {
    let user = await client.db.findOne({_id: message.author.id})

    if (!user)
      return message.channel.send(
        new Discord.MessageEmbed()
        .setTitle('인트의 서비스에 가입되어있지 않아요.')
        .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
      )

    let userID = ''
    if (args[1])
      userID = args[1].replace(/[<@!]/gi, '')
    else
      userID = message.author.id
    user = await client.db.findOne({_id: userID})

    const embed = new MessageEmbed()
      .setTitle(`${message.author.tag}님의 지갑`)
      .setDescription('뒤적 뒤적 지갑속에 뭐가 있을까요?')
      .addField('돈', `${numberToKorean(user.money)} 원`, true)
      .setColor('GREEN')
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
    
    let str = '```diff\n'
    for (let stock of Object.entries(user.stock)) {
      if (stock[1] == 0)  continue

      const [code, money] = stock
      const stockDB = await client.stock.findOne({code: code})
      str += `+ ${code}\n   ${numberToKorean(money)} 주\n   ${numberToKorean(stockDB.money * money)} 원\n`
    }
    str += '```'

    embed
      .addField('주식', str)
      .addField('현재 시즌', '**SEASON 0 Start**', true)
      .addField('뱃지', '개발중입니다.', true)

    message.channel.send(embed)
  }
}
