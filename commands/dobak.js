const Discord = require('discord.js');
module.exports = {
    name: '도박',
    aliases: ['dobak' ,'ehqkr' , '112', 'tlsrh'],
    description: '돈을 배팅해서 돈을 벌어요',
    usage: '인트야 돈',
    run: async (client, message, args, ops) => {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        const User = await client.db.findOne({_id: message.author.id}))
        
        if (User.money <= 0) {
            let nomoney = new Discord.MessageEmbed()
                .setDescription("❎  당신은 도박을 할 돈이 없습니다..")
                .setColor("RED")
            return message.reply(nomoney)
        }

        let help = new Discord.MessageEmbed()
            .setDescription(`인트야 도박 <돈>`)
            .setColor("7289DA")
            .setFooter("돈 부분은 무조건 정수로 적어주세요.")

        if (!args[0]) return message.reply(help)

        if (!Number(args[0])) return message.reply(help)

        let gamble = new Discord.MessageEmbed()
            .setDescription(`정말로 \`${args[0]}\` 만큼 도박을 진행하시겠습니까?`)
            .setColor("YELLOW")

        message.reply(gamble).then(async msg => {
            
            await message.react("✅")
            await message.react("❎")

            
            let filterYes = (reaction, user) => reaction.emoji.name === '✅' && user.id == msg.author.id

            
            let collectorYes = message.createReactionCollector(filterYes, { max: 1, time: 60000 }) // max: 1 -> 반응은 한번만, time: 60000 -> 제한시간 60초

            
            collectorYes.on('collect', () => {
                msg.delete()

                // 배율 설정
                let multiplication = getRandomInt(2, 10)

                // 성공하면 받을 금액
                let money = args[0] * multiplication

                // 성공과 실패를 나눌 숫자
                let boolean = getRandomInt(1, 3)

                if (boolean == 1) {
                    let yourmoney = User[msg.author.id].money + money
                    let success = new Discord.MessageEmbed()
                        .setDescription(`당신은 도박을 성공하여 ${multiplication}배 만큼 거신 금액을 얻으셨습니다.\n\n 보유하고 있는 돈: ${yourmoney}`)
                        .setColor("GREEN")
                    message.reply(success)

                    await client.db.updateOne({_id: message.author.id}, {
                            $set: {
                                money: ((await client.db.findOne({_id: message.author.id})).money + money)
                            }
                        });
                } else {
                    
                    let yourmoney = await client.db.findOne({_id: message.author.id}).money - args[0]
                    let fail = new Discord.MessageEmbed()
                        .setDescription(`당신은 도박을 실패하여 거신 금액을 모두 잃었습니다.\n\n 보유하고 있는 돈: ${yourmoney}`)
                        .setColor("RED")
                    message.reply(fail)

                    await client.db.updateOne({_id: message.author.id}, {
                        $set: {
                            money: ((await client.db.findOne({_id: message.author.id})).money - args[0])
                        }
                    });
                }
            })

            collectorYes.on('end', (_, reason) => {
                if (reason === "time") {
                    message.delete()
                    let timeover = new Discord.MessageEmbed()
                        .setDescription("시간이 초과가 되었으니 다시 시도해주세요.")
                        .setColor("RED")
                    message.reply(timeover)
                }
            })

            let filterNo = (reaction, user) => reaction.emoji.name === '❎' && user.id === msg.author.id

            let collectorNo = message.createReactionCollector(filterNo, { max: 1, time: 60000 })
             
            collectorNo.on('collect', () => {
                message.delete()
                let cancel = new Discord.MessageEmbed()
                    .setDescription("도박 진행을 취소하였습니다.")
                    .setColor("RED")
                message.reply(cancel)
            })
        })
    }
}
