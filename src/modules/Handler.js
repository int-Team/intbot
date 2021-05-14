const fs = require('fs')

module.exports = async (client, prefix, Modules) => {
  fs.readdir('./src/commands', (err, list) => {
    for (let file of list) {
      try {
        let pull = require(`../commands/${file}`)
        if (pull.name && pull.run && pull.aliases) {
          console.log(`[Handler] ${file} ✅`)
          for (let alias of pull.aliases) {
            client.aliases.set(alias, pull.name)
          }
          client.commands.set(pull.name, pull)
        } else {
          console.error(`[Handler] ${file} ❌ -> Error`)
          continue
        }
      } catch (e) {
        console.error(`[Handler] ${file} ❌ -> ${e}`)
        continue
      }
    }
  })
  client.on('message', async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return
    let args = message.content.substr(prefix.length).trim().split(' ')
		
		
    if (client.status == '정상 운영중...') {
				
      if (client.commands.get(args[0])) {
        client.commands.get(args[0]).run(client, message, args)
      } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args)
      } else {
        let s = 0
        let sname = undefined
        let typed = args[0]
        let valids = []
        for (let x of client.commands.array()) {
          for (let y of x.aliases) {
            valids.push(y)
          }
          valids.push(x.name)
        }
        for (let curr of valids) {
          let cnt = 0
          let i = 0
          for (let curlet of curr.split('')) {
            if (curlet[i] && typed.split('')[i] && curlet[i] == typed.split('')[i]) {
              cnt++
            }
            i++
          }
          if (cnt > s) {
            s = cnt
            sname = curr
          }
        }
      }
			
    } else if(client.status == '점검중') {
      if (message.content.startsWith(prefix + 'dok')) return
      if (client.commands.get(args[0])) {
        return message.channel.send('현재 인트봇이 점검중이며 일부 기능을 이용할수 없습니다.')
      } else if (client.aliases.get(args[0])) {
        return message.channel.send('현재 인트봇이 점검중이며 일부 기능을 이용할수 없습니다.')
      }
    }
		
  })
  Modules.dokdo(client, prefix)
}