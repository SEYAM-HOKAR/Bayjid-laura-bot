const axios = require("axios");

module.exports = {
  config: {
    name: "xl",
    version: "2.0",
    author: "BaYjid",
    role: 0,
    category: "image",
    shortDescription: { en: "Anime AI image maker" },
    longDescription: { en: "Turn your words into anime-style images using AI magic~" },
    guide: {
      en: `{pn} <prompt> [--m model] [--n number]
      
Example:
{pn} neko girl --m anime --n 2
{pn} sakura city --n 3
{pn} fantasy forest --m sci_fi
{pn} models → see all models`
    }
  },

  onStart: async ({ api, event, args }) => {
    const { threadID, messageID, pushName } = event;
    const senpai = pushName || "Senpai";

    const models = [
      "anime", "Infinity", "hentai", "animexl", "sci_fi",
      "anime_sci_fi", "x_niji", "xcvd", "fantasy", "hentaiXL",
      "nsfw", "nsfwXL", "anime_2", "anime_3", "animix", "animax"
    ];

    // No args
    if (!args.length) {
      return api.sendMessage(`⚠️ Give me a prompt, ${senpai}~\n💡 Try: neko girl --m anime`, threadID, messageID);
    }

    // Show models
    if (args[0].toLowerCase() === "models") {
      return api.sendMessage(
        `🎨 Available Styles:\n${models.join(", ")}`,
        threadID, messageID
      );
    }

    // Defaults
    let model = models[Math.floor(Math.random() * models.length)];
    let count = 1;
    let prompt = args.join(" ");

    // Model param
    const m = prompt.match(/--m\s+(\S+)/i);
    if (m && models.some(x => x.toLowerCase() === m[1].toLowerCase())) {
      model = models.find(x => x.toLowerCase() === m[1].toLowerCase());
      prompt = prompt.replace(m[0], "").trim();
    }

    // Number param
    const n = prompt.match(/--n\s+(\d+)/i);
    if (n) {
      count = Math.min(4, Math.max(1, parseInt(n[1])));
      prompt = prompt.replace(n[0], "").trim();
    }

    try {
      const start = Date.now();
      const waitMsg = await api.sendMessage(`🎨 Painting your request, ${senpai}...\n⏳ Hold tight~`, threadID);

      // API call
      const res = await axios.get("https://www.noobx-api.rf.gd/api/imagine", {
        params: { prompt, model, num_img: count }
      });

      await api.unsendMessage(waitMsg.messageID);

      if (res.data.status !== "success" || !Array.isArray(res.data.response)) {
        return api.sendMessage(`❌ Couldn't create your art, ${senpai} 😭`, threadID, messageID);
      }

      const time = ((Date.now() - start) / 1000).toFixed(1);
      const attachments = await Promise.all(res.data.response.map(url => global.utils.getStreamFromURL(url)));

      await api.sendMessage({
        body: `✨ Done, ${senpai}!\n🖌️ Model: ${model}\n📸 Images: ${count}\n⏱️ Time: ${time}s`,
        attachment: attachments
      }, threadID);

    } catch (e) {
      console.error(e);
      api.sendMessage(`⚠️ Error occurred, ${senpai}~`, threadID, messageID);
    }
  }
};