// Patch for non-TTY environments
if (!process.stderr.clearLine) process.stderr.clearLine = () => {};
if (!process.stderr.cursorTo) process.stderr.cursorTo = () => {};

const os = require('os');
const disk = require('diskusage');
const cpuStat = require('cpu-stat');
const axios = require("axios");
const fs = require('fs');
const { execSync } = require('child_process');
const { config } = global.GoatBot;
const { dependencies = {}, devDependencies = {}, version } = JSON.parse(fs.readFileSync('package.json'));

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["upt2","up2"],
    version: "1.1",
    author: "tanvir",
    longDescription: "Check bot and server stats.",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function({ api, prefix, message, event }) {
    try {
      const server_uptime_seconds = os.uptime();
      const bot_uptime_seconds = process.uptime();

      const serverUptimeString = global.utils.convertTime(server_uptime_seconds * 1000);
      const botUptimeString = global.utils.convertTime(bot_uptime_seconds * 1000);
      const processTime = global.utils.convertTime(Date.now() - GoatBot.startTime);
      const ping_start = Date.now();
      const first_msg = await api.sendMessage("Checking uptime...", event.threadID);

      const ping_end = Date.now();
      const ping = Math.floor(ping_end - ping_start);

      const total_ram = os.totalmem() / (1024 ** 3);
      const free_ram = os.freemem() / (1024 ** 3);
      const ram_usage = total_ram - free_ram;

      const mem_info = {
        t: `${total_ram.toFixed(2)} GB`,
        f: `${free_ram.toFixed(2)} GB`,
        u: `${ram_usage.toFixed(2)} GB`,
        process: `${(process.memoryUsage().rss / (1024 ** 2)).toFixed(2)} MB`
      };

      const disk_info = disk.checkSync('/');
      const total_disk = disk_info.total / (1024 ** 3);
      const free_disk = disk_info.available / (1024 ** 3);
      const used_disk = total_disk - free_disk;

      const disk_usage = {
        t: `${total_disk.toFixed(2)} GB`,
        f: `${free_disk.toFixed(2)} GB`,
        u: `${used_disk.toFixed(2)} GB`
      };

      cpuStat.usagePercent(function(err, percent) {
        if (err) {
          console.error(err);
          message.reply("Error fetching CPU usage.");
          return;
        }

        const avg_cpu_speed = os.cpus().reduce((acc, cpu) => acc + cpu.speed, 0) / os.cpus().length;
        const cpu_info = `${os.cpus()[0].model}`;
        const cpu_usage = `${percent.toFixed(2)}%`;

        const platform_info = os.platform();
        const arch_info = os.arch();
        const cpu_count = os.cpus().length;

        const reply_eta =
          `# Uptime:\n` +
          ` • Server Uptime: ${serverUptimeString}\n` +
          ` • Bot Uptime: ${botUptimeString}\n` +
          ` • Process Time: ${processTime}\n` +
          ` • Ping: ${ping}ms\n\n` +
          `# Bot Information:\n` +
          ` • Bot Name: ${config.nickNameBot}\n` +
          ` • Bot Prefix: ${prefix}\n` +
          ` • Bot By: BaYjid\n` +
          ` • Time Zone: ${config.timeZone}\n` +
          ` • isAdminOnly: ${config.adminOnly.enable ? "yes❌" : "no✅"}\n\n` +
          `# System Info:\n` +
          ` • Platform: ${platform_info}\n` +
          ` • Architecture: ${arch_info}\n` +
          ` • CPU: ${cpu_info}\n` +
          ` • Core Count: ${cpu_count}\n` +
          ` • Usage: ${cpu_usage}\n\n` +
          `# Memory Usage:\n` +
          ` • Total: ${mem_info.t}\n` +
          ` • Used: ${mem_info.u}\n` +
          ` • Free: ${mem_info.f}\n` +
          ` • Process Memory: ${mem_info.process}\n\n` +
          `# Disk Usage:\n` +
          ` • Total: ${disk_usage.t}\n` +
          ` • Used: ${disk_usage.u}\n` +
          ` • Free: ${disk_usage.f}\n\n` +
          `# Other Information:\n` +
          ` • Project Version: ${version}\n` +
          ` • Node.js Version: ${process.version}\n` +
          ` • Npm Version: ${execSync('npm --v').toString().trim()}\n` +
          ` • Total Packages Installed: ${Object.keys({ ...dependencies, ...devDependencies }).length}\n` +
          ` • Host Name: ${process.env.USER}\n` +
          ` • Host Home: ${process.env.HOME}`;
        api.editMessage(reply_eta, first_msg.messageID);
      });
    } catch (error) {
      console.error(error);
      message.reply(error.message);
    }
  }
};