const { config } = require('dotenv')
const MongoDB = require('mongodb')
const { magenta, reset } = require('../modules/Color')

config()

const DBClient = new MongoDB.MongoClient(
  `mongodb://int:${process.env.DB_PW}@cluster0-shard-00-00.gk8if.mongodb.net:27017,cluster0-shard-00-01.gk8if.mongodb.net:27017,cluster0-shard-00-02.gk8if.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-blbjze-shard-0&authSource=admin&retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

module.exports = {
  async connect() {
    const DBServer = await DBClient.connect()
    module.exports.db.db = DBServer.db('intbot').collection('main')
    module.exports.db.goods = DBServer.db('intbot').collection('goods')
    module.exports.db.dbchannels = DBServer.db('intbot').collection('channels')
    module.exports.db.stock = DBServer.db('intbot').collection('stock')
    module.exports.db.data = DBServer.db('intbot').collection('secrets')
    
    console.log(`[${magenta}Databas${reset}] Connected`)
  },
  db: {},
}