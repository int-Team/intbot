const Discord = require('discord.js');
module.exports = {
    name: '도움',
    aliases: ['help', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
    description: '봇의 도움말을 볼 수 있어요.',
    usage: '인트야 도움 [명령어 이름]',
    run: async (client, message, args, ops) => {
        if (args[1]) {
            let cmd = client.commands.get(args[1]);
            if (!cmd) {
                message.channel.send('해당 명령어가 없어요. `인트야 도움`를 입력해 모든 명령어를 확인해보세요.');
            } else {
                const embed = new Discord.MessageEmbed()
                    .setTitle(cmd.name)
                    .setColor('RANDOM')
                    .addField('Aliases', cmd.aliases.map(x => `\`${x}\``).join(', '))
                    .addField('Description', cmd.description)
                    .addField('Usage(`<>` 안은 필수, `[]` 안은 선택)', cmd.usage)
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp();
                message.channel.send({
                    embed: embed
                });
            }
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle(`${client.user.username} 도움말`)
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
                .setThumbnail(client.user.displayAvatarURL())
                .addField('명령어 목록', client.commands.map(x => `\`${x.name}\``).join(', '))
                .setDescription('자세한 정보는 인트야 도움 <명령어 이름>을 입력해보세요.')
            message.channel.send({
                embed: embed
            });
        }
    }
}