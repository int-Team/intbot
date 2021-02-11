const Discord = require('discord.js');
const xpmoney = {
   "돈": {money:-1},
   "레벨": {xp:-1}
};

module.exports = {
    name: '랭킹',
    aliases: ['ranking', 'rank', 'fodzld', 'ㄱ무ㅏㅑㅜㅎ', 'ㄱ무ㅏ'],
    description: '현재 랭킹 상태를 보여줘요',
    usage: '인트야 랭킹 [돈/레벨/자신]',
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     * @param {*} args 
     * @param {*} ops 
     */
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
            if(xpmoney[option] != undefined){
                var embed = await getRank(option, client, message);
                console.log(embed);
                return message.channel.send({embed});
            } else if (option == "자신") {
                var embed = await getMyRank(message.author.id, client);
                return message.channel.send(embed);
            } else {
                return message.channel.send("`인트야 랭킹 [돈/레벨/자신]` 중 한개를 선택하여 주세요.")
            }
        }
    }
}

/**
 * 
 * @param {*} option 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 */
const getRank = async (option, client, message) => {
    var rankArr = await client.db.find().sort(xpmoney[option]).limit(5).toArray();
    var 단위, 돈이야뭐야;
    if (option == "돈") {
        단위 = "원";
        돈이야뭐야 = "money";
    } else {
        단위 = "경험치";
        돈이야뭐야 = "xp";
    }
    var discordFields = [];


    for (var i in rankArr) {
        i = Number(i);
        try {
            var userInfo = await client.users.fetch(rankArr[i]._id);
            discordFields.push({name: `${i+1}. ${userInfo.username}`, value: rankArr[i][돈이야뭐야] + " " + 단위});
        } catch (e) {
            discordFields.push({name: `${i+1}. Unknown User`, value: rankArr[i][돈이야뭐야] + " " + 단위});
        }
    }

    var embed = {
        title: `${option} 랭킹`,
        color: 'RANDOM',
        fields: discordFields,
        timestamp: new Date(),
        footer: {
            text: `${message.author.tag}`,
            icon_url: `${message.author.displayAvatarURL({
                dynamic: true
            })}`,
        },
    }
    return embed;
}


/**
 * @param {Discord.Client} client 
 */
const getMyRank = async (id, client) => {
    var user = await client.users.fetch(id);
    var moneyRankArr = await client.db.find().sort(xpmoney.돈).toArray();
    var levelRankArr = await client.db.find().sort(xpmoney.레벨).toArray();
    var rank = {};
    rank.level = {};
    rank.money = {};
    rank.money.rank = moneyRankArr.findIndex(e => {
        return e._id == id;
    })
    rank.level.rank = levelRankArr.findIndex(e => {
        return e._id == id;
    })
    rank.level.rank += 1;
    rank.money.rank += 1;
    rank.level.count = await (await client.db.findOne({_id: id})).xp;
    rank.money.count = await (await client.db.findOne({_id: id})).money;


    var embed = new Discord.MessageEmbed()
    .setTitle(`${user.tag} 님의 랭킹`)
    .setColor('RANDOM')
    .addField(`돈 랭킹: ${rank.money.rank} 위`, `보유자산: ${rank.money.count}`, false, true)
    .addField(`레벨 랭킹: ${rank.level.rank} 위`, `경험치: ${rank.level.count}`, false, true)
    .setFooter(user.tag, user.displayAvatarURL())
    .setTimestamp();

    return embed;
}