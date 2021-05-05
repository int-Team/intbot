const Discord = require('discord.js');

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
module.exports = {
    name: '지갑',
    aliases: ['지갑', 'wlrkq', 'sowntlr', '내주식', '내돈', '돈', 'money'],
    description: '뒤적 뒤적 지갑속에 뭐가 있을까요?',
    usage: '인트야 지갑',
    run: async (client, message, args, ops) => {
        let user = await client.db.findOne({ _id : message.author.id})
        if (!user) {
            const embed = new Discord.MessageEmbed()
				.setTitle('인트의 서비스에 가입되어있지 않아요.')
				.setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
				.setColor('RED')
				.setFooter(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp()
            message.channel.send(embed);
        } else {
			if(!message.mentions.members.first()) {
				const embed = new Discord.MessageEmbed()
					.setTitle(`${message.author.tag}님의 지갑`)
					.setDescription(`뒤적 뒤적 지갑속에 뭐가 있을까요?`)
					.addField(`돈`, `${numberWithCommas(user.money)}원`, true)
					.addField(`주식`, `\`\`\`json\n${JSON.stringify(user.stock)}\`\`\``, true)
					.addField(`현재 시즌`, `**SEASON 0 Start**`, true)
					.addField(`뱃지`, `개발중입니다.`, true)
					.setColor('GREEN')
					.setFooter(message.author.tag, message.author.displayAvatarURL())
					.setTimestamp()
            	message.channel.send(embed);
			} else {
				let mentionUserDB = await client.db.findOne({ _id : message.mentions.members.first().user.id});
				let mentionUser = message.mentions.members.first()
				if(!mentionUser) {
					const embed = new Discord.MessageEmbed()
						.setTitle(`${mentionUser.user.username}가 인트의 서비스에 가입되어있지 않아요.`)
						.setDescription(`${mentionUser} 한테 인트봇 서비스 가입하라고 말해보세요`)
						.setColor('RED')
						.setFooter(message.author.tag, message.author.displayAvatarURL())
						.setTimestamp()
					message.channel.send(embed);
				} else {
					const embed = new Discord.MessageEmbed()
						.setTitle(`${mentionUser.user.username}님의 지갑`)
						.setDescription(`뒤적 뒤적 지갑속에 뭐가 있을까요?`)
						.addField(`돈`, `${numberWithCommas(mentionUserDB.money)}원`, true)
						.addField(`주식`, `\`\`\`json\n${JSON.stringify(mentionUserDB.stock)}\`\`\``, true)
						.addField(`현재 시즌`, `**SEASON 0 Start**`, true)
						.addField(`뱃지`, `개발중입니다.`, true)
						.setColor('GREEN')
						.setFooter(message.author.tag, message.author.displayAvatarURL())
						.setTimestamp()
					message.channel.send(embed);
				}
			}
            
        }
    }
}
