module.exports = {
 config: {
 name: "out",
 author: "BaYjid",
 role: 2, 
 shortDescription: "Make the bot leave the group",
 category: "admin",
 guide: "{pn}"
 },

 onStart: async function ({ api, event }) {
 const threadID = event.threadID;

 // Check if it's a group chat
 const threadInfo = await api.getThreadInfo(threadID);
 if (!threadInfo.isGroup) {
 return api.sendMessage("Apni Nigga 😒", threadID);
 }

 await api.sendMessage("🎀Allah Hafez all✨\n\n..Ami ei GROUP e thakar joggo na..😔", threadID, () => {
 api.removeUserFromGroup(api.getCurrentUserID(), threadID);
 });
 }
};
