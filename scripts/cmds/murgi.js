module.exports.config = {
    name: "murgi",
    version: "1.3",
    role: 2,
    get author() {
        return "BaYjid";
    },
    description: "বন্ধুকে বারবার ট্যাগ করে স্প্যাম গালি দেওয়া যায়।",
    category: "nsfw",
    guide: "please @mention on/off",
    coolDown: 10
};

const timers = new Map();

module.exports.onStart = async function ({ api, args, event }) {
    if (args[0] && args[0].toLowerCase() === "off") {
        if (timers.has(event.threadID)) {
            timers.get(event.threadID).forEach(t => clearTimeout(t));
            timers.delete(event.threadID);
            return api.sendMessage("✅ চুদা বন্ধ করা হইছে ভাইজান।", event.threadID);
        } else {
            return api.sendMessage("❌ চালু ছিলোই না!", event.threadID);
        }
    }

    const mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("⚠️ দয়া করে কাউকে @mention করুন!", event.threadID);

    const name = event.mentions[mention];
    const arraytag = [{ id: mention, tag: name }];
    const a = (m) => api.sendMessage(m, event.threadID);

    if (timers.has(event.threadID)) {
        timers.get(event.threadID).forEach(t => clearTimeout(t));
        timers.delete(event.threadID);
    }

    const messages = [
        "____এস এস সি এক্সামে ফেল করার ওপরাধে তোর মাকে শিক্ষা মন্ত্রির সাথে ফালাইয়া চু*দি-!!🫦👅💦💯দ... " + name,
        " খানকির পুলা মাদারচোদ বেশ্যার সন্তান বাইনচোদ,আমি জ্ঞান হারাবো তোর মারে এমোন চুদা  চুদেই যাবো আটকাতে পারবে না কেউ -:)🖤🥀ইয়া... " + name,
        "____তোর মার প্রতি অভিযোগ রাখার চাইতে তোর মাকে ষুদে মেরে ফেলা উত্তম-:)💚🌻💦😊💯তোর মায়রে ষুদি ধন্যবাদ😊🎀দি... " + name,
        " _____দুই হক্কে দুই,,  তর মার পুটকিতে ডুকামু চোক্কা চোক্কা সুই-))!!😿💚👄🌻👩‍❤️‍💋‍👨💯.. " + name,
        "- 𝗧𝗵𝗶𝘀 𝗮𝗯𝗼𝘂𝘁 𝗹𝗶𝗻𝗲':-(🍒👄💙💦︵۵♡তোর বুইড়া মার ভোদা'য় ক্যান্সার হোক আমিন༉࿐ 🤗🫦🥺🌻🪄 " + name,
        "__'🍒🌸 কিরে মাগি শুনলাম তুই নাকি চুদা খাওয়া মাল !🐸😥💫.. " + name,
        "এক বস্তা মরিচ নিয়ে সুজা তোর মার ভোঁদায় ডুকে জামু...!!😔🙏🫦💦✍️💯. " + name,
        "... " + name,
        "____তুর মার গুদ এ আবাসিক হোটেল এর  পিলার ঢুকাবো:)🌻💚💦👄💯... " + name,
        "_______আমি জ্ঞান হারাবো তোর মারে চুদেই যাবো আটকাতে পারবে না কেউ..!!👩‍❤️‍👨😻🖤🍒🚶‍♀️💯... " + name,
        "-তোর মার মুখে থালা বাসুন ডুখাইয়া দিমু বেশ্যার পোলা-!" + name,
        "___________ তোর মারে চাঁদের দেশে নিয়ে গিয়ে গুয়া মারি শুয়োরের বাচ্চা-<]]!!🫦🤰💚💯 " + name,
        "____তোর মাকে গ্রীন লাইন গাড়ির ছাদের উপর ফালিয়ে ভোদার উপর পাড়া দিয়া চুদবো-))!!💦👄🐰💚🌻💯" + name,
        "_____তোর মারে ডুবন্ত টাইটানিক জাহাজের ভাংগা জানালায় বাইন্ধা ষুদিহ্ যেন পালাতে না পারে-))!!💚🌻👩‍❤️‍💋‍👨👄💯" + name,
        "____এস এস সি এক্সামে ফেল করার ওপরাধে তোর মাকে শিক্ষা মন্ত্রির সাথে ফালাইয়া চুদি-!!🫦👅💦💯" + name,
        "____চুদার নাম যদি হয় সহবাস-  তোর মারে চুদে যাবো  12 মাস-))!!💚🌻👄💦💯" + name,
        "আমি পাগল নই তবুও তর মাকে পাগলের মতো চুদিহহহ!!....😡💏💚💦🌻💯" + name,
        "- বিরিয়ানি লোব দেখিয়ে তর মায়রে চুদি ধন্যবাদ  -!!-🌻😽👩‍🦯" + name,
        "______ তোর মার ভোদায় মলম লাগাই থাপরাই থাপরাই চুদিহ্- 😿😍👄💚💯" + name
    ];

    const delayGap = 3000;
    const timeouts = [];


    a({ body: messages[0], mentions: arraytag });


    for (let i = 1; i < messages.length; i++) {
        timeouts.push(setTimeout(() => {
            a({ body: messages[i], mentions: arraytag });
        }, delayGap * i));
    }

    timers.set(event.threadID, timeouts);
};