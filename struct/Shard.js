const { ShardingManager } = require('discord.js');
require('dotenv').conifg({path: '../.env'})

const shard = new ShardingManager('../app.js', {
  token: process.env.BOT_TOKEN,
  autoSpawn: true
});

shard.on('launch', shard => console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`));

shard.spawn();