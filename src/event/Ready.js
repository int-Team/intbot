module.exports = async (client) => {
  client.on('ready', async () => {
    client.status = '정상 운영중...'
    console.log(`[Bot] Logged on ${client.user.username}`)
    setInterval(() => {
      switch (Math.floor(Math.random() * 6)) {
      case 0:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `${client.guilds.cache.size}개의 서버에서 활동중!`,
            type: 'PLAYING',
          },
        })
        break
      case 1:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '이 말은 10초마다 바뀐다는 사실을 아셨나요?',
            type: 'PLAYING',
          },
        })
        break
      case 2:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '접두사는 인트야 입니다!',
            type: 'PLAYING',
          },
        })
        break
      case 3:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '이 봇은 사실 아직 베타 버전이랍니다!',
            type: 'PLAYING',
          },
        })
        break
      case 4:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '인트봇의 문의/신고는 인트야 문의 [내용]!',
            type: 'PLAYING',
          },
        })
        break
      case 5:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '인트야 초대로 인트봇을 자신의 서버에 초대해보세요!',
            type: 'PLAYING',
          },
        })
        break
      case 6:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: '인트야 도움',
            type: 'PLAYING',
          },
        })
        break
      }
    }, 10000) 
    client.lastStockUpdate = Date.now()
    const stock_v = 5000
    const stock_min = stock_v - 2000

    const stocks = await client.stock.find().toArray()
    let stockAvg = 30000
    client.lastStockUpdate = Date.now()

    for (let stock of stocks) {
      client.stock.updateOne(
        { _id: stock._id },
        {
          $set: {
            money: float2int(Math.random() * (stock_min * -2) + stock_min) + stock_v,
            previous: stock.money,
          },
        }
      )
      stockAvg += stock.money
    }

    console.log('[Stock] Update', stockAvg / stocks.length)
  })
  /*
    setInterval(() => {
        if(client.guilds.cache.size){
            axios.post(`https://api.koreanbots.dev/bots/servers`, {
                servers: client.guilds.cache.size
            }, {
                headers: {
                    'Content-Type': "application/json",
                    token: process.env.KTOKEN
                }
            });
        } else {
            return
        }
    }, 200000);*/
}
function float2int(value) {
  return value | 0
}