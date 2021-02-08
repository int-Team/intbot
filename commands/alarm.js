const Discord = require('discord.js');
module.exports = {
    name: '알림',
    aliases: ['dkffla', 'alarm'],
    description: '알림의 기능을 키거나 해제해요.',
    usage: '인트야 알림 [옵션]',
    run: async (client, message, args, ops) => {
        const option = args[1];
        if (!(await client.dbchannels.findOne({_id: message.guild.id}))) {
            await client.dbchannels.insertOne({_id: message.guild.id, alarm: true });
        } else {
            if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                return message.reply("관리자 권한이 없는 사람은 이 명령어를 실행할 수 없습니다.").then(m => m.delete(5000));
            }
            if(option == "끄기") {
                await client.dbchannels.updateOne({guildID: message.guild.id}, {
                    $set: {
                        alarm: false,
                    }
                })
                message.channel.send(`알림을 껐습니다. 다시 키려면 \`인트야 알림 켜기\`를 사용하여 주세요.`)
            } else if(option == "켜기"){
                await client.dbchannels.updateOne({guildID: message.guild.id}, {
                    $set: {
                        alarm: true,
                    }
                })
                message.channel.send(`알림을 켰습니다. 다시 끄려면 \`인트야 알림 끄기\`를 사용하여 주세요.`)
            } else {
                message.channel.send('인트야 알림 [켜기/끄기] 중 하나로 말해주세요.')
            }
        }
    }
}