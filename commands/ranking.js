const Discord = require('discord.js');
module.exports = {
    name: '랭킹',
    aliases: ['ranking', 'rank', 'fodzld', 'ㄱ무ㅏㅑㅜㅎ', 'ㄱ무ㅏ'],
    description: '현재 랭킹 상태를 보여줘요',
    usage: '인트야 랭킹 [돈/레벨/자신]',
    run: async (client, message, args, ops) => {
        const option = args[1]
        if (!(await client.db.findOne({_id: message.author.id}))) {
            const embed = new Discord.MessageEmbed()
            .setTitle('인트봇의 돈 서비스에 가입되어있지 않아요.')
            .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
            message.channel.send(embed);
        } else {
            if(option == "돈"){
                const showPage = function(page){
                    return client.db.find().sort( { money: -1 } ).skip((page-1)*2).limit(1);
                }
                const embed = new Discord.MessageEmbed()
                    .setTitle('돈 랭킹')
                    .setColor('RANDOM')
                    .addField(`${showPage(2)}`)
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
                message.channel.send(embed);
            }
            else {
                return message.channel.send("`인트야 랭킹 [돈/레벨/자신]` 중 한개를 선택하여 주세요.")
            }
        }
    }
}