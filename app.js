const Discord = require('discord.js');
const MusicClient = require('./struct/Client');
const { Collection } = require('discord.js');
const client = new MusicClient();
const fs = require('fs');
require('dotenv').config();
const ascii = require('ascii-table');
const table = new ascii().setHeading('Command', 'Load Status');
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const axios = require('axios').default;
const config = require("./config.json");
const DB_PW = config.dbpw;
const token = config.token;
const MongoDB = require('mongodb');
const DBClient = new MongoDB.MongoClient(`mongodb+srv://int:${DB_PW}@cluster0.gk8if.mongodb.net/<dbname>?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.db = undefined;
client.dbchannels = undefined;
DBClient.connect().then(() => {
    client.db = DBClient.db('intbot').collection('main');
    client.dbchannels = DBClient.db('intbot').collection('channels');
});

const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
let app = express();
const router = require('./router/main')(app);
const prefix = "인트야"

let port = 8000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/public', express.static('public'));

let server = app.listen(port, () => {
  console.log(`Server on : ${port}`);
})

fs.readdir('./commands/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./commands/${file}`);
            if (pull.name && pull.run && pull.aliases) {
                table.addRow(file, '✅');
                for (let alias of pull.aliases) {
                    client.aliases.set(alias, pull.name);
                }
                client.commands.set(pull.name, pull);
            } else {
                table.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) { 
            table.addRow(file, `❌ -> ${e}`); 
            continue;
        }
    }
    console.log(table.toString());
});
client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}\n-----------------------`);
    setInterval(() => {
        switch (Math.floor(Math.random() * 6)) {
            case 0:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `${client.guilds.cache.size}개의 서버에서 활동중!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 1:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `이 말은 10초마다 바뀐다는 사실을 아셨나요?`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 2:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `명령 받기!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 3:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `심심하면 저와 놀아요!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 4:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `인트봇의 문의/신고는 인트야 서포트!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 5:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `인트야 초대로 인트봇을 자신의 서버에 초대해보세요!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 6:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `인트야 도움`,
                        type: 'PLAYING'
                    }
                });
                break;
        }
    }, 10000);
    setInterval(() => {
        axios.post(`https://api.koreanbots.dev/bots/servers`, {
            servers: client.guilds.cache.size
        }, {
            headers: {
                'Content-Type': "application/json",
                token: require('./config.json').koreanbots
            }
        });
    }, 180000);
});

client.on('message', async message => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (message.author.bot) return;
    if (!(await client.db.findOne({_id: message.author.id}))) return;

    if((await client.db.findOne({_id: message.author.id})).xp >= 100){
        await client.db.updateOne({_id: message.author.id}, {
            $set: {
                level: ((await client.db.findOne({_id: message.author.id})).level + 1),
                xp: ((await client.db.findOne({_id: message.author.id})).xp = 0)
            }
        })
        if(!(await client.dbchannels.findOne({_id: message.guild.id}).alarm)) return;
        message.channel.send(`${(await client.db.findOne({_id: message.author.id})).level}으로 레벨업 하셨습니다.`)
    } else {
        await client.db.updateOne({_id: message.author.id}, {
            $set: {
                xp: ((await client.db.findOne({_id: message.author.id})).xp + 1)
            }
        });
    }
});


client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.substr(prefix.length).trim().split(' ');
    if (client.commands.get(args[0])) {
        client.commands.get(args[0]).run(client, message, args);
    } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args);
    } else {
        let s = 0;
        let sname = undefined;
        let typed = args[0];
        let valids = [];
        for (let x of client.commands.array()) {
            for (let y of x.aliases) {
                valids.push(y);
            }
            valids.push(x.name);
        }
        for (let curr of valids) {
            let cnt = 0;
            let i = 0;
            for (let curlet of curr.split('')) {
                if (curlet[i] && typed.split('')[i] && curlet[i] == typed.split('')[i]) {
                    cnt++;
                }
                i++;
            }
            if (cnt > s) {
                s = cnt;
                sname = curr;
            }
        }
    }

});

client.login(token);
