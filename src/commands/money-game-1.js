const Discord = require('discord.js')
const { numberToKorean } = require('../util/index')

function randomIndex(array) {
  return array[Math.floor(Math.random() * array.length)]
}

module.exports = {
  name: '가위바위보',
  aliases: ['가바보', '보가위바위'],
  description: '가위 바위 보! ',
  usage: '인트야 가위바위보',
  category: '게임',
  run: async (client, message, args) => {
    let a = randomIndex(['가위', '바위', '보'])
    let b
    let user = args[1]
    if (user == '가위' || user == '가' || user == '찌' || user == 'scissor')
      b = '가위'
    else if (user == '바위' || user == '바' || user == 'rock' || user == '묵')
      b = '바위'
    else if (
      user == '보' ||
      user == '보자기' ||
      user == 'paper' ||
      user == '빠'
    )
      b = '보'
    else if (!user) b = randomIndex(['가위', '바위', '보'])

    let embed = new Discord.MessageEmbed()
      .setTitle('가위 바위 보!')
      .setDescription(
        `${client.emojis.cache.find((x) => x.name == 'loading')} 생각중..`
      )
      .setColor('GREEN')
      .addField('당신의 선택', b)

    let userDB = await client.db.findOne({ _id: message.author.id })
    let buja = false
    if (!userDB) {
      const noDB = new Discord.MessageEmbed()
        .setTitle('인트봇의 서비스에 가입되어있지 않아요.')
        .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
      return message.channel.send(noDB)
    } else if (userDB.money < 1000) {
      const noMoney = new Discord.MessageEmbed()
        .setDescription('인트봇 : 적어도 1천원 정도 지갑에 넣고 다니라고')
        .setColor('RED')
        .setFooter('돈이 없다고 인트봇이랑 같이 게임하기 싫다고 합니다.')
        .setTimestamp()
      return message.channel.send(noMoney)
    }
    if (!args[1]) {
      return message.channel.send('사용법 : `인트야 가위바위보 [당신의 선택]`')
    } else {
      message.reply('안내면 진다! 가위바위보!')
      let m = await message.channel.send({ embed: embed })
      if (a == b) {
        //비긴경우
        embed
          .addField('인트봇 선택', `${a}`)
          .setDescription('비겼군요!! 이득 없이 종료하지...')
        m.edit({
          embed: embed,
        })
      } else if (
        (b == '가위' && a == '보') ||
        (b == '바위' && a == '가위') ||
        (b == '보' && a == '바위')
      ) {
        // Win
        let total = Number(userDB.money + 10000)
        await client.db.updateOne(
          { _id: message.author.id },
          {
            $set: {
              money: total,
            },
          }
        )

        embed
          .addField('인트봇 선택', `${a}`)
          .setDescription(
            '당신이 이겼군요!\n보상으로 1만원을 주지. 다음에 다시 보지...'
          )
        m.edit({
          embed: embed,
        })
      } else {
        // Lose
        let total = userDB.money - 1000
        await client.db.updateOne(
          { _id: message.author.id },
          {
            $set: {
              money: total,
            },
          }
        )
        embed
          .addField('인트봇', `${a}`)
          .setDescription(
            `그럴 수 있어. 이런 날도 있는 거지 뭐. 그레도 돈에서 ${numberToKorean(
              1000
            )} 가져간다 ㅅㄱ`
          )
        m.edit({
          embed: embed,
        })
      }
    }
  },
}

function float2int(value) {
  return value | 0
}
