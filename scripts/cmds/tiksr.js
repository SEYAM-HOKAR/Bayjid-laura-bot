const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

module.exports = {
  config: {
    name: "tiksr",
    aliases: ["tikvd"],
    author: "BaYjid",
    version: "1.0.3",
    shortDescription: {
      en: "Play TikTok video by number",
    },
    longDescription: {
      en: "Search and play a TikTok video by providing a keyword.",
    },
    category: "Entertainment",
    guide: {
      en: "{p}tiktok [keyword]",
    },
  },

  onStart: async function ({ api, event, args }) {
    const keyword = args.join(' ');

    if (!keyword) {
      api.sendMessage(
        `⚠️ Please provide a keyword.\n\nExample:\n{p}tiktok funny cats`,
        event.threadID,
        event.messageID
      );
      return;
    }

    const videos = await fetchTikTokVideos(keyword);

    if (!videos || videos.length === 0) {
      api.sendMessage(
        `❌ No TikTok videos found for the keyword: "${keyword}".`,
        event.threadID,
        event.messageID
      );
      return;
    }

    const videoTitles = videos.map((v, i) => `${i + 1}. ${v.title || "No title"}`);
    const message = `🎵 TikTok Search Results for "${keyword}" 🎵\n\n${videoTitles.join('\n')}\n\n👉 Reply with the number of the video you want to play.`;

    const tempFilePath = path.join(os.tmpdir(), `tiktok_${event.senderID}.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(videos, null, 2));

    api.sendMessage(message, event.threadID, (err, info) => {
      if (err) return console.error(err);
      global.GoatBot.onReply.set(info.messageID, {
        commandName: 'tiktok',
        author: event.senderID,
        tempFilePath
      });
    });
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, tempFilePath } = Reply;

    if (event.senderID !== author) return;
    if (!fs.existsSync(tempFilePath)) {
      api.sendMessage("⚠️ Session expired. Please search again.", event.threadID, event.messageID);
      return;
    }

    const videoIndex = parseInt(args[0]);
    if (isNaN(videoIndex) || videoIndex < 1) {
      api.sendMessage("❌ Invalid input. Please reply with a valid number.", event.threadID, event.messageID);
      return;
    }

    try {
      const videos = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));

      if (videoIndex > videos.length) {
        api.sendMessage("⚠️ Please choose a number within the available range.", event.threadID, event.messageID);
        return;
      }

      const selected = videos[videoIndex - 1];
      const videoUrl = selected.play || selected.playAddr || selected.url;

      if (!videoUrl) {
        api.sendMessage("❌ Error: Video URL not found.", event.threadID, event.messageID);
        return;
      }

      api.sendMessage("📥 Downloading video, please wait...", event.threadID, event.messageID);
      const stream = await getStreamFromURL(videoUrl);

      api.sendMessage(
        {
          body: `✅ Here’s your TikTok video:\n\n🎬 Title: ${selected.title || "Untitled"}\n👤 Author: ${selected.author?.unique_id || "Unknown"}`,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error("TikTok Fetch Error:", err);
      api.sendMessage("❌ An error occurred while processing the video. Try again later.", event.threadID, event.messageID);
    } finally {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};

async function fetchTikTokVideos(keyword) {
  const options = {
    method: 'GET',
    url: 'https://tiktok-scraper7.p.rapidapi.com/feed/search',
    params: {
      keywords: keyword,
      region: 'bd',
      count: '10',
      cursor: '0',
      publish_time: '0',
      sort_type: '0'
    },
    headers: {
      'X-RapidAPI-Key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
      'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
    },
  };

  try {
    const res = await axios.request(options);
    return res.data.data?.videos || [];
  } catch (err) {
    console.error("API Error:", err.response?.data || err);
    return [];
  }
}