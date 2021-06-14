const Discord = require("discord.js");
module.exports = {
  name: "돈수정",
  aliases: ["돈수정", "돈설정", "data", "edit", "수정"],
  description: "돈데이터를 수정합니다",
  usage: "인트야 ",
  category: "개발자",
  run: async (client, message, args) => {
    const userID = message.mentions.members.first()
      ? message.mentions.members.first().id
      : args[1];
    const userDB = await client.db.findOne({ _id: userID });

    if (!client.developers.includes(message.author.id))
      return message.channel.send(
        `${client.user.username} 개발자만 사용할 수 있어요.`
      );
    if (!userID)
      return message.reply(
        `[400] Usage \`인트야 수정 [ID] [set || add || remove || get]\``
      );
    if (!userDB) return message.reply(`[404] ID ${userID} Not Found`);
    const money = Number(args[3]);

    if (["더하기", "add", "더", "ㄷ"].includes(args[2])) {
      await client.db.updateOne(
        { _id: userID },
        {
          $set: {
            money: money + userDB.money,
          },
        }
      );
      await message.reply(`[200] Added to ${userID}`);
    } else if (["빼기", "sub", "빼", "ㅂ", "remove"].includes(args[2])) {
      await client.db.updateOne(
        { _id: userID },
        {
          $set: {
            money: userDB.money - money,
          },
        }
      );
      message.reply(`Subtracted to ${userID}`);
    } else if (["설정", "set", "설", "ㅅ"].includes(args[2])) {
      await client.db.updateOne(
        { _id: userID },
        {
          $set: {
            money: money,
          },
        }
      );
      message.reply(`Setted to ${userID}`);
    }
  },
};
