const statusRouter = async (req, res) => {
  const client = req.app.get('discord_client')
  res.status(200).send({
    guilds: client.guilds.cache.size,
    status: client.status,
    users: client.users.cache.size,
  })
}

module.exports = statusRouter