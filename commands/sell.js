const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');

async function find(str, client) {
    var s = await client.stock.find().toArray();
    return s.filter(r => r._id.includes(str) || r.name.includes(str) || r.code.includes(str))
}

module.exports = {
	name: '매도',
	aliases: ['aoeh', 'sell'],
	description: '떡상 하셨다면 판매를 하세요.',
	usage: '인트야 매도 <주식>',
	run: async (client, message, args, ops) => {
		let stock_result = await find(args[1], client);
        
        if (!args[1])
            return message.reply(`사용법\`\`\`인트야 매도 [주식] [수량]\`\`\``);
        if (!args[2])
            return message.reply(`사용법\`\`\`인트야 매도 [주식] [수량]\`\`\``);
        if (!stock_result[0])
            return message.reply('해당 주식이 없습니다')
        
        
        let user = await client.db.findOne({ _id: message.author.id });
		let stock = await client.stock.findOne({ _id: stock_result[0]._id });
		
        if (!user.stock)
            return message.reply("이런 주식을 사지 않은거 같은데.. `.주식`을 보고 `.매수 [주식 이름] [수량]`로 주식을 사보세요.")
        
		user = await client.db.findOne({ _id: message.author.id });
		var num = 0
    	var mon = 0
		var dived = 0
    	var total = 0
		var all = user.stock[stock_result[0].code] || 0
		if (['전부', '올인', '모두', 'all', '올'].includes(args[2])) {
			num = all;
			total = num * stock.money;
			dived = Number(user.money) + total;
		} else if (['반인', '반', 'half', '핲', '하프'].includes(args[2])) {
			num = Math.floor(all / 2)
			total = num * stock.money;
			dived = Number(user.money) + total;
		} else if (
			isNaN(Number(args[2])) ||
			!Number.isInteger(Number(args[2])) ||
			Number(args[2]) < 1 ||
			Number(args[2]) == Infinity
		) {
			return message.reply('사용법: ```.매수 [주식 이름] (0 이상의 숫자 Infinity 이하)```');
		} else {
			num = Number(args[2]);
			total = num * stock.money;
			dived = Number(user.money) + total;
		}
		if (num > all) return
			message.reply("판매하실 주식을 소지하고 있지 않습니다.")
		
		if (!user.stock[stock_result[0].code]) user.stock[stock_result[0].code] = num
		else user.stock[stock_result[0].code] -= num
		
		const chkSell = new MessageEmbed()
			.setTitle('🧾청구서')
			.setDescription(
				`매도하려는 주식 : ${
					stock_result[0].name
				}\n수량 : ${num}\n받을 금액 : ${total} :coin:\n계속하시려면 💳 이모지로 반응하세요.`
			)
			.setTimestamp()
			.setColor('YELLOW')
			.setFooter(
				`${message.author.tag}\u200b`,
				message.author.displayAvatarURL({
					dynamic: true,
				})
			);
        
		const ask = await message.channel.send(chkSell);
		const filter = (reaction, u) => reaction.emoji.name === '💳' && u.id === message.author.id;
        
        ask.react('💳');
        ask
        .awaitReactions(filter, { max: 1, time: 10000, error: ['time'] })
        .then(
            async collected => {
                let embed = new MessageEmbed();
                let emoji = collected.get('💳')._emoji; //TypeError: Cannot read property '_emoji' of undefined
                if (emoji.name === '💳') {
                    embed.setTitle("💳판매완료")
                        .setDescription(
                            `주식 : ${
                                stock_result[0].name
                            }\n수량 : ${
                                num
                            }주\n받을 금액 금액 : ${
                                total
                            } :coin:\n잔고 : ${
                                dived
                            } :coin:`
                        )
                        .setColor('GREEN')
                        .setTimestamp();

                    if (!user.stock[stock_result[0].code])
                        user.stock[stock_result[0].code] = Number(num);
                    else
                        user.stock[stock_result[0].code] -= Number(num)
                    
                    await client.db.updateOne({_id: message.author.id}, {
                        $set: {
                            money: dived,
                            stock: user.stock,
                        }
                    });
                    ask.edit(embed);
                }
            }
        ).catch(e => {
            console.log(e)
            let embed = 
            new MessageEmbed()
            .setTitle('시간 초과')
            .setDescription('판매가 취소 되었습니다.')
            .setColor('RED')
            .setTimestamp();
            
            ask.edit(embed);
        })
	},
};