module.exports = {
 config: {
 name: "wish",
 version: "1.0.1",
 role: 0,
 author: "BaYjid",
 description: "Send a birthday wish to someone",
 category: "Fun",
 countDown: 5,
 guide: {
 en: "{p}{n} @tagname",
 },
 },

 onStart: async function ({ api, event, args }) {
 const mention = Object.keys(event.mentions);

 if (mention.length === 0) {
 return api.sendMessage("You need to tag someone to wish!", event.threadID, event.messageID);
 }

 const taggedUser = event.mentions[mention[0]];
 api.sendMessage(
 `Dear [ ${taggedUser} ] 🎉 𝘏𝘢𝘱𝘱𝘺 𝘉𝘪𝘳𝘵𝘩𝘥𝘢𝘺! 🎂 🎈 𝘞𝘪𝘴𝘩𝘪𝘯𝘨 𝘺𝘰𝘶 𝘢 𝘥𝘢𝘸 𝘧𝘪𝘭𝘭𝘦𝘥 𝘸𝘪𝘵𝘩 𝘭𝘰𝘷𝘦 ❤️, 𝘭𝘢𝘶𝘨𝘩𝘵𝘦𝘳 😂, 𝘢𝘯𝘥 𝘫𝘰𝘺 🎊. 𝘔𝘢𝘺 𝘵𝘩𝘪𝘴 𝘺𝘦𝘢𝘳 𝘣𝘳𝘪𝘯𝘨 𝘺𝘰𝘶 𝘦𝘯𝘥𝘭𝘦𝘴𝘴 𝘩𝘢𝘱𝘱𝘪𝘯𝘦𝘴𝘴 🌟 𝘢𝘯𝘥 𝘢𝘭𝘭 𝘵𝘩𝘦 𝘴𝘶𝘤𝘤𝘦𝘴𝘴 🏆 𝘺𝘰𝘶 𝘥𝘦𝘴𝘦𝘳𝘷𝘦. 𝘏𝘦𝘳𝘦'𝘴 🍾 𝘵𝘰 𝘢𝘯𝘰𝘵𝘩𝘦𝘳 𝘺𝘦𝘢𝘳 𝘰𝘧 𝘢𝘮𝘢𝘻𝘪𝘯𝘨 𝘮𝘦𝘮𝘰𝘳𝘪𝘦𝘴 🌈 𝘢𝘯𝘥 𝘸𝘰𝘯𝘥𝘦𝘳𝘧𝘶𝘭 𝘢𝘥𝘷𝘦𝘯𝘵𝘶𝘳𝘦𝘴 🚀! 𝘌𝘯𝘫𝘰𝘺 𝘺𝘰𝘶𝘳 𝘴𝘱𝘦𝘤𝘪𝘢𝘭 𝘥𝘢𝘺 🎊 𝘵𝘰 𝘵𝘩𝘦 𝘧𝘶𝘭𝘭𝘦𝘴𝘵! \n —͟͟͞͞💜َ 𝐁𝐚𝐘 𝐣𝐢𝐝-: )•⊰𝟑✨,
 event.threadID,
 event.messageID
 );
 },
 };