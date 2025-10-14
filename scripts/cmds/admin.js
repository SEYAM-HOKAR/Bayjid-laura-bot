const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "1.7",
    author: "BaYjid",
    countDown: 5,
    role: 3,
    description: {
      vi: "Thêm, xóa, sửa quyền admin",
      en: "Add, remove, edit admin role"
    },
    category: "box chat",
    guide: {
      vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng'
          + '\n          {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng'
          + '\n          {pn} [list | -l]: Liệt kê danh sách admin',
      en: '   {pn} [add | -a] <uid | @tag>: Add admin role for user'
          + '\n          {pn} [remove | -r] <uid | @tag>: Remove admin role of user'
          + '\n          {pn} [list | -l]: List all admins'
    }
  },

  langs: {
    vi: {
      added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
      alreadyAdmin: "\n⚠ | %1 người dùng đã có quyền admin từ trước:\n%2",
      missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
      removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
      notAdmin: "⚠ | %1 người dùng không có quyền admin:\n%2",
      missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
      listAdmin: "ADMIN LIST\n\n%2\n\nTotal Admins: %1"
    },
    en: {
      added: "✅ | Added admin role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already have admin role:\n%2",
      missingIdAdd: "⚠ | Please enter ID or tag user to add admin role",
      removed: "✅ | Removed admin role of %1 users:\n%2",
      notAdmin: "⚠ | %1 users don't have admin role:\n%2",
      missingIdRemove: "⚠ | Please enter ID or tag user to remove admin role",
      listAdmin: "ADMIN LIST\n\n%2\n\nTotal Admins: %1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    // Helper function to safely write config
    const saveConfig = () => {
      if (global.client?.dirConfig) writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    };

    switch (args[0]?.toLowerCase()) {
      case "add":
      case "-a": {
        if (!args[1] && Object.keys(event.mentions || {}).length === 0 && !event.messageReply)
          return message.reply(getLang("missingIdAdd"));

        let uids = [];
        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        config.adminBot.push(...notAdminIds);
        saveConfig();

        const getNames = await Promise.all(uids.map(uid =>
          usersData.getName(uid).then(name => ({ uid, name })).catch(() => ({ uid, name: "Unknown" }))
        ));

        return message.reply(
          (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(u => `• ${u.name} (${u.uid})`).join("\n")) : "")
          + (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1] && Object.keys(event.mentions || {}).length === 0 && !event.messageReply)
          return message.reply(getLang("missingIdRemove"));

        let uids = [];
        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid)) adminIds.push(uid);
          else notAdminIds.push(uid);
        }

        // Remove admins safely
        for (const uid of adminIds) {
          const index = config.adminBot.indexOf(uid);
          if (index !== -1) config.adminBot.splice(index, 1);
        }

        saveConfig();

        const getNames = await Promise.all(adminIds.map(uid =>
          usersData.getName(uid).then(name => ({ uid, name })).catch(() => ({ uid, name: "Unknown" }))
        ));

        return message.reply(
          (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(u => `• ${u.name} (${u.uid})`).join("\n")) : "")
          + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        if (!config.adminBot.length) return message.reply("⚠ | No admins configured yet.");

        const getNames = await Promise.all(
          config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })).catch(() => ({ uid, name: "Unknown" })))
        );

        const fancyHeader = `👑 | 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧𝐬 & 𝐎𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐬 | 👑\n___________________`;

        const ownerUID = config.adminBot[0]; // first admin as owner
        const owner = getNames.find(e => e.uid === ownerUID);
        const ownerBlock = `⌬| ${owner?.name || "Unknown"}\n╰=> ${owner?.uid || "N/A"}`;

        const otherAdmins = getNames.filter(e => e.uid !== ownerUID);
        const formattedOps = otherAdmins.map(({ uid, name }) =>
          `⌬| ${name}\n╰=> ${uid}`
        ).join("\n");

        const finalList =
          `${fancyHeader}\n♕︎| 𝐎𝐖𝐍𝐄𝐑\n____________\n${ownerBlock}\n_________________________\n♲︎| 𝐎𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐬\n____________\n${formattedOps}\n_________________________`;

        return message.reply(finalList);
      }

      default:
        return message.reply("⚠ | Invalid syntax. Use add/remove/list.");
    }
  }
};