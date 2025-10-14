const axios = require('axios');

module.exports = {
  config: {
    name: "fbstalk",
    version: "3.0",
    author: "BaYjid",
    role: 0,
    shortDescription: "Advanced Facebook profile lookup",
    longDescription: "Fetch Facebook profile info using UID, profile link, mention, or message reply",
    category: "Utility",
    guide: {
      en: "{p}fbstalk [uid/link/mention/reply]"
    }
  },

  onStart: async function ({ message, api, event, args }) {
    try {
      const apiKey = "xnil69x"; // Replace with your actual API key

      const formatInfo = (label, value) => {
        if (!value || value === "not available") return "";
        return `🔹 ${label}: ${value}\n`;
      };

      const formatArrayInfo = (label, array) => {
        if (!Array.isArray(array) || array.length === 0) return "";
        const items = array.map(item => item.name || item).join(', ');
        return `🔹 ${label}: ${items}\n`;
      };

      const getUID = async (input) => {
        if (/^\d+$/.test(input)) return input; // If input is a UID, return it directly

        if (input.includes("facebook.com")) {
          const username = input.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/]+)/)?.[1];
          if (username) {
            const res = await axios.get(`https://xnilapi-glvi.onrender.com/xnil/fbstalk?username=${username}&key=${apiKey}`);
            return res.data.success ? res.data.id : null;
          }
        }

        if (input.startsWith("@")) {
          const mention = Object.entries(event.mentions).find(([_, name]) => name === input.slice(1));
          return mention ? mention[0] : null;
        }

        return null;
      };

      let targetUID;

      if (event.messageReply) {
        targetUID = event.messageReply.senderID;
      } else if (!args[0]) {
        targetUID = event.senderID;
      } else {
        targetUID = await getUID(args[0]);
      }

      if (!targetUID) {
        return message.reply("❌ Invalid input. Please provide a UID, profile link, mention, or reply to a message.");
      }

      api.sendMessage("🔍 Fetching profile information...", event.threadID);

      const response = await axios.get(`https://xnilapi-glvi.onrender.com/xnil/fbstalk?uid=${targetUID}&key=${apiKey}`);
      const user = response.data;

      if (!user.success) {
        return api.sendMessage("❌ Failed to fetch user data or profile is private", event.threadID);
      }

      let formattedInfo = `🌟 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n━━━━━━━━━━━━━━━━━━━━━\n`;

      // Basic Info
      formattedInfo += formatInfo("🆔 User ID", user.id);
      formattedInfo += formatInfo("👤 Name", user.name);
      formattedInfo += formatInfo("📛 Full Name", 
        [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' '));
      formattedInfo += formatInfo("🔗 Username", user.username);
      formattedInfo += formatInfo("🌐 Profile Link", user.link);

      // Personal Info
      formattedInfo += formatInfo("📝 About", user.about);
      formattedInfo += formatInfo("🎂 Birthday", user.birthday);
      formattedInfo += formatInfo("👫 Gender", user.gender);
      formattedInfo += formatInfo("💑 Relationship", user.relationship_status);
      formattedInfo += formatInfo("📍 Location", user.location);
      formattedInfo += formatInfo("🛕 Religion", user.religion);
      formattedInfo += formatInfo("🏠 Hometown", user.hometown);

      // Education
      if (user.highSchoolName || user.collegeName) {
        formattedInfo += `📚 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻:\n`;
        formattedInfo += formatInfo("🏫 High School", user.highSchoolName);
        formattedInfo += formatInfo("🎓 College", user.collegeName);
      }

      // Arrays
      formattedInfo += formatArrayInfo("🗣️ Languages", user.languages);
      formattedInfo += formatArrayInfo("⚽ Sports", user.sports);
      formattedInfo += formatArrayInfo("🏆 Favorite Teams", user.favorite_teams);
      formattedInfo += formatArrayInfo("🏅 Favorite Athletes", user.favorite_athletes);

      // Additional Info
      formattedInfo += formatInfo("👥 Followers", user.follower);
      formattedInfo += formatInfo("📅 Account Created", 
        user.created_time ? new Date(user.created_time).toLocaleString() : null);
      formattedInfo += formatInfo("🔄 Last Updated", 
        user.updated_time ? new Date(user.updated_time).toLocaleString() : null);

      formattedInfo += `━━━━━━━━━━━━━━━━━━━━━`;

      const attachments = [];
      
      if (user.picture) {
        try {
          const profilePic = await global.utils.getStreamFromURL(user.picture);
          attachments.push(profilePic);
        } catch (e) {
          console.error("Failed to get profile picture:", e);
        }
      }

      if (user.cover) {
        try {
          const coverPhoto = await global.utils.getStreamFromURL(user.cover);
          attachments.push(coverPhoto);
        } catch (e) {
          console.error("Failed to get cover photo:", e);
        }
      }

      await api.sendMessage({
        body: formattedInfo,
        attachment: attachments
      }, event.threadID);

    } catch (error) {
      console.error("FBStalk Error:", error);
      api.sendMessage("⚠️ An error occurred. Please try again later.", event.threadID);
    }
  }
};
