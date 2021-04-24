const Discord = require('discord.js');

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
		.setColor("GREEN")
		.setFooter('확인한 시간')
		.setTimestamp();

	for (let stock of stocks) {
		let previousStock = stock.money - stock.previous
		let previousStockPM = (previousStock + "").split('')[0]
		if (!isNaN(previousStockPM)) previousStockPM = "+";
		previousStockPM += " ";
		
		embed.addField(stock.name, `\`\`\`diff\n${previousStockPM}(${previousStock < 0 ? `▼ ${previousStock}` : `▲ +${previousStock}`})\`\`\``)
	}
	embed.addField("\u200b", `마지막 주식 변동 : ${lastUpdate.getHours() + 9}시 ${lastUpdate.getMinutes()}분 ${lastUpdate.getSeconds()}초`)

    message.channel.send(embed)
  }
}