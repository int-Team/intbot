const Discord = require('discord.js');
module.exports = {
    name: '돈',
    aliases: ['money', 'ㅡㅐㅜ됴', 'ehs'],
    description: '현재 가진 돈을 확인해요.',
    usage: '인트야 돈',
    run: async (client, message, args, ops) => {
        if (!(await client.db.findOne({_id: message.author.id}))) {
            const embed = new Discord.MessageEmbed()
            .setTitle('인트의 서비스에 가입되어있지 않아요.')
            .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        } else {
            const embed = new Discord.MessageEmbed()
            .setTitle(`${message.author.tag}님의 돈`)
            .setDescription(`지금 ${(await client.db.findOne({_id: message.author.id})).money}원을 갖고 있어요.`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        }
    }
}
