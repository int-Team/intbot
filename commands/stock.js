const Discord = require('discord.js');
function float2int(value) {
    return value | 0;
}

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
module.exports = {
    name: '주식',
    aliases: ['주식', 'wntlr'],
    description: '가끔 주식 현황을 보면서 김밥먹으면 떡상이 가겠죠?',
    usage: '인트야 주식',
    run: async (client, message, args, ops) => {
		let stocks = await client.stock.find().toArray();
		let lastUpdate = new Date(client.lastStockUpdate);

		let embed = new Discord.MessageEmbed()
			.setTitle('주식 현황')
			.setDescription(`다음 변동까지 ${float2int(600 - Math.abs((10000 - (Date.now() - client.lastStockUpdate)) / 1000) )} 초`)
			.setColor("GREEN")
			.setFooter('확인한 시간')
			.setTimestamp();

		for (let stock of stocks) {
			let previousStock = stock.money - stock.previous
			let previousStockPM = (previousStock + "").split('')[0]
            let previousStockPM2 = '';
            
			if (previousStockPM == "0")
                previousStockPM = "---";
			else if (!isNaN(previousStockPM))
                previousStockPM = "+";        
            if (previousStockPM == "+")
                  previousStockPM2 = "▲";
            else if (previousStockPM == "-")
                previousStockPM2 = "▼";
            else
                previousStockPM2 = "~";
            
            previousStockPM += " ";
            let previousStockStr = `${previousStockPM}(${previousStockPM2} ${numberWithCommas(previousStock)})`

			embed
			.addField(
			`**${stock.name} (${stock.code})**`,
			`\`\`\`diff\n${numberWithCommas(stock.money)}\n${previousStockStr}\`\`\``
			, true)
		}
		embed.addField("\u200b", `마지막 주식 변동 : ${lastUpdate.getHours() + 9}시 ${lastUpdate.getMinutes()}분 ${lastUpdate.getSeconds()}초`, true)

		message.channel.send(embed)
  }
}