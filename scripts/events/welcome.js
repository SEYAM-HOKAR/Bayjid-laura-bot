const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
        global.temp.welcomeEvent = {};

module.exports = {
        config: {
                name: "welcome",
                version: "1.7",
                author: "NTKhang ( modified my ChatGPT )",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "sáng",
                        session2: "trưa",
                        session3: "chiều",
                        session4: "tối",
                        welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
                        multiple1: "bạn",
                        multiple2: "các bạn",
                        defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
                },
                en: {
                        session1: "morning",
                        session2: "noon",
                        session3: "afternoon",
                        session4: "evening",
                        welcomeMessage: "xᴀss ʙᴏᴛ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 🐝\n\n𝖧𝖾𝗅𝗅𝗈 😻\n𝖧𝖾𝗋𝖾'𝗌 𝗆𝗒 𝗉𝗋𝖾𝖿𝗂𝗑 ( {prefix} )\n𝖴𝗌𝖾 ( {prefix}𝖧𝖾𝗅𝗉 ) 𝗍𝗈 𝗌𝖾𝖾 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌.\n𝖧𝖾𝗋𝖾'𝗌 𝗆𝗒 𝗈𝗐𝗇𝖾𝗋 𝗇𝖺𝗆𝖾 ʙᴀʏᴊɪᴅ\n𝖴𝗌𝖾 {prefix}𝖢𝖺𝗅𝗅𝖺𝖽 𝖿𝗈𝗋 𝖺𝗇𝗒 𝗍𝖾𝖼𝗁𝗇𝗂𝖼𝖺𝗅 𝖾𝗋𝗋𝗈𝗋𝗌 𝗈𝗋 𝖼𝗈𝗇𝗍𝖺𝖼𝗍 𝗆𝖾 𝗈𝗇 𝗌𝗈𝖼𝗂𝖺𝗅 𝗆𝖾𝖽𝗂𝖺:  https://www.facebook.com/YOUR.FATHER.303 \n\n 🦋",
                        multiple1: "you",
                        multiple2: "you guys",
                        defaultWelcomeMessage: "𝙰𝚜𝚜𝚊𝚕𝚊𝚖𝚞𝚊𝚕𝚊𝚒𝚔𝚞𝚖 {userName} 😻\nᴡᴇʟᴄᴏᴍᴇ ʏᴏᴜ ᴛᴏ ᴛʜᴇ ᴄʜᴀᴛ ɢʀᴏᴜᴘ: {boxName} ❤️‍🩹\n\n✿⊱┈──╌✾╌──┈⊰✿\n𝙹𝚞𝚜𝚝 𝚎𝚗𝚓𝚘𝚢 𝚝𝚑𝚒𝚜 𝚖𝚘𝚖𝚎𝚗𝚝𝚜 🖤😸"
                }
        },

        onStart: async ({ threadsData, message, event, api, getLang }) => {
                if (event.logMessageType == "log:subscribe")
                        return async function () {
                                const hours = getTime("HH");
                                const { threadID } = event;
                                const { nickNameBot } = global.GoatBot.config;
                                const prefix = global.utils.getPrefix(threadID);
                                const dataAddedParticipants = event.logMessageData.addedParticipants;
                                // if new member is bot
                                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                                        if (nickNameBot)
                                                api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                                        return message.send(getLang("welcomeMessage", prefix));
                                }
                                // if new member:
                                if (!global.temp.welcomeEvent[threadID])
                                        global.temp.welcomeEvent[threadID] = {
                                                joinTimeout: null,
                                                dataAddedParticipants: []
                                        };

                                // push new member to array
                                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                                // if timeout is set, clear it
                                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                                // set new timeout
                                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                                        const threadData = await threadsData.get(threadID);
                                        if (threadData.settings.sendWelcomeMessage == false)
                                                return;
                                        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                                        const dataBanned = threadData.data.banned_ban || [];
                                        const threadName = threadData.threadName;
                                        const userName = [],
                                                mentions = [];
                                        let multiple = false;

                                        if (dataAddedParticipants.length > 1)
                                                multiple = true;

                                        for (const user of dataAddedParticipants) {
                                                if (dataBanned.some((item) => item.id == user.userFbId))
                                                        continue;
                                                userName.push(user.fullName);
                                                mentions.push({
                                                        tag: user.fullName,
                                                        id: user.userFbId
                                                });
                                        }
                                        //{userName}:   name of new member
                                         //{multiple}:
                                        //{boxName}:    name of group
                                         //{threadName}: name of group
                                         //{session}:    session of day
                                        if (userName.length == 0) return;
                                        let { welcomeMessage = getLang("defaultWelcomeMessage") } =
                                                threadData.data;
                                        const form = {
                                                mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
                                        };
                                        welcomeMessage = welcomeMessage
                                                .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
                                                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                                                .replace(
                                                        /\{multiple\}/g,
                                                        multiple ? getLang("multiple2") : getLang("multiple1")
                                                )
                                                .replace(
                                                        /\{session\}/g,
                                                        hours <= 10
                                                                ? getLang("session1")
                                                                : hours <= 12
                                                                        ? getLang("session2")
                                                                        : hours <= 18
                                                                                ? getLang("session3")
                                                                                : getLang("session4")
                                                );

                                        form.body = welcomeMessage;

                                        if (threadData.data.welcomeAttachment) {
                                                const files = threadData.data.welcomeAttachment;
                                                const attachments = files.reduce((acc, file) => {
                                                        acc.push(drive.getFile(file, "stream"));
                                                        return acc;
                                                }, []);
                                                form.attachment = (await Promise.allSettled(attachments))
                                                        .filter(({ status }) => status == "fulfilled")
                                                        .map(({ value }) => value);
                                        }
                                        message.send(form);
                                        delete global.temp.welcomeEvent[threadID];
                                }, 1500);
                        };
        }
};