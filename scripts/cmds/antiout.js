module.exports = {
 config: {
  name: "antiout",
  version: "1.0",
  author: "BaYjid",
  countDown: 5,
  role: 0,
  shortDescription: {
   en: "🛡️ 𝐏𝐫𝐞𝐯𝐞𝐧𝐭 𝐮𝐬𝐞𝐫𝐬 𝐟𝐫𝐨𝐦 𝐥𝐞𝐚𝐯𝐢𝐧𝐠 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩"
  },
  longDescription: {
   en: "🧲 𝐄𝐧𝐚𝐛𝐥𝐞/𝐝𝐢𝐬𝐚𝐛𝐥𝐞 𝐚𝐧𝐭𝐢-𝐨𝐮𝐭 𝐟𝐞𝐚𝐭𝐮𝐫𝐞 𝐭𝐨 𝐚𝐮𝐭𝐨-𝐫𝐞𝐚𝐝𝐝 𝐥𝐞𝐟𝐭 𝐮𝐬𝐞𝐫𝐬"
  },
  category: "🛠️ 𝐀𝐝𝐦𝐢𝐧",
  guide: {
   en: "🔧 {pn} [on|off] - 𝐓𝐮𝐫𝐧 𝐀𝐧𝐭𝐢-𝐨𝐮𝐭 𝐟𝐞𝐚𝐭𝐮𝐫𝐞 𝐎𝐍/𝐎𝐅𝐅"
  }
 },

 langs: {
  en: {
   turnedOn: "✅ 𝐀𝐧𝐭𝐢-𝐨𝐮𝐭 𝐟𝐞𝐚𝐭𝐮𝐫𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐞𝐧𝐚𝐛𝐥𝐞𝐝!",
   turnedOff: "❎ 𝐀𝐧𝐭𝐢-𝐨𝐮𝐭 𝐟𝐞𝐚𝐭𝐮𝐫𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐝𝐢𝐬𝐚𝐛𝐥𝐞𝐝!",
   missingPermission: "⚠️ 𝐒𝐨𝐫𝐫𝐲 𝐛𝐨𝐬𝐬! 𝐈 𝐜𝐨𝐮𝐥𝐝𝐧'𝐭 𝐚𝐝𝐝 %1 𝐛𝐚𝐜𝐤.\n𝐓𝐡𝐞𝐲 𝐦𝐚𝐲 𝐡𝐚𝐯𝐞 𝐛𝐥𝐨𝐜𝐤𝐞𝐝 𝐦𝐞 𝐨𝐫 𝐝𝐢𝐬𝐚𝐛𝐥𝐞𝐝 𝐌𝐞𝐬𝐬𝐞𝐧𝐠𝐞𝐫.",
   addedBack: "🔁 𝐇𝐞𝐲 %1!\n𝐘𝐨𝐮'𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐭𝐨 𝐥𝐞𝐚𝐯𝐞 𝐛𝐨𝐬𝐬'𝐬 𝐠𝐫𝐨𝐮𝐩!\n𝐀𝐝𝐦𝐢𝐧 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝!"
  }
 },

 onStart: async function ({ args, message, event, threadsData, getLang }) {
  if (args[0] === "on") {
   await threadsData.set(event.threadID, true, "data.antiout");
   return message.reply(getLang("turnedOn"));
  } 
  if (args[0] === "off") {
   await threadsData.set(event.threadID, false, "data.antiout");
   return message.reply(getLang("turnedOff"));
  }
  return message.reply("❓ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐲 'on' 𝐨𝐫 'off' 𝐭𝐨 𝐜𝐨𝐧𝐭𝐫𝐨𝐥 𝐀𝐧𝐭𝐢-𝐨𝐮𝐭.");
 },

 onEvent: async function ({ event, api, threadsData, usersData, getLang }) {
  if (event.logMessageType !== "log:unsubscribe") return;

  const antiout = await threadsData.get(event.threadID, "data.antiout");
  if (!antiout) return;

  if (event.logMessageData.leftParticipantFbId === api.getCurrentUserID()) return;

  const name = await usersData.getName(event.logMessageData.leftParticipantFbId);

  try {
   await api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID);
   api.sendMessage(getLang("addedBack", name), event.threadID);
  } catch (err) {
   api.sendMessage(getLang("missingPermission", name), event.threadID);
  }
 }
};