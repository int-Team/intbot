const { MessageEmbed } = require("discord.js");
const { numberToKorean } = require("../util/index");

module.exports = {
  name: "내주식",
  aliases: ["mystock", "mstock"],
  description: "자신의 주식을 봅니다. 웁니다. 한강으로 갑니다.",
  usage: "인트야 내주식",
  /**
   *
   * @param {*} client
   * @param {import('discord.js').Message} message
   * @param {*} args
   * @param {*} ops
   * @returns
   */
  async run(client, message, args, ops) {
    const user = await client.db.findOne({ _id: message.author.id });

    if (!user) return message.reply("인트 서비스에 가입하지 않았어요!");
    if (!user.stock) return message.reply("주식이 없네요...!");

    let embed = new MessageEmbed()
      .setTitle(`${message.author.tag} 님의 주식`)
      .setColor("GREEN")
      .setTimestamp()
      .setFooter(
        `${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      );

    for (let stock of Object.entries(user.stock)) {
      if (stock[1] == 0) continue;

      const [code, money] = stock;
      const stockDB = await client.stock.findOne({ code: code });
      embed.addField(
        `${code}\u200b`,
        `${numberToKorean(money)} 주 \n${numberToKorean(
          stockDB.money * money
        )} 원`
      );
    }

    return message.reply(embed);
  },
};
