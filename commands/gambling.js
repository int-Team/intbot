const Discord = require('discord.js');
module.exports = {
    name: '도박',
    aliases: ['gambling', 'ㅎ므ㅠㅣㅑㅜㅎ', 'ehqkr', 'dobak', 'game'],
    description: '도박을 해요.',
    usage: '인트야 도박',
    run: async (client, message, args, ops) => {
        const amount = args[1]
        if(Number(amount)<0) return message.channel.send("자연수만 지원됩니다.")
        if (!(await client.db.findOne({_id: message.author.id}))) {
            const embed = new Discord.MessageEmbed()
            .setTitle('인트봇의 서비스에 가입되어있지 않아요.')
            .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        } else {
            if ((await client.db.findOne({_id: message.author.id})).money < amount) {
                const embed = new Discord.MessageEmbed()
                .setTitle('돈이 부족해요.')
                .setDescription(`저런....`)
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
                message.channel.send(embed);
            } else if(isInt(amount)){
                const num = Math.floor(Math.random() * Math.floor(100))
                if(num < 49){
                    await client.db.updateOne({_id: message.author.id}, {
                        $set: {
                            money: Number(((await client.db.findOne({_id: message.author.id})).money) + Number(amount))
                        }
                    });
                    const embed = new Discord.MessageEmbed()
                    .setTitle('도박 성공!')
                    .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
                    .setColor('RANDOM')
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
                    message.channel.send(embed);
                } else if(num < 51) {
                    await client.db.updateOne({_id: message.author.id}, {
                        $set: {
                            money: Number(((await client.db.findOne({_id: message.author.id})).money) + (Number(amount) * 10))
                        }
                    });
                    const embed = new Discord.MessageEmbed()
                    .setTitle('잭팟이 터졌다!!')
                    .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
                    .setColor('RANDOM')
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
                    message.channel.send(embed);
                } else if(num < 100) {
                    await client.db.updateOne({_id: message.author.id}, {
                        $set: {
                            money: ((await client.db.findOne({_id: message.author.id})).money - amount)
                        }
                    });
                    const embed = new Discord.MessageEmbed()
                    .setTitle('저런... 도박에 실패했어요')
                    .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
                    .setColor('RANDOM')
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
                    message.channel.send(embed);
                }
            } else{
                message.channel.send("자연수만 지원됩니다.")
            }
        }
    }
}

function isInt(num) {
    return num % 1 === 0;
}