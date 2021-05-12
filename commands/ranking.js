const Discord = require('discord.js')
const AvailableOptions = ['유저', '자신']

module.exports = {
  name: '랭킹',
  aliases: ['ranking', 'rank', 'fodzld', 'ㄱ무ㅏㅑㅜㅎ', 'ㄱ무ㅏ'],
  description: '현재 랭킹 상태를 보여줘요',
  usage: '인트야 랭킹',
  /**
     * @param {Discord.Client} client 
     * @param {string[]} args
     * @param {Discord.Message} message 
     */
  // eslint-disable-next-line no-unused-vars
  async run(client, message, args, _ops) {
    const option = args[1]
    const userDB = await client.db.findOne({_id: message.author.id})
        
    if (!option)
      return message.channel.send(await getRank(client, message))
    if (!AvailableOptions.includes(option) && isNaN(option.replace(/[<@!]/g, '').replace('>', '')))
      return message.channel.send('`인트야 랭킹` | 인트야 랭킹 [유저/자신]')
    if (!userDB)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle('인트봇의 돈 서비스에 가입되어있지 않아요.')
        .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
        .setColor('RED')
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp())
    if (option.includes('자신'))
      return message.channel.send(await getUserRank(message.author.id, client))
    if (!isNaN(option.replace(/[<@!]/g, '').replace('>', '')))
      return message.channel.send(await getUserRank(option.replace(/[<@!]/g, '').replace('>', ''), client))
  }
}

/**
 * @param {*} option 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 */
const getRank = async (client, message) => {
  let rankArr = await client.db.find().limit(10).sort({money: -1}).toArray()
  let embed = new Discord.MessageEmbed()
    .setTimestamp()
    .setTitle('인트봇 랭킹')
    .setColor('GREEN')
    .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
    
  for (let i in rankArr) {
    let dsc_user = client.users.cache.get(String(rankArr[i]._id))
    if (dsc_user)
      embed.addField(
        `${Number(i) + 1}. ${dsc_user.tag}`,
        `${numberToKorean(rankArr[i].money)} 원`
      )
    else
      embed.addField(
        `${Number(i) + 1}. Unknown user`,
        `${numberToKorean(rankArr[i].money)} 원`
      )
  }

  return embed
}

/**
 * @param {Discord.Client} client 
 */
const getUserRank = async (id, client) => {
  let user = await client.users.fetch(id)
  let userDB = await client.db.findOne({_id: id})
  let moneyRankArr = await client.db.find().sort({money: -1}).toArray()
  let rank = {}

  rank.money = {}
  rank.money.rank = moneyRankArr.findIndex(e => e._id == id)
  rank.money.rank += 1
  rank.money.count = numberToKorean(userDB.money)

  let embed = new Discord.MessageEmbed()
    .setTitle(`${user.tag} 님의 랭킹`)
    .setColor('GREEN')
    .addField(`돈 랭킹: ${rank.money.rank} 위`, `보유자산: ${rank.money.count}원`, false, true)
    .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
    .setTimestamp()

  return embed
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