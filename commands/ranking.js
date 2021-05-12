const Discord = require('discord.js');
const xpmoney = {
   "돈": { money:-1 },
   "레벨": { level:-1 }
};
const AvailableOptions = ['유저', '자신']

module.exports = {
    name: '랭킹',
    aliases: ['ranking', 'rank', 'fodzld', 'ㄱ무ㅏㅑㅜㅎ', 'ㄱ무ㅏ'],
    description: '현재 랭킹 상태를 보여줘요',
    usage: '인트야 랭킹 [유저/자신]',
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     */
    async run(client, message, args, ops) {
        const option = args[1]
        const userDB = await client.db.findOne({_id: message.author.id});
        
        if (!option)
            
        
        if (option)
            if (!AvailableOptions.includes(option))
                return message.channel.send("`인트야 랭킹` | 인트야 랭킹 [유저/자신]");
            if (!userDB)
                return message.channel.send(new Discord.MessageEmbed()
                .setTitle('인트봇의 돈 서비스에 가입되어있지 않아요.')
                .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
                .setColor('RED')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp());
            if (option == '유저')
        return message.channel.send(await getMyRank(message.author.id, client));
    }
}

/**
 * @param {*} option 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 */
const getRank = async (client, message) => {
    let rankArr = await client.db.find().sort({money: -1}).toArray();
    let fields = [];
    
    for (let user of rankArr) {
        let dsc_user;
        if (client.users.cache.has(user._id))
            dsc_user = client.users.cache.get(user._id);
        
        fields.push({
            name: `${fields.length + 1}. ${dsc_user.username}`,
            value: ``
        });
    }
}


/**
 * @param {Discord.Client} client 
 */
const getMyRank = async (id, client) => {
    let user = await client.users.fetch(id);
    let userDB = await client.db.findOne({_id: id});
    let moneyRankArr = await client.db.find().sort(xpmoney.돈).toArray();
    let levelRankArr = await client.db.find().sort(xpmoney.레벨).toArray();
    let rank = {};

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
    rank.level.count = numberToKorean(userDB.level);
    rank.money.count = numberToKorean(userDB.money);


    let embed = new Discord.MessageEmbed()
        .setTitle(`${user.tag} 님의 랭킹`)
        .setColor('ORANGE')
        .addField(`돈 랭킹: ${rank.money.rank} 위`, `보유자산: ${rank.money.count}원`, false, true)
        .addField(`레벨 랭킹: ${rank.level.rank} 위`, `레벨: ${rank.level.count}`, false, true)
        .setFooter(user.tag, user.displayAvatarURL())
        .setTimestamp();

    return embed;
}

function numberToKorean(number){
    var inputNumber  = number < 0 ? false : number
    var unitWords    = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극']
    var splitUnit    = 10000
    var splitCount   = unitWords.length
    var resultArray  = []
    var resultString = ''

    for (var i = 0; i < splitCount; i++){
        var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i)
        unitResult = Math.floor(unitResult)
        if (unitResult > 0){
            resultArray[i] = unitResult
        }
    }

    for (var a = 0; a < resultArray.length; a++){
        if(!resultArray[a]) continue
        resultString = String(resultArray[a]) + unitWords[a] + ' ' + resultString
    }

    return resultString.replace(/ $/, '')
}