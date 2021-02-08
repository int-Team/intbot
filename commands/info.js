const Discord = require('discord.js');
module.exports = {
    name: '정보',
    aliases: ['info', 'ㅑㅜ래', 'wjdqh'],
    description: '유저의 정보를 볼 수 있어요.',
    usage: '인트야 정보',
    run: async (client, message, args, ops) => {
            message.channel.send(new Discord.MessageEmbed()
            .setTitle(`${message.author.tag}님의 정보`)
            .addField(`돈`, `${(await client.db.findOne({_id: message.author.id})).money}`)
            .addField(`채팅 xp`, `${(await client.db.findOne({_id: message.author.id})).xp}/100`)
            .addField(`채팅 레벨`, `${(await client.db.findOne({_id: message.author.id})).level}`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        );
    }
}