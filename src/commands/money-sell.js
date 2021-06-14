const { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");

async function find(str, client) {
  var s = await client.stock.find().toArray();
  return s.filter(
    (r) => r._id.includes(str) || r.name.includes(str) || r.code.includes(str)
  );
}

const numberWithCommas = (x) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

module.exports = {
  name: "매도",
  aliases: ["aoeh", "sell"],
  description: "떡상 하셨다면 판매를 하세요.",
  usage: "인트야 매도 <주식>",
  run: async (client, message, args, ops) => {
    let stock_result = await find(args[1], client);

    if (!args[1]) return message.reply("사용법```인트야 매도 [주식] [수량]```");
    if (!args[2]) return message.reply("사용법```인트야 매도 [주식] [수량]```");
    if (!stock_result[0]) return message.reply("해당 주식이 없습니다");

    let user = await client.db.findOne({ _id: message.author.id });
    let stock = await client.stock.findOne({ _id: stock_result[0]._id });

    if (!user.stock)
      return message.reply(
        "이런! 주식을 사지 않은거 같은데.. `인트야 주식`을 보고 `인트야 매수 [주식 이름] [수량]`로 주식을 사보세요!"
      );
    if (!user.stock[stock.code])
      return message.reply("해당 주식을 가지고 있지 않아요!");

    let 팔려고하는주식_수량 = 0;
    let 팔려고하는주식_돌려받을금액 = 0;
    let 남은주식 = 0;
    let 돈_잔고 = 0;
    if (["전부", "올인", "모두", "all", "올"].includes(args[2])) {
      팔려고하는주식_수량 = user.stock[stock.code];
      팔려고하는주식_돌려받을금액 = user.stock[stock.code] * stock.money;
      남은주식 = 0;
      돈_잔고 = user.money + 팔려고하는주식_돌려받을금액;
    } else if (["반인", "반", "half", "핲", "하프"].includes(args[2])) {
      팔려고하는주식_수량 = Math.floor(user.stock[stock.code] / 2);
      팔려고하는주식_돌려받을금액 = 팔려고하는주식_수량 * stock.money;
      남은주식 = user.stock[stock.code] - 팔려고하는주식_수량;
      돈_잔고 = user.money + 팔려고하는주식_돌려받을금액;
    } else {
      if (isNaN(args[2]))
        return message.reply("사용법```인트야 매도 [주식] [수량]```");
      args[2] = Number(args[2]);
      if (args[2] >= Infinity)
        return message.reply("사용법```인트야 매도 [주식] [수량]```");
      if (args[2] - user.stock[stock.code] < 0)
        return message.reply("주식이 부족해요!");

      팔려고하는주식_수량 = args[2];
      팔려고하는주식_돌려받을금액 = 팔려고하는주식_수량 * stock.money;
      남은주식 = user.stock[stock.code] - 팔려고하는주식_수량;
      돈_잔고 = user.money + 팔려고하는주식_돌려받을금액;
    }

    const chkSell = new MessageEmbed()
      .setTitle("🧾청구서")
      .setDescription(
        `매도하려는 주식 : ${stock_result[0].name}\n수량 : ${numberWithCommas(
          팔려고하는주식_수량
        )}\n받을 금액 : ${numberWithCommas(
          팔려고하는주식_돌려받을금액
        )} :coin:\n계속하시려면 💳 이모지로 반응하세요.`
      )
      .setTimestamp()
      .setColor("YELLOW")
      .setFooter(
        `${message.author.tag}\u200b`,
        message.author.displayAvatarURL({
          dynamic: true,
        })
      );

    const ask = await message.channel.send(chkSell);
    const filter = (reaction, u) =>
      reaction.emoji.name === "💳" && u.id === message.author.id;

    ask.react("💳");
    ask
      .awaitReactions(filter, { max: 1, time: 10000, error: ["time"] })
      .then(async (collected) => {
        const emoji = collected.first().emoji;

        let embed = new MessageEmbed();
        if (emoji.name === "💳") {
          embed
            .setTitle("💳 판매완료")
            .setDescription(
              `주식 : ${stock_result[0].name}\n수량 : ${numberWithCommas(
                팔려고하는주식_수량
              )}주\n받을 금액 : ${numberWithCommas(
                팔려고하는주식_돌려받을금액
              )} :coin:\n잔고 : ${numberWithCommas(돈_잔고)} :coin:`
            )
            .setColor("GREEN")
            .setTimestamp();

          user.stock[stock.code] -= Number(팔려고하는주식_수량);

          await client.db.updateOne(
            { _id: message.author.id },
            {
              $set: {
                money: 돈_잔고,
                stock: user.stock,
              },
            }
          );
          ask.edit(embed);
        }
      })
      .catch((e) => {
        console.log(e);
        let embed = new MessageEmbed()
          .setTitle("시간 초과")
          .setDescription("판매가 취소 되었습니다.")
          .setColor("RED")
          .setTimestamp();

        ask.edit(embed);
      });
  },
};
