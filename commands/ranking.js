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
                var rankArr = client.db.sort({money:-1}).limit(5).toArray();
                var discordFields = [];
                var embed = {
                   title: `${option} 랭킹`,
                   color: 'RANDOM',
                   footer: message.author.tag
                }
                for (const i in rankArr) {
                   try {
                      var userInfo = await client.users.fetch(rankArr[i]._id);
                      discordFields.push({name: `${i+1}. ${userInfo.username}`, value: rankArr[i].money + " 원"});
                   } catch (e) {
                      discordFields.push({name: `${i+1}. Unknown User`, value: rankArr[i].money + " 원"});
                   }
                }
                embed.fields = discordFields;
                message.reply({embed});
            }
            else {
                return message.channel.send("`인트야 랭킹 [돈/레벨/자신]` 중 한개를 선택하여 주세요.")
            }
        }
    }
}
const getRank = async option => {
   var rankArr = client.db.sort({money:-1}).limit(5).toArray();
                var discordFields = [];
                var embed = {
                   title: `${option} 랭킹`,
                   color: 'RANDOM',
                   footer: message.author.tag
                }
                for (const i in rankArr) {
                   try {
                      var userInfo = await client.users.fetch(rankArr[i]._id);
                      discordFields.push({name: `${i+1}. ${userInfo.username}`, value: rankArr[i].money + " 원"});
                   } catch (e) {
                      discordFields.push({name: `${i+1}. Unknown User`, value: rankArr[i].money + " 원"});
                   }
                }
                embed.fields = discordFields;
                return embed;
}
