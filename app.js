// Dependencies
const Discord = require('discord.js');
const MusicClient = require('./struct/Client');
const fs = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Command', 'Load Status');
const { DB_PW, token } = require("./config.json");
const MongoDB = require('mongodb');


// Variables 
require('dotenv').config();
const PORT = process.env.PORT || 5001;
const prefix = "인트야";

// Discord bot client
const client = new MusicClient();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();


// Database (mongodb+srv://int:${DB_PW}@cluster0.gk8if.mongodb.net/intbot?retryWrites=true&w=majority)
client.db = undefined;
client.dbchannels = undefined;
const DBClient = new MongoDB.MongoClient(`mongodb+srv://int:${DB_PW}@cluster0.gk8if.mongodb.net/intbot?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
DBClient.connect().then(() => {
    client.db = DBClient.db('intbot').collection('main');
    client.goods = DBClient.db('intbot').collection('goods');
    client.dbchannels = DBClient.db('intbot').collection('channels');
});

// Web
const express = require('express');
const logger = require('morgan');
const session = require('express-session');
const app = express();

// Web: Middlewares
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: "asdfasfmklam3mkm;'MKGH:@90-t",
    resave: false,
    saveUninitialized: true,
}));

require('./router/main')(app, client);

app.listen(PORT, () => {
    console.log(`Server on : ${PORT}`);
})

// Discord bot setting
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
    console.log(`Logged on ${client.user.username}\n-----------------------`);
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
                        name: `접두사는 인트야 입니다!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 3:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `이 봇은 사실 아직 베타 버전이랍니다!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 4:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `인트봇의 문의/신고는 인트야 문의 [내용]!`,
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
    /*
    setInterval(() => {
        if(client.guilds.cache.size !== serverNum){
            axios.post(`https://api.koreanbots.dev/bots/servers`, {
                servers: client.guilds.cache.size
            }, {
                headers: {
                    'Content-Type': "application/json",
                    token: require('./config.json').koreanbots
                }
            });
            serverNum = client.guilds.cache.size;
        } else {
            return
        }
    }, 200000);
    */
});

client.on('message', async message => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    if (message.author.bot) return;

    let user = await client.db.findOne({_id: message.author.id});
    let channel = await client.dbchannels.findOne({_id: message.guild.id});

    if (!user)
        return;
    if(user.xp >= 100){
        await client.db.updateOne({_id: message.author.id}, {
            $set: {
                level: user.level + 1,
                xp: user.xp = 0,
            }
        });
        if(channel.alarm)
            return;
        
        message.channel.send(`${user.level}으로 레벨업 하셨습니다.`);
    } else {
        await client.db.updateOne({_id: message.author.id}, {
            $set: {
                xp: user.xp + 1,
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