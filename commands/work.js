const Discord = require('discord.js');
const fetch = require('node-fetch');
const axios = require('axios').default;
module.exports = {
    name: '일하기',
    aliases: ['노동 ', '일', '알바', 'work', '재가',  ],
    description: '일을하여 돈을 모으세요!.',
    usage: '인트야 일하기',
    run: async (client, message, args, ops) => {
        const koreanbottoken = require('../config.json').koreanbots;
        var workname = ['어떤유저의 컴퓨터를 수리를 하여', '똥같은 웹사이트를 만들어 ', '인트 사살 미션을 성공하여', '뉴스를 적어', 'Docker 컨테이너를 만들어'];
        var randommsg = Math.floor(Math.random() * workname.length);
        let noKbotsAcn
        if (!(await client.db.findOne({_id: message.author.id}))) {
            const embed = new Discord.MessageEmbed()
                .setTitle('인트봇의 돈 서비스에 가입되어있지 않아요.')
                .setDescription('`인트야 가입`을 이용해서 먼저 가입해주세요!')
                .setColor('RED')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            message.channel.send(embed);
        } else {
            axios.get(`https://api.koreanbots.dev/bots/voted/${message.author.id}`, {
                headers: {
                    token: require('../config.json').koreanbots
                }
            }).catch(() => {

            })
            if ((await axios.get(`https://api.koreanbots.dev/bots/voted/${message.author.id}`, {
                headers: {
                    token: require('../config.json').koreanbots
                },
                validateStatus: function (status) {
                    return status == 404 || 200;
                }
            })).data.voted) {
                    if ((await client.db.findOne({_id: message.author.id})).lastGotMoney && new Date() - 1 + 1 - (await client.db.findOne({_id: message.author.id})).lastGotMoney < 300000) {
                        const embed = new Discord.MessageEmbed()
                        .setTitle('워 워 쉬세요 일하다가 죽어요ㅎㅎ')
                        .setDescription(`${(300000 - (new Date() - 1 + 1 - ((await client.db.findOne({_id: message.author.id}))).lastGotMoney)) / 1000|0}초 만 쉬고 오세요 !`)
                        .setColor('RANDOM')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                        return message.channel.send(embed);
                    } else {
                        await client.db.updateOne({_id: message.author.id}, {
                            $set: {
                                lastGotMoney: new Date() - 1 + 1,
                                money: ((await client.db.findOne({_id: message.author.id})).money + 3000)
                            }
                        });
                        const embed = new Discord.MessageEmbed()
                        .setTitle(`당신은 ${workname[randommsg]} 3000원을 벌었습니다.`)
                        .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
                        .setColor('GREEN')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                        return message.channel.send(embed);
                    }
            } else {
                if ((await client.db.findOne({_id: message.author.id})).lastGotMoney && new Date() - 1 + 1 - (await client.db.findOne({_id: message.author.id})).lastGotMoney < 3600000) {
                        const embed = new Discord.MessageEmbed()
                        .setTitle('워 워 쉬세요 일하다가 죽어요ㅎㅎ')
                        .setDescription(`${(3600000 - (new Date() - 1 + 1 - ((await client.db.findOne({_id: message.author.id}))).lastGotMoney)) / 1000|0}초 만 쉬고 오세요 !!\nKOREANBOTS에서 [여기](https://koreanbots.dev/bots/${client.user.id})를 눌러 하트를 추가하면 클타임이 5분이에요!`)
                        .setColor('RED')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                        return message.channel.send(embed);
                    } else {
                        await client.db.updateOne({_id: message.author.id}, {
                            $set: {
                                lastGotMoney: new Date() - 1 + 1,
                                money: ((await client.db.findOne({_id: message.author.id})).money + 3000)
                            }
                        });
                        const embed = new Discord.MessageEmbed()
                        .setTitle(`당신은 ${workname[randommsg]} 3000원을 벌었습니다.`)
                        .setDescription(`현재 보유 금액은 ${(await client.db.findOne({_id: message.author.id})).money}원이에요.`)
                        .setColor('GREEN')
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                        return message.channel.send(embed);
                    }
            }
        }
    }
}