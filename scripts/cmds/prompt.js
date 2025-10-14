module.exports = {
  config:{
    name:'prompt',
    author:'Rexy',
    category:"MEDIA"
  },
  onStart: async ({message,event,args}) => {
    const axios = require("axios");
    const model = args.join("") || 1;
    const api = "https://www.noobs-apis.run.place";
    const url = event.messageReply.attachments[0].url;
    if (!model|| !url) {
      message.reply("required model 1 2 3 4")
    };
const dat = await axios.get(`${api}/nazrul/prompt?url=${encodeURIComponent(url)}&model=${model}`)
message.reply(dat.data.prompt);
  }
}