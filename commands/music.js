const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const { Util } = require('discord.js');
const youtubesearchapi = require('youtube-search-api');

module.exports = {
    name: '음악',
    aliases: ['music', 'ㅡㅕ냧', 'dmadkr'],
    description: '음악을 재생해요.',
    usage: '인트야 음악 [옵션]',
    run: async (client, message, args, ops) => {
        const command = args[1];
        
        if(command == "음악"){
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!serverQueue) return message.channel.send('지금 재생 중인 음악이 없어요.');
            return message.channel.send(`🎶 지금 재생중인 음악 : **${serverQueue.songs[0].title}**`);
        } else if(command == "멈추기") {
            const serverQueue = message.client.queue.get(message.guild.id);
            if (serverQueue && serverQueue.playing) {
                serverQueue.playing = false;
                serverQueue.connection.dispatcher.pause();
                return message.channel.send('⏸ 음악을 멈췄어요.');
            }
            return message.channel.send('아무 노래도 재생되고 있지 않아요.');
        } else if(command == "재생"){
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('음악 채널에 참가해야 이 명령어를 쓸 수 있어요!');
            const permissions = channel.permissionsFor(message.client.user);
            if (!permissions.has('CONNECT')) return message.channel.send('인트봇의 권한이 부족하여 이 음성 채널에 참가할 수 없어요...');
            if (!permissions.has('SPEAK')) return message.channel.send('인트봇의 권한이 부족하여 이 음성 채널에서 말을 할 수 없어요...');

            const args2 = args.toString();
            let length = args2.length;
            const words = args.slice(2, length)
            youtubesearchapi.GetListByKeyword(words, false).then(async res=> {
                const embed = new Discord.MessageEmbed()
                .setTitle(`${words}의 검색 결과`)
                .addField(`${res.items[0].title}`, `1번째 검색 결과`)
                .addField(`${res.items[1].title}`, `2번째 검색 결과`)
                .addField(`${res.items[2].title}`, `3번째 검색 결과`)
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
                let m = await message.channel.send({
                    embed : embed
                });
                m.react('1️⃣')
                m.react('2️⃣')
                m.react('3️⃣')
                const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '1️⃣' || r.emoji.name == '2️⃣' || r.emoji.name == '3️⃣');
                const collector = m.createReactionCollector(filter, {
                    max: 1
                });
                collector.on('end', async collected => {
                    if (collected.first().emoji.name == '1️⃣') {
                        const songInfo = await ytdl.getInfo(res.items[0].id);
                        songleft(songInfo)
                    } else if (collected.first().emoji.name == '2️⃣') {
                        const songInfo = await ytdl.getInfo(res.items[1].id);
                        songleft(songInfo)
                    } else if (collected.first().emoji.name == '3️⃣') {
                        const songInfo = await ytdl.getInfo(res.items[2].id);
                        songleft(songInfo)
                    }
                })
            })
            const songleft = ('songInfo', async songInfo => {
                const serverQueue = message.client.queue.get(message.guild.id);
                const song = {
                    id: songInfo.videoDetails.video_id,
                    title: Util.escapeMarkdown(songInfo.videoDetails.title),
                    url: songInfo.videoDetails.video_url
                };
        
                if (serverQueue) {
                    serverQueue.songs.push(song);
                    return message.channel.send(`✅ **${song.title}** 가 목록에 추가되었어요!`);
                }
        
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: channel,
                    connection: null,
                    songs: [],
                    volume: 2,
                    playing: true
                };
                message.client.queue.set(message.guild.id, queueConstruct);
                queueConstruct.songs.push(song);
        
                const play = async song => {
                    const queue = message.client.queue.get(message.guild.id);
                    if (!song) {
                        queue.voiceChannel.leave();
                        message.client.queue.delete(message.guild.id);
                        return;
                    }
        
                    const dispatcher = queue.connection.play(ytdl(song.url))
                        .on('finish', () => {
                            queue.songs.shift();
                            play(queue.songs[0]);
                        })
                        .on('error', error => console.error(error));
                    dispatcher.setVolumeLogarithmic(queue.volume / 5);
                    queue.textChannel.send(`🎶 음악이 재생되기 시작했어요: **${song.title}**`);
                };
        
                try {
                    const connection = await channel.join();
                    queueConstruct.connection = connection;
                    play(queueConstruct.songs[0]);
                } catch (error) {
                    console.error(`음악 채널에 들어갈 수 없어요 : ${error}`);
                    message.client.queue.delete(message.guild.id);
                    await channel.leave();
                    return message.channel.send(`음악 채널에 들어갈 수 없어요 : ${error}`);
                }
            })
        } else if (command == "목록" || command == "재생목록"){
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!serverQueue) return message.channel.send('재생 중인 음악이 없어요.');
            return message.channel.send(`
            __**재생목록**__
            
            ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
            
            **지금 재생 중 : ** ${serverQueue.songs[0].title}
            `);
        } else if (command == "다시재생"){
            const serverQueue = message.client.queue.get(message.guild.id);
            if (serverQueue && !serverQueue.playing) {
                serverQueue.playing = true;
                serverQueue.connection.dispatcher.resume();
                return message.channel.send('▶ 음악을 다시 재생했어요!');
            }
            return message.channel.send('재생 중이었던 음악이 없어요.');
        } else if (command == "스킵"){
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('음악 채널에 들어가야 이 명령어를 쓸 수 있어요!');
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!serverQueue) return message.channel.send('스킵할 음악이 없어요.');
            serverQueue.connection.dispatcher.end('스킵됐어요!');
        } else if (command == "끄기"){
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('음악 채널에 들어가야 이 명령을 실행할 수 있어요!');
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!serverQueue) return message.channel.send('재생되고 있는 음악이 없어요.');
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end('음악이 꺼졌어요!');
        } else if (command == "볼륨" || command == "소리"){
            const { channel } = message.member.voice;
            if (!channel) return message.channel.send('음성 채널에 들어가야 이 명령어를 쓸 수 있어요!');
            const serverQueue = message.client.queue.get(message.guild.id);
            if (!serverQueue) return message.channel.send('재생 중인 음악이 없어요.');
            if (!args[2]) return message.channel.send(`현재 볼륨: **${serverQueue.volume}**`);
            if (args[2] > 3) return message.channel.send(`볼륨은 최대 3까지만 올릴 수 있어요.`)
            if (args[2] < 0) return message.channel.send(`볼륨은 최대 0까지만 줄일 수 있어요.`)
            if (args[2] == String) return message.channel.send(`볼륨은 숫자만 가능해요.`) 
            serverQueue.volume = args[2]; // eslint-disable-line
            serverQueue.connection.dispatcher.setVolumeLogarithmic(args[2] / 5);
            return message.channel.send(`볼륨: **${args[2]}**`);
        } else {
            message.channel.send("`인트야 음악 [재생/볼륨/끄기/멈추기/다시재생/스킵/목록/재생목록]` 중 한개를 입력하세요.")
        }
    }
}