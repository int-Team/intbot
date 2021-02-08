const Discord = require('discord.js');
module.exports = {
    name: '초대',
    aliases: ['invite', 'ㅑㅜ퍗ㄷ', 'cheo'],
    description: '봇을 초대 할 수 있어요.',
    usage: '인트야 초대',
    run: async (client, message, args, ops) => {
            message.channel.send(new Discord.MessageEmbed()
            .setTitle('초대장')
            .addField(`아래 링크를 눌러 인트봇을 초대해보세요!`, `[바로가기](https://discord.com/api/oauth2/authorize?client_id=798709769929621506&permissions=3264064&scope=bot)`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        );
    }
}