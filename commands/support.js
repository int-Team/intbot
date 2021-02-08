const Discord = require('discord.js');
module.exports = {
    name: '문의',
    aliases: ['신고', '서포트', 'support'],
    description: '봇에게 문의/신고를 할 수 있어요.',
    usage: '인트야 문의',
    run: async (client, message, args, ops) => {
        const content =  `${args.slice(1).join(' ')}`;
        if(!content){
            return message.channel.send("문의 내용을 적어주세요.")
        }
        const embed = new Discord.MessageEmbed()
            .setTitle('문의사항을 보낼까요?')
            .setDescription('(봇 관리자에게 맨션이 가므로 중요한 일에만 문의해주세요.)')
            .addField('내용', `\`\`\`\n${args.slice(1).join(' ')}\n\`\`\``)
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
                client.channels.cache.get("751430821843304500").send(setMention(),{
                    embed: new Discord.MessageEmbed()
                    .setTitle(`${message.author.tag} 문의`)
                    .setDescription(args.slice(2).join(' '))
                    .setThumbnail(message.author.displayAvatarURL())
                    .addField('내용', `\`\`\`\n${args.slice(1).join(' ')}\n\`\`\``)
                    .setColor('RANDOM')
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
                });
                embed.setTitle('문의를 보냈어요.')
                .setColor('RANDOM')
                .setTimestamp()
                await m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('문의 전송이 취소되었어요.')
                .setColor('RANDOM')
                .setTimestamp()
                m.edit({
                    embed: embed
                });
            }
        });
    }
}

function setMention() {
    return "<@687866011013218349>";
}