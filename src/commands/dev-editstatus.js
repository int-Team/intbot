const Discord = require('discord.js')
module.exports = {
  name: '점검',
  aliases: ['wjarja', 'jumgum', '온라인'],
  description: '인트봇 점검합니다',
  usage: '인트야 점검',
  category: '개발자',
  run: async (client, message, args) => {
    if (!client.developers.includes(message.author.id))
      return message.channel.send(
        `${client.user.username} 개발자만 사용할 수 있어요.`
      )
    if (client.status == '정상 운영중...') {
    }
  },
}
