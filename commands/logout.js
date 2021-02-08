const Discord = require('discord.js');
module.exports = {
    name: '탈퇴',
    aliases: ['logout', 'out', '안하기'],
    description: '인트 봇 서비스에서 탈퇴해요.',
    usage: '인트야 탈퇴',
    run: async (client, message, args, ops) => {
        if (!(await client.db.findOne({_id: message.author.id}))) {
            message.channel.send('가입되지 않은 유저에요!')
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle('정말 탈퇴할까요?')
                .setDescription('인트 서비스에서 탈퇴합니다.')
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
                    await client.db.deleteOne({_id: message.author.id});
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle('탈퇴 완료!')
                        .setColor('RANDOM')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                    );
                } else {
                    embed.setTitle('탈퇴가 취소되었어요.')
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