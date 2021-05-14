const Discord = require('discord.js')
require('dotenv').config()
module.exports = {
  name: '개발자',
  aliases: ['developer', '개발팀', 'dev', 'team', '팀', '만든'],
  description: '봇이 개발된 서버를 갈 수 있어요.',
  usage: '인트야 개발자',
  run: async (client, message, args, ops) => {
    const support = ['https://discord.io/teamalpha', 'https://discord.gg/WxjQaPK']
    message.channel.send(new Discord.MessageEmbed()
      .setTitle('인트봇은 Team int에서 만들어졌어요!')
      .addField('Team int', `[바로가기](${support[1]})`)
      .setColor('RANDOM')
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
    )
  }
}
