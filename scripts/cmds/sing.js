const { GoatWrapper } = require("fca-liane-utils");
const { config } = global.GoatBot;
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "sing",
    version: "1.0.9",
    author: "BaYjid",
    usePrefix: false,
    category: "🎵 Youtube Song Downloader",
    description: {
      en: "Search and download short YouTube songs (under 10 mins)"
    }
  },

  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(" ");
      if (!query) {
        return message.reply("❌ Please provide a song name or keyword!");
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const searchResponse = await axios.get(
        `${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(query)}`
      );

      const parseDuration = (timestamp) => {
        const parts = timestamp.split(":").map((part) => parseInt(part));
        let seconds = 0;
        if (parts.length === 3) {
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          seconds = parts[0] * 60 + parts[1];
        }
        return seconds;
      };

      const filteredVideos = searchResponse.data.filter((video) => {
        try {
          return parseDuration(video.time) < 600;
        } catch {
          return false;
        }
      });

      if (filteredVideos.length === 0) {
        return message.reply("⭕ No short videos found (under 10 minutes)!");
      }

      const selectedVideo = filteredVideos[0];
      const tempFilePath = path.join(__dirname, "temp_audio.mp3");

      const apiResponse = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${selectedVideo.id}&format=mp3`
      );

      if (!apiResponse.data.downloadLink) {
        throw new Error("⚠ No audio URL found in response");
      }

      const writer = fs.createWriteStream(tempFilePath);
      const audioResponse = await axios({
        url: apiResponse.data.downloadLink,
        method: "GET",
        responseType: "stream"
      });

      audioResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const styledMessage = `
╔════════════════╗
      🎶 Now Playing 🎶
╚════════════════╝

🎧 Title   : ${selectedVideo.title}
⏱ Duration : ${selectedVideo.time}
📺 Channel : ${selectedVideo.channel?.name || "Unknown"}

By —͟͟͞͞💜َ 𝐁𝐚𝐘 𝐣𝐢𝐝-: )•⊰𝟑
`;

      await message.reply({
        body: styledMessage,
        attachment: fs.createReadStream(tempFilePath)
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    } catch (error) {
      console.error(error);
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });