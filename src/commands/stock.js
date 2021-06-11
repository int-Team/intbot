const Discord = require('discord.js')

function float2int(value) {
  return value | 0
}
const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

module.exports = {
  name: '주식',
  aliases: ['주식', 'wntlr'],
  description: '가끔 주식 현황을 보면서 김밥먹으면 떡상이 가겠죠?',
  usage: '인트야 주식',
  run: async (client, message, args, ops) => {
    let stocks = await client.stock.find().toArray()
    let lastUpdate = new Date(client.lastStockUpdate)

    let embed = new Discord.MessageEmbed()
      .setTitle('주식 현황')
      .setDescription(`다음 변동까지 ${timeToKorean(float2int(600 - Math.abs((10000 - (Date.now() - client.lastStockUpdate)) / 1000) ))}`)
      .setColor('GREEN')
      .setFooter('확인한 시간')
      .setTimestamp()

    for (let stock of stocks) {
      let previousStock = stock.money - stock.previous
      let previousStockPM = (previousStock + '').split('')[0]
      let previousStockPM2 = ''
            
      if (previousStockPM == '0')
        previousStockPM = '---'
      else if (!isNaN(previousStockPM))
        previousStockPM = '+'        
      if (previousStockPM == '+')
        previousStockPM2 = '▲'
      else if (previousStockPM == '-')
        previousStockPM2 = '▼'
      else
        previousStockPM2 = '~'
            
      previousStockPM += ' '
      let previousStockStr = `${previousStockPM}(${previousStockPM2} ${numberWithCommas(previousStock)})`

      embed
        .addField(
          `**${stock.name} (${stock.code})**`,
          `\`\`\`diff\n${numberWithCommas(stock.money)}\n${previousStockStr}\`\`\``
          , true)
    }
    embed.addField('\u200b', `마지막 주식 변동 : ${lastUpdate.getHours()}시 ${lastUpdate.getMinutes()}분 ${lastUpdate.getSeconds()}초`, true)

    message.channel.send(embed)
  }
}

function timeToKorean(number){
    var inputNumber  = number < 0 ? false : number
    var unitWords    = ['초', '분', '시', '주', '월', '년']
    var splitUnit    = 60
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
