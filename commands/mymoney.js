const Discord = require('discord.js');
module.exports = {
    name: '지갑',
    aliases: ['지갑', 'wlrkq', 'sowntlr', '내주식', '내돈', '돈', 'money'],
    description: '뒤적 뒤적 지갑속에 뭐가 있을까요?',
    usage: '인트야 지갑',
    run: async (client, message, args, ops) => {
        if (!(await client.db.findOne({_id: message.author.id}))) {
            const embed = new Discord.MessageEmbed()
            .setTitle('인트의 서비스에 가입되어있지 않아요.')
            .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
            .setColor('RED')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        } else {
			let user = await client.db.findOne({ _id : message.author.id})
            const embed = new Discord.MessageEmbed()
            .setTitle(`${message.author.tag}님의 지갑`)
            .setDescription(`뒤적 뒤적 지갑속에 뭐가 있을까요?`)
			.addField(`돈`, `${user.money}원`, true)
			.addField(`주식`, `\`\`\`json\n${JSON.stringify(user.stock)}\`\`\``, true)
			.addField(`현재 시즌`, `**SEASON 0 Start**`, true)
			.addField(`뱃지`, `개발중입니다.`, true)
            .setColor('GREEN')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        }
    }
}
