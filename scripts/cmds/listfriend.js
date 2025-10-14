const fs = require('fs');

module.exports = {
 config: {
 name: "listfriend",
 version: "1.0",
 role: 2,
 author: "RUBISH",
 shortDescription: {
 en: "See all friend of bot id",
 vi: ""
 },
 longDescription: {
 en: "",
 vi: "show all friend of bot id"
 },
 category: "owner",
 guide: {
 en: "{pn}",
 vi: ""
 }
 },
 onStart: async function ({ api, args, handleReply, event }) {
 const { threadID, messageID } = event;
 if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

 switch (handleReply.type) {
 case "reply":
 {
 let msg = "", name, urlUser, uidUser;
 const arrnum = event.body.split(" ");
 const nums = arrnum.map(n => parseInt(n));
 for (let num of nums) {
 name = handleReply.nameUser[num - 1];
 urlUser = handleReply.urlUser[num - 1];
 uidUser = handleReply.uidUser[num - 1];

 await api.unfriend(uidUser);
 msg += '- ' + name + '\n🌐ProfileUrl: ' + urlUser + "\n";
 }

 await api.sendMessage(`💢Delete Friends💢\n\n${msg}`, threadID);
 await api.unsendMessage(handleReply.messageID);
 }
 break;
 }
 },

 onStart: async function ({ event, api, args }) {
 const { threadID, messageID, senderID } = event;
 try {
 const listFriend = [];
 const dataFriend = await api.getFriendsList();
 const countFr = dataFriend.length;

 for (const friend of dataFriend) {
 listFriend.push({
 name: friend.fullName || "Chưa đặt tên",
 uid: friend.userID,
 gender: friend.gender,
 vanity: friend.vanity,
 profileUrl: friend.profileUrl
 });
 }
 const nameUser = [], urlUser = [], uidUser = [];
 let page = 1;
 page = parseInt(args[0]) || 1;
 page < 1 ? page = 1 : "";
 const limit = 20;
 let msg = `
≛≛ 𝗟𝗜𝗦𝗧 𝗢𝗙 𝗙𝗥𝗜𝗘𝗡𝗗𝗦 ≛≛
 
𝗧𝗢𝗧𝗔𝗟 𝗙𝗥𝗜𝗘𝗡𝗗𝗦 ➔ ${countFr} \n______________________________\n\n`;
 const numPage = Math.ceil(listFriend.length / limit);

 for (let i = limit * (page - 1); i < limit * page; i++) {
 if (i >= listFriend.length) break;
 const infoFriend = listFriend[i];
 msg += `${i + 1}. ${infoFriend.name}\n🙇‍♂️UID: ${infoFriend.uid}\n🧏‍♂️Gender: ${infoFriend.gender}\n❄️username: ${infoFriend.vanity}\n🌐Profile Url: ${infoFriend.profileUrl}\n\n`;
 nameUser.push(infoFriend.name);
 urlUser.push(infoFriend.profileUrl);
 uidUser.push(infoFriend.uid);
 }
 msg += `﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n --> Page ${page}/${numPage} <--\n\ntype .listfriend (page number) to show next page`;

 await api.sendMessage(msg, threadID);

 const data = await api.sendMessage(
 ' ',
 threadID
 );

 await api.unsendMessage(data.messageID);

 await global.client.handleReply.push({
 name: this.config.name,
 author: event.senderID,
 messageID: data.messageID,
 nameUser,
 urlUser,
 uidUser,
 type: 'reply'
 });
 } catch (e) {
 console.error(e);
 }
 }
};