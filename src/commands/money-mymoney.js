const { MessageEmbed } = require('discord.js')
const { numberToKorean } = require('../util/index')

module.exports = {
  name: '지갑',
  aliases: ['지갑', 'wlrkq', 'sowntlr', '내주식', '내돈', '돈', 'money'],
  description: '뒤적 뒤적 지갑속에 뭐가 있을까요?',
  usage: '인트야 지갑',
  run: async (client, message, args, ops) => {
    let userDB = await client.db.findOne({_id: message.author.id})
	
	if(!userDB) {
		return message.channel.send(
        new MessageEmbed()
			.setTitle('인트의 서비스에 가입되어있지 않아요.')
			.setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
			.setColor('RED')
			.setFooter(message.author.tag, message.author.displayAvatarURL())
			.setTimestamp())
	} else if(message.mentions.members.first()) {
		let mentionUser = message.mentions.members.first().user
		userDB = await client.db.findOne({_id: mentionUser.id})
		if(!userDB) {
			message.channel.send(
			new MessageEmbed()
				.setTitle(`${mentionUser.username}가 인트봇 서비스에 가입되어있지 않아요.`)
				.setDescription('해당 유저한테 `인트야 가입`을 이용해서 먼저 가입해달라고 말해보세요.')
				.setColor('RED')
				.setFooter(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp())
		} else if(userDB) {
			let mentionUserEmbed = new MessageEmbed()
			  .setTitle(`${mentionUser.username}님의 지갑`)
			  .setDescription('뒤적 뒤적 지갑속에 뭐가 있을까요?')
			  .addField('돈', `${numberToKorean(userDB.money) || '0원'}`, true)
			  .setColor('GREEN')
			  .setFooter(message.author.tag, message.author.displayAvatarURL())
			  .setTimestamp()
			let m = await message.channel.send({embed : mentionUserEmbed})
				if(!userDB.stock) {
					let str = '```diff\n'
					str += '--- 현제 주식을 보유하지 않고 있습니다.'
					str += "```"
					mentionUserEmbed.addField('주식' , str)
						.addField('현재 시즌', '**SEASON 0 Start**', true)
				  		.addField('뱃지', '개발중입니다.', true)
				m.edit({
					embed : mentionUserEmbed
				})
				} else {
				let str = '```diff\n'
				for (let stock of Object.entries(userDB.stock)) {
				  const [code, money] = stock
				  const stockDB = await client.stock.findOne({code: code})
				  str += `+ ${code}\n   ${numberToKorean(money) || 0} 주\n   ${numberToKorean(stockDB.money * money) || 0} 원\n`
				}
				str += '```'
				mentionUserEmbed.addField('주식', str)
					.addField('현재 시즌', '**SEASON 0 Start**', true)
					.addField('뱃지', '개발중입니다.', true)
				m.edit({
					embed : mentionUserEmbed
				})
			}
		}
	} else {
		userDB = await client.db.findOne({_id: message.author.id})
		const embed = new MessageEmbed()
		  .setTitle(`${message.author.tag}님의 지갑`)
		  .setDescription('뒤적 뒤적 지갑속에 뭐가 있을까요?')
		  .addField('돈', `${numberToKorean(userDB.money) || '0원'}`, true)
		  .setColor('GREEN')
		  .setFooter(message.author.tag, message.author.displayAvatarURL())
		  .setTimestamp()
		
		let m = await message.channel.send({embed :embed})
		let str = '```diff\n'
			if(!userDB.stock) {
				let str = '```diff\n'
				str += '--- 현제 주식을 보유하지 않고 있습니다.'
				str += "```"
				embed.addField('주식' , str)
					.addField('현재 시즌', '**SEASON 0 Start**', true)
					.addField('뱃지', '개발중입니다.', true)
			m.edit({
				embed : embed
			})
			} else {
			let str = '```diff\n'
			for (let stock of Object.entries(userDB.stock)) {
			  const [code, money] = stock
			  const stockDB = await client.stock.findOne({code: code})
			  str += `+ ${code}\n   ${numberToKorean(money) || 0} 주\n   ${numberToKorean(stockDB.money * money) || 0} 원\n`
			}
			str += '```'
			embed.addField('주식', str)
				.addField('현재 시즌', '**SEASON 0 Start**', true)
				.addField('뱃지', '개발중입니다.', true)
			m.edit({
				embed : embed
			})
		}
	}
  }
}
