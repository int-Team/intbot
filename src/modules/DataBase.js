const MongoDB = require('mongodb')

module.exports = async (client) => {
  const DBClient = new MongoDB.MongoClient(
    `mongodb://int:${process.env.DB_PW}@cluster0-shard-00-00.gk8if.mongodb.net:27017,cluster0-shard-00-01.gk8if.mongodb.net:27017,cluster0-shard-00-02.gk8if.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-blbjze-shard-0&authSource=admin&retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )

  DBClient.connect().then(async () => {
    client.db = DBClient.db('intbot').collection('main')
    client.goods = DBClient.db('intbot').collection('goods')
    client.dbchannels = DBClient.db('intbot').collection('channels')
    client.stock = DBClient.db('intbot').collection('stock')
    client.data = DBClient.db('intbot').collection('secrets')
    console.log(client.color('yellow', '[Database] ') + 'MongoDB Connected.')
	  
	 
	  
	 if(client.mode == 'hosting') {
		 setInterval(async () => {
			const stock_v = 5000
			const stock_min = stock_v - 2000

			const stocks = await client.stock.find().toArray()
			let stockAvg = 3000
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

			console.log(client.color('gray', '[Stock] ') + 'Update', stockAvg / stocks.length)
		 }, 600000)
	 }
  })
}

function float2int(value) {
  return value | 0
}