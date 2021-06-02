const { MessageEmbed } = require('discord.js')
const { numberToKorean } = require('../util/index')

async function find(str, client) {
  var s = await client.stock.find().toArray()
  return s.filter(r => r._id.includes(str) || r.name.includes(str) || r.code.includes(str))
}

module.exports = {
  name: '매수',
  aliases: ['aotn', 'buy'],
  description: '주식을 사서 떡상을 기다리세요',
  usage: '인트야 매수 <주식>',
  run: async (client, message, args, ops) => {
    if (!args[1])
      return message.reply('사용법: ```인트야 매수 [주식] [숫자]```')
		
    const res = await find(args[1], client)
    const count = res.length
    const items = res.map((r) => r.name + '\n').join('')
    if (!res || res.length === 0) 
      return message.reply(
        '해당 주식이 없습니다. `인트야 주식`으로 주식 상황을 보고 오시는건 어떨까요?'
      )
    else if (res.length > 1) 
      return message.reply(
        ` \`${count}\`건이 검색되었습니다. 이름을 더 정확하게 입력해주세요. 검색결과 : \n\`\`\`${items}\`\`\``
      )
		
    let user = await client.db.findOne({ _id: message.author.id })
    let stock = await client.stock.findOne({ _id: res[0]._id })
		
    if (!user.stock)
      await client.db.updateOne({ _id: message.author.id }, {
        $set: {
          stock: {}
        }
      })

    user = await client.db.findOne({ _id: message.author.id })
    var num = 0
    var dived = 0
    var total = 0
    if (['전부', '올인', '모두', 'all', '올'].includes(args[2])) {
      num = Math.floor(Number(user.money) / Number(stock.money))
      total = num * stock.money
      dived = Number(user.money) - total
    } else if (['반인', '반', 'half', '핲', '하프'].includes(args[2])) {
      num = Math.floor(Number(user.money) / 2 / Number(stock.money))
      total = num * stock.money
      dived = Number(user.money) - total
    } else if (
      isNaN(Number(args[2])) ||
			!Number.isInteger(Number(args[2])) ||
			Number(args[2]) < 1 ||
			Number(args[2]) == Infinity
    ) {
      return message.reply('사용법: ```인트야 매수 [주식 이름] (0 이상의 숫자 Infinity 이하)```')
    } else {
      num = Number(args[2])
      total = num * stock.money
      dived = Number(user.money) - total
    }
    if (dived < 0) {
      return message.reply('매수할 돈이 없습니다.')
    }

    if (!items[res[0]._id])
      items[res[0]._id] = num
    else
      items[res[0]._id] += num
    if (total / 1000000 > Number(user.money))
      return message.reply('돈이 많은데 너무 적게 사시네요. 취소합니다.')
        
    const chkBuy = new MessageEmbed()
      .setTitle('🧾 청구서')
      .setDescription(
        `매수하려는 주식 : ${
          res[0].name
        }\n수량 : ${numberToKorean(num)}\n지불할 금액 : ${numberToKorean(total)} :coin:\n계속하시려면 💳 이모지로 반응하세요.`
      )
      .setTimestamp()
      .setColor('YELLOW')
      .setFooter(
        `${message.author.tag}\u200b`,
        message.author.displayAvatarURL({
          dynamic: true,
        })
      )
        
    const ask = await message.channel.send(chkBuy)
    const filter = (reaction, u) => reaction.emoji.name === '💳' && u.id === message.author.id
        
    await ask.react('💳')
    ask
      .awaitReactions(filter, { max: 1, time: 10000, error: ['time'] })
      .then(
        async collected => {
          let embed = new MessageEmbed()
          let emoji = collected.first().emoji
          if (emoji.name === '💳') {
            embed.setTitle('💳 구매완료')
              .setDescription(
                `주식 : ${
                  res[0].name
                }\n수량 : ${
                  numberToKorean(num)
                }주\n지출 : ${
                  numberToKorean(total)
                } :coin:\n잔고 : ${
                  numberToKorean(dived)
                } :coin:`
              )
              .setColor('GREEN')
              .setTimestamp()

            if (!user.stock[res[0].code])
              user.stock[res[0].code] = Number(num)
            else
              user.stock[res[0].code] += Number(num)
                    
            await client.db.updateOne({_id: message.author.id}, {
              $set: {
                money: dived,
                stock: user.stock,
              }
            })
            ask.edit(embed)
          }
        }
      ).catch(e => {
        console.log(e)
        let embed = 
            new MessageEmbed()
              .setTitle('시간 초과')
              .setDescription('구매가 취소 되었습니다.')
              .setColor('RED')
              .setTimestamp()
            
        ask.edit(embed)
      })
  },
}