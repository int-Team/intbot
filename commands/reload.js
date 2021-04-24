const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: '리로드',
    aliases: ['새로고침', 'flfhem', 'reload'],
    description: '명령어 새로고침을 합니다',
    usage: '인트야 리로드',
    run: async (client, message, args, config) => {
        if (!client.developers.includes(message.author.id)) return;
        const embed = new Discord.MessageEmbed()
            .setTitle(`${client.emojis.cache.find(x => x.name == 'loading')} 리로드 중`)
            .setThumbnail(client.user.displayAvatarURL({
                dynamic: true,
                format: 'jpg',
                size: 2048
            }))
            .addField('커멘드 파일 로드 상태', `${client.emojis.cache.find(x => x.name == 'loading')} 리로드 중`)
            .setColor(0xffff00)
            .setFooter(message.author.tag, message.author.avatarURL({
                dynamic: true
            }))
            .setTimestamp()
        let m = await message.channel.send(embed);
        fs.readdir('./commands/', async function (_err, list) {
            client.commands.clear();
            client.aliases.clear(); 
            var i = 0;
            for (let x of list) {
                i++;
                delete require.cache[require.resolve(`${__dirname}/${x}`)];
                let pull = require(`./${x}`);
                if (pull.name) {
                    for (let aliases of pull.aliases) {
                        client.aliases.set(aliases, pull.name);
                    }
                    client.commands.set(pull.name, pull);
                }
            }
                console.log(`[System] Reloaded `)            
                embed.spliceFields(0, 1)
                    .addField('커멘드 파일 로드 상태', `${client.emojis.cache.find(x => x.name == 'verified')} 리로드 완료(${list.length}개)`)
                    .setTitle('리로드가 완료되었어요.')
                    .setColor("GREEN")
                await m.edit(embed);
        });
    }
}