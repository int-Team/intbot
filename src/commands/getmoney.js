const Discord = require('discord.js')
const fetch = require('node-fetch')
const axios = require('axios').default
module.exports = {
  name: '돈받기',
  aliases: ['getmoney', '돈내놔', '돈줘', 'ㅎㄷ스ㅐㅜ됴', 'ehsqkerl', 'ehssoshk', 'ehswnj'],
  description: '1시간에 한번씩 돈을 받아요.',
  usage: '인트야 돈받기',
  run: async (client, message, args, ops) => {
    const koreanbottoken = process.env.KTOKEN
    let noKbotsAcn
    if (!(await client.db.findOne({_id: message.author.id}))) {
      const embed = new Discord.MessageEmbed()
        .setTitle('인트봇의 돈 서비스에 가입되어있지 않아요.')
        .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
      message.channel.send(embed)
    } else {
      axios.get(`https://api.koreanbots.dev/bots/voted/${message.author.id}`, {
        headers: {
          token: koreanbottoken
        }
      }).catch( (e) => {
        if (e == 'Error: Request failed with status code 404') {}
        else message.channel.send(`저런... 개발중에 뭘 잘못 건든거 같네요. 개발자들이 이 오류를 보면 얼마나 스트래쓰를 받을지는 모르겠지만 일단 보낼께요. \n${e}`)
      })
      if ((await axios.get(`https://api.koreanbots.dev/bots/voted/${message.author.id}`, {
        headers: {
          token: koreanbottoken
        },
        validateStatus: function (status) {
          return status == 404 || 200
        }
      })).data.voted) {
        if ((await client.db.findOne({_id: message.author.id})).lastGotMoney && new Date() - 1 + 1 - (await client.db.findOne({_id: message.author.id})).lastGotMoney < 300000) {
          const embed = new Discord.MessageEmbed()
            .setTitle('5분 전에 이미 돈을 받았어요')
            .setDescription(`${(300000 - (new Date() - 1 + 1 - ((await client.db.findOne({_id: message.author.id}))).lastGotMoney)) / 1000|0}초 후에 다시 시도해 주세요!`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          return message.channel.send(embed)
        } else {
          await client.db.updateOne({_id: message.author.id}, {
            $set: {
              lastGotMoney: new Date() - 1 + 1,
              money: ((await client.db.findOne({_id: message.author.id})).money + 1000)
            }
          })
          const embed = new Discord.MessageEmbed()
            .setTitle('1000원을 받았어요!')
            .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          return message.channel.send(embed)
        }
      } else {
        if ((await client.db.findOne({_id: message.author.id})).lastGotMoney && new Date() - 1 + 1 - (await client.db.findOne({_id: message.author.id})).lastGotMoney < 7200000) {
          const embed = new Discord.MessageEmbed()
            .setTitle('2시간 전에 이미 돈을 받았어요')
            .setDescription(`${(7200000 - (new Date() - 1 + 1 - ((await client.db.findOne({_id: message.author.id}))).lastGotMoney)) / 1000|0}초 후에 다시 시도해 주세요!\nKOREANBOTS에서 [여기](https://koreanbots.dev/bots/${client.user.id})를 눌러 하트를 추가하면 클타임이 5분이에요!`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          return message.channel.send(embed)
        } else {
          await client.db.updateOne({_id: message.author.id}, {
            $set: {
              lastGotMoney: new Date() - 1 + 1,
              money: ((await client.db.findOne({_id: message.author.id})).money + 1000)
            }
          })
          const embed = new Discord.MessageEmbed()
            .setTitle('1000원을 받았어요!')
            .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
          return message.channel.send(embed)
        }
      }
    }
  }
}