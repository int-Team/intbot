const Discord = require('discord.js');

module.exports = {
    name: '주식',
    aliases: ['주식', 'wntlr'],
    description: '가끔 주식에 존버를 타도 되죠',
    usage: '인트야 주식',
    run: async (client, message, args, ops) => {

    const stock = [
        { id: 'work', name : "노동민족"},
        { id: 'bot', name : "봇은행" },
        { id: 'kimbab', name : "꿀꿀김밥" },
        { id: 'sujang', name : "Sujang Programming" },
        { id: 'mcint', name : "MCInt" },
        { id: 'penguin', name : "펭귄제약" },
    ]
    let embed = new Discord.MessageEmbed()
		.setTitle('주식 현황')
		.setColor("GREEN")
		.addField('노동민족', `${(await client.stock.findOne({_id: "work"})).money}`)
		.addField('봇은행', `${(await client.stock.findOne({_id: "bot"})).money}`)
		.addField('펭귄제약', `${(await client.stock.findOne({_id: "penguin"})).money}`)
		.addField('꿀꿀김밥', `${(await client.stock.findOne({_id: "kimbab"})).money}`)
		.addField('MCInt', `${(await client.stock.findOne({_id: "mcint"})).money}`)
		.addField('Sujang Programming', `${(await client.stock.findOne({_id: "sujang"})).money}`)
		.setTimestamp()
		.setFooter('확인한 시간')
    message.channel.send(embed)
		

  }
}