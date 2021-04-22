const { ShardingManager } = require('discord.js');
const conifg = require('../config.json')

const shard = new ShardingManager('./app.js', {
  token: conifg.token,
  autoSpawn: true
});

shard.on('launch', shard => console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`));

shard.spawn();