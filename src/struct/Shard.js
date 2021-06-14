const { ShardingManager } = require("discord.js");
require("dotenv").config();

const shard = new ShardingManager("./src/index.js", {
  token: process.env.BOT_TOKEN,
  autoSpawn: true,
});

shard.on("launch", (shard) =>
  console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`)
);

shard.spawn();
