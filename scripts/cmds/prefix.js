const fs = require("fs-extra");
const { utils } = global;

module.exports = {
    config: {
        name: "prefix",
        version: "1.6",
        author: "BaYjid",
        countDown: 5,
        role: 0,
        description: "Change bot prefix in your group or globally",
        category: "config",
        guide: {
            en: "{pn} <new prefix>: change prefix in this group\n"
                + "{pn} <new prefix> -g: change global prefix (admin only)\n"
                + "{pn} reset: reset prefix to default"
        }
    },

    langs: {
        en: {
            reset: "✅ Prefix has been reset to default:\n➡️ System prefix: %1",
            onlyAdmin: "⛔ You must be an admin to change the global prefix!",
            confirmGlobal: "⚙️ Global prefix change requested!\n🪄 React to confirm.",
            confirmThisThread: "🛠️ Group prefix change requested!\n🪄 React to confirm.",
            successGlobal: "✅ Global prefix successfully updated!\n🆕 New prefix: %1",
            successThisThread: "✅ Group prefix successfully updated!\n🆕 New prefix: %1"
        }
    },

    onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
        if (!args[0]) return message.reply("❌ Wrong usage! Example: prefix !");

        // Reset prefix
        if (args[0] === "reset") {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(`✨ ${getLang("reset", global.GoatBot.config.prefix)}`);
        }

        const newPrefix = args[0];
        const formSet = {
            commandName,
            author: event.senderID,
            newPrefix,
            setGlobal: args[1] === "-g"
        };

        if (formSet.setGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

        const confirmMsg = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

        return message.reply(`💌 ${confirmMsg}`, (err, info) => {
            if (!global.GoatBot.onReaction) global.GoatBot.onReaction = new Map();
            formSet.messageID = info.messageID;
            global.GoatBot.onReaction.set(info.messageID, formSet);
        });
    },

    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author) return;

        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
            return message.reply(`🌟 ${getLang("successGlobal", newPrefix)}`);
        } else {
            await threadsData.set(event.threadID, newPrefix, "data.prefix");
            return message.reply(`🌟 ${getLang("successThisThread", newPrefix)}`);
        }
    },

    onChat: async function ({ event, message }) {
        if (event.body && event.body.toLowerCase() === "prefix") {
            const systemPrefix = global.GoatBot.config.prefix;
            const groupPrefix = utils.getPrefix ? utils.getPrefix(event.threadID) : systemPrefix;

            const dateTime = new Date().toLocaleString("en-US", {
                timeZone: "Asia/Dhaka",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            const [datePart, timePart] = dateTime.split(", ");

            const botTitle = "🅿︎𝗿𝗲𝗳𝗶𝘅 𝙼𝗮𝗻𝗮𝗴𝗲𝗿";

            const infoBox = `
╔════ ${botTitle} ════╗
🌐 System Prefix : » ${systemPrefix} «
💬 Group Prefix  : » ${groupPrefix} «
🕒 Time          : ${timePart}
📅 Date          : ${datePart}
╚═══════════════════╝`;

            return message.reply(infoBox);
        }
    }
};