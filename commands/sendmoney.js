const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');


const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
module.exports = {
    name: '송금',
    aliases: ["ㄴ둥", "송금", "주기", "send"],
    usage: '인트야 송금',
    run: async (client, message, args, ops) => {
        if (args[1] == undefined || args[2] == undefined || isNaN(args[2]) || Number(args[2]) < 0 || Number(args[2]) == Infinity) {
            return message.reply('사용법: ```인트야 송금 @멘션 (0 이상의 숫자 Infinity 미만)```');
        }


        const userID = args[1].replace(/[<@!]/g, '').replace('>', '');
		let count = Number(args[2]) ;
		let toUserDB = await client.db.findOne({_id: userID});
        let meUserDB = await client.db.findOne({_id: message.author.id});
        if (userID == message.author.id) return message.reply(new MessageEmbed()
                .setColor("YELLOW")
                .setDescription(`자기 자신에게 돈을 보내는건 올바르지 않아요...`)
                .setTimestamp()
                .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
                    dynamic: true,
                })));
        try {
            if (toUserDB && meUserDB) {
                
                var dscUSER = await client.users.fetch(userID);
                let total = meUserDB.money - count;
                if (total < 0) {
                    return message.reply(new MessageEmbed()
                    .setTitle('돈이 부족합니다').setTimestamp()
                    .setColor("RED")
                    .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
                        dynamic: true,
                    })))
                }
                let embed = new MessageEmbed()
                .setTitle('정말로 송금할까요?')
                .setColor("YELLOW")
                .setDescription(`${dscUSER.tag} 님 에게 ${count} 만큼의 돈을 주고 ${total} 만큼의 이 남습니다! 수수료로 200원이 차감됩니다.`)
                .setTimestamp()
                .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
                    dynamic: true,
                }))
                let chkMsg = await message.channel.send({
                embed: embed
                })
                chkMsg.react('✅').then(() => chkMsg.react('❌'))

                const filter = (reaction, user) => {
                    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                chkMsg.awaitReactions(filter, { max: 1 })
                .then(collected => {
                    const reaction = collected.first();
            
                    if (reaction.emoji.name === '✅') {
                        client.db.findOneAndUpdate({_id: message.author.id}, {
                            $set: {
                                money: total - 200
                            }
                        })
                        client.db.findOneAndUpdate({_id: userID}, {
                            $set: {
                                money: toUserDB.money + count
                            }
                        })
                        embed.setTitle("송금ㅣ성공")
                        .setDescription(`성공적으로 유저에게 돈을 보냈습니다`)
                        .addField(`${dscUSER.tag}`, `${toUserDB.money + count} money`)
                        .addField(`${message.author.tag}`, `${total - 200} money`)
                        .setColor("GREEN")
                        .setFooter(`${message.author.tag}\u200b`, message.author.displayAvatarURL({
                            dynamic: true,
                        }))
                        .setTimestamp();
                        chkMsg.edit({
                        embed: embed
                        })
                    } else {
                        embed.setTitle("송금ㅣ취소")
                        .setDescription(`송금을 취소되었습니다.`)
                        
                        chkMsg.edit({
                          embed: embed
                        })
                    }
                })
                .catch(collected => {
                    embed.setTitle("송금ㅣ취소")
                        .setDescription(`송금을 취소되었습니다.`)
                        
                        chkMsg.edit({
                          embed: embed
                        })
                    console.log(collected);
                });
            } else {
                return message.reply(`인트 돈시스템에 가입하지 않았습니다.`);
            }
        } catch (e) {
            console.log(e);
            client.channels.cache.get("752710841513672714").send(new MessageEmbed()
                .setTitle('ERRORㅣ돈보내기')
                .setColor("RED")
                .addField(`요청인`, `${message.author.tag}(${message.author.id})`)
                .addField(`오류내용`, e.toString())
                .setTimestamp()
                .setFooter(`${message.author.tag}`)
            )
            return message.reply("에러가 난것 같아요, 잠깐만요..");
        }
    }
}