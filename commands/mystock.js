const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');

async function find(str, client) {
    var s = await client.stock.find().toArray();
    return s.filter(r => r._id.includes(str) || r.name.includes(str) || r.code.includes(str))
}

module.exports = {
	name: '내주식',
	aliases: ['mystock', 'mstock'],
	description: '자신의 주식을 봅니다. 웁니다. 한강으로 갑니다.',
	usage: '인트야 내주식',
	run: async (client, message, args, ops) => {
		let user = await client.db.findOne({_id: message.author.id});
        if (!user)
            return message.reply('인트 서비스에 가입하지 않았어요!');
        if (!user.stock)
            return message.reply('인트 서비스에 가입하지 않았어요!');
        message.reply(`\`\`\`json\n${JSON.stringify(user.stock)}\`\`\``)
	},
};