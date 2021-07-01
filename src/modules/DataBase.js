const MongoDB = require('mongodb')
const Stock = require('./Stock')

module.exports = async (client) => {
  const DBClient = new MongoDB.MongoClient(
    `mongodb://int:${process.env.DB_PW}@cluster0-shard-00-00.gk8if.mongodb.net:27017,cluster0-shard-00-01.gk8if.mongodb.net:27017,cluster0-shard-00-02.gk8if.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-blbjze-shard-0&authSource=admin&retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )

  DBClient.connect().then(() => {
    client.db = DBClient.db('intbot').collection('main')
    client.goods = DBClient.db('intbot').collection('goods')
    client.dbchannels = DBClient.db('intbot').collection('channels')
    client.stock = DBClient.db('intbot').collection('stock')
    client.data = DBClient.db('intbot').collection('secrets')

    console.log(client.color('yellow', '[Database] ') + 'MongoDB Connected.')

    setInterval(() => Stock.update(client), 600000)
  })
}