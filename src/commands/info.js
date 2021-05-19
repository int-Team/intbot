const Discord = require('discord.js')
module.exports = {
  name: '정보',
  aliases: ['info', 'ㅑㅜ래', 'wjdqh'],
  description: '유저의 정보를 볼 수 있어요.',
  usage: '인트야 정보',
  run: async (client, message, args, ops) => {
    message.channel.send(new Discord.MessageEmbed()
      .setAuthor(`${message.author.tag}`)
      .addField('돈', `${(await client.db.findOne({_id: message.author.id})).money}`)
      .setColor('GREEN')
      .setTimestamp()
    )
  }
}
