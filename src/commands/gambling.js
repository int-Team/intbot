const Discord = require('discord.js')

module.exports = {
  name: '도박',
  aliases: ['gambling', 'ㅎ므ㅠㅣㅑㅜㅎ', 'ehqkr', 'dobak', 'game'],
  description: '도박을 해요.',
  usage: '인트야 도박',
  run: async (client, message, args, ops) => {
    const amount = args[1]
    if(Number(amount)<0) return message.channel.send('자연수만 지원됩니다.')
    		
    if ((await client.db.findOne({_id: message.author.id})).lastGamblng && new Date() - 1 + 1 - (await client.db.findOne({_id: message.author.id})).lastGamblng < 2000) {
      const embed = new Discord.MessageEmbed()
        .setTitle('경찰입니다. 신고들어와서 왔씁니다.')
        .setDescription(`깡방에 ${(2000 - (new Date() - 1 + 1 - ((await client.db.findOne({_id: message.author.id}))).lastGamblng)) / 1000|0}초 동안 계세요. `)
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
      return message.channel.send(embed) 
    }
		
    const userDB = await client.db.findOne({_id: message.author.id})
		
    if (!userDB) {
      const embed = new Discord.MessageEmbed()
        .setTitle('인트봇의 서비스에 가입되어있지 않아요.')
        .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
      message.channel.send(embed)
    } else {
      if (userDB.money < amount) {
        const embed = new Discord.MessageEmbed()
          .setTitle('돈이 부족해요.')
          .setDescription('저런....')
          .setColor('RED')
          .setFooter(message.author.tag, message.author.displayAvatarURL())
          .setTimestamp()
					
        message.channel.send(embed)
      } else if (isInt(amount)){
        let total
        const num = Math.floor(Math.random() * 200)
					
        if(num < 80 && num >= 5){
          total = Number(userDB.money + Number(amount))
          await client.db.updateOne({_id: message.author.id}, {
            $set: {
              money: total,
              lastGamblng: new Date() - 1 + 1
            }
          })
          const embed = new Discord.MessageEmbed()
            .setTitle('도박 성공!')
            .setDescription(`현재 보유 금액은 ${total}원이에요.`)
            .setColor('GREEN')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
						
          message.channel.send(embed)
        } else if (num < 2) {
          total = Number((userDB.money) + (Number(amount) * 10))
						
          await client.db.updateOne({_id: message.author.id}, {
            $set: {
              money: total,
              lastGamblng: new Date() - 1 + 1
            }
          })
          const embed = new Discord.MessageEmbed()
            .setTitle('잭팟이 터졌다!!')
            .setDescription(`현재 보유 금액은 ${total}원이에요.`)
            .setColor('GREEN')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          message.channel.send(embed)
        } else {
          total = Number(userDB.money - amount)
						
          await client.db.updateOne({_id: message.author.id}, {
            $set: {
              money: total ,
              lastGamblng: new Date() - 1 + 1
            }
          })
          const embed = new Discord.MessageEmbed()
            .setTitle('저런... 도박에 실패했어요')
            .setDescription(`현재 보유 금액은 ${total}원이에요.`)
            .setColor('YELLOW')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          message.channel.send(embed)
        } 
      } else {
        message.channel.send('자연수만 지원됩니다.')
      }
    } 
  }
}

function isInt(num) {
  return num % 1 === 0
}
