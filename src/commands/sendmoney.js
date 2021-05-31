const { MessageEmbed } = require('discord.js')
const Discord = require('discord.js')

module.exports = {
  name: '송금',
  aliases: ['ㄴ둥', '송금', '주기', 'send'],
  usage: '인트야 송금',
  run: async (client, message, args, ops) => {
    if (args[1] == undefined || args[2] == undefined || isNaN(args[2]) || Number(args[2]) < 0 || Number(args[2]) == Infinity || Number(args[2]) % 1 != 0) {
      return message.reply('사용법: ```인트야 송금 @멘션 (송금액 [0~Infinity 의 자연수])```')
    }

    const userID = args[1].replace(/[<@!]/g, '').replace('>', '')
    let count = Number(args[2]) 
    let toUserDB = await client.db.findOne({_id: userID})
    let meUserDB = await client.db.findOne({_id: message.author.id})
    if (userID == message.author.id) return message.reply(new MessageEmbed()
      .setColor('YELLOW')
      .setDescription('자기 자신에게 돈을 보내는건 올바르지 않아요...')
      .setTimestamp()
      .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
        dynamic: true,
      })))
    try {
      if (toUserDB && meUserDB) {
                
        var dscUSER = await client.users.fetch(userID)
        let total = meUserDB.money - count
        if (total < 0) {
          return message.reply(new MessageEmbed()
            .setTitle('돈이 부족합니다').setTimestamp()
            .setColor('RED')
            .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
              dynamic: true,
            })))
        }
        let embed = new MessageEmbed()
          .setTitle('정말로 송금할까요?')
          .setColor('YELLOW')
          .setDescription(`${dscUSER.tag} 님 에게 ${numberToKorean(count)} 만큼의 돈을 주고 ${numberToKorean(total)} 만큼의 이 남습니다! 수수료로 200원이 차감됩니다.`)
          .setTimestamp()
          .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
            dynamic: true,
          }))
        let chkMsg = await message.channel.send({
          embed: embed
        })
        chkMsg.react('✅').then(() => chkMsg.react('❌'))

        const filter = (reaction, user) => {
          return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id
        }
        chkMsg.awaitReactions(filter, { max: 1 })
          .then(collected => {
            const reaction = collected.first()
            total = meUserDB.money - count
            if (reaction.emoji.name === '✅') {
              client.db.findOneAndUpdate({_id: message.author.id}, {
                $set: {
                  money: total - 200
                }
              })
              client.db.findOneAndUpdate({_id: userID}, {
                $set: {
                  money: toUserDB.money + count
                }
              })
              embed.setTitle('송금ㅣ성공')
                .setDescription('성공적으로 유저에게 돈을 보냈습니다')
                .addField(`${dscUSER.tag}`, `${numberToKorean(toUserDB.money + count)}원`)
                .addField(`${message.author.tag}`, `${numberToKorean(meUserDB.money)}원`)
                .setColor('GREEN')
                .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
                  dynamic: true,
                }))
                .setTimestamp()
              chkMsg.edit({
                embed: embed
              })
            } else {
              embed.setTitle('송금ㅣ취소')
                .setDescription('송금을 취소되었습니다.')
                        
              chkMsg.edit({
                embed: embed
              })
            }
          })
          .catch(collected => {
            embed.setTitle('송금ㅣ취소')
              .setDescription('송금을 취소되었습니다.')
                        
            chkMsg.edit({
              embed: embed
            })
            console.log(collected)
          })
      } else {
        return message.reply('인트 돈시스템에 가입하지 않았습니다.')
      }
    } catch (e) {
      console.log(e)
      client.channels.cache.get('836917703075823636').send(new MessageEmbed()
        .setTitle('ERRORㅣ돈보내기')
        .setColor('RED')
        .addField('요청인', `${message.author.tag}(${message.author.id})`)
        .addField('오류내용', e.toString())
        .setTimestamp()
        .setFooter(`${message.author.tag}`)
      )
      return message.reply('에러가 난것 같아요, 잠깐만요..')
    }
  }
}
function numberToKorean(number){
  if (String(number).includes('Infinity'))  return number
  var inputNumber  = number < 0 ? false : number
  var unitWords    = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극']
  var splitUnit    = 10000
  var splitCount   = unitWords.length
  var resultArray  = []
  var resultString = ''

  for (var i = 0; i < splitCount; i++){
    var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i)
    unitResult = Math.floor(unitResult)
    if (unitResult > 0){
      resultArray[i] = unitResult
    }
  }

  for (var a = 0; a < resultArray.length; a++){
    if(!resultArray[a]) continue
    resultString = String(resultArray[a]) + unitWords[a] + ' ' + resultString
  }

  return resultString.replace(/ $/, '')
}
