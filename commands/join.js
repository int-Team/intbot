const Discord = require('discord.js');
module.exports = {
    name: '가입',
    aliases: ['join', 'ㅓㅐㅑㅜ', 'rkdlq'],
    description: '인트 봇 서비스에 가입해요.',
    usage: '인트야 가입',
    run: async (client, message, args, ops) => {
        if (await client.db.findOne({_id: message.author.id})) {
            message.channel.send('이미 가입되어 있어요!')
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle('정말 가입할까요?')
                .setDescription('가입시 정보 수집에 동의하는것으로 간주합니다.')
                .setColor('RANDOM')
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            let m = await message.channel.send({
                embed: embed
            });
            await m.react('✅');
            await m.react('❌');
            const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
            const collector = m.createReactionCollector(filter, {
                max: 1
            });
            collector.on('end', async collected => {
                if (collected.first().emoji.name == '✅') {
            await client.db.insertOne({_id: message.author.id, money: 0, level: 0, xp: 0, });
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle('가입 완료!')
                        .setColor('RANDOM')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                    );
                } else {
                    embed.setTitle('가입이 취소되었어요.')
                    .setColor('RANDOM')
                    .setTimestamp()
                    m.edit({
                        embed: embed
                    });
                }
            });
        }
    }
}