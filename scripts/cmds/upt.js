const fs = require("fs");
const os = require("os");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "up",
    aliases: ["up", "upt"],
    version: "4.0",
    author: "BaYjid",
    cooldowns: 5,
    role: 0,
    shortDescription: "Bot's system status",
    longDescription: "Show system info: uptime, RAM, CPU, load, platform etc",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const width = 1400;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Dark digital background
    ctx.fillStyle = "#0b0f12";
    ctx.fillRect(0, 0, width, height);
    drawVerticalLines(ctx, width, height);

    // Card
    const cardX = 80, cardY = 80;
    const cardWidth = width - 160, cardHeight = height - 160;
    drawFlatCard(ctx, cardX, cardY, cardWidth, cardHeight, "#1a1f24");

    // Title
    ctx.fillStyle = "#00ff99";
    ctx.font = "bold 58px 'Courier New'";
    ctx.fillText("XASS BOT – System Monitor", cardX + 40, cardY + 70);

    // System info
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const botUptime = `${d}d ${h}h ${m}m ${s}s`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsagePercent = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg()[0];
    const cpuPercent = Math.min((loadAvg / cpuCount) * 100, 100);

    const nodeVer = process.version;
    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();

    const info = [
      ["Uptime", botUptime],
      ["CPU", `${cpuModel} (${cpuCount} cores)`],
      ["Load Avg", `${loadAvg.toFixed(2)} (${cpuPercent.toFixed(1)}%)`],
      ["RAM", `${(usedMem / 1024 / 1024).toFixed(1)} MB / ${(totalMem / 1024 / 1024).toFixed(1)} MB (${ramUsagePercent.toFixed(1)}%)`],
      ["Platform", `${platform} (${arch})`],
      ["Node", nodeVer],
      ["Host", hostname]
    ];

    // Render info
    let infoStartY = cardY + 150;
    info.forEach(([label, value], i) => {
      const y = infoStartY + i * 60;
      ctx.fillStyle = "#00ff99";
      ctx.font = "bold 26px 'Courier New'";
      ctx.fillText(label + ":", cardX + 60, y);
      ctx.fillStyle = "#ffffffaa";
      ctx.font = "24px 'Courier New'";
      ctx.fillText(value, cardX + 300, y);
    });

    // RAM & CPU bars
    const ramBarY = infoStartY + info.length * 60 + 40;
    const cpuBarY = infoStartY + info.length * 60 + 120;
    drawFlatProgressBar(ctx, cardX + 60, ramBarY, cardWidth - 120, 35, ramUsagePercent, "#00ff99");
    drawFlatProgressBar(ctx, cardX + 60, cpuBarY, cardWidth - 120, 35, cpuPercent, "#ffaa00");

    // Digital pixel dots near bars
    drawDigitalDots(ctx, cardX + 60, ramBarY, ramUsagePercent, "#00ff99");
    drawDigitalDots(ctx, cardX + 60, cpuBarY, cpuPercent, "#ffaa00");

    // Timestamp
    ctx.fillStyle = "#33ffaa";
    ctx.font = "italic 22px 'Courier New'";
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, cardX + 60, height - 50);

    // Save image
    const buffer = canvas.toBuffer("image/png");
    const fileName = "uptime_dashboard.png";
    fs.writeFileSync(fileName, buffer);

    // Reply
    const plain = info.map(([l, v]) => `${l}: ${v}`).join("\n");
    const bar1 = `RAM Usage: ${ramUsagePercent.toFixed(1)}%`;
    const bar2 = `CPU Load: ${loadAvg.toFixed(2)} (${cpuPercent.toFixed(1)}%)`;

    message.reply({
      body: `XASS BOT – Uptime Report\n\n${plain}\n\n${bar1}\n${bar2}`,
      attachment: fs.createReadStream(fileName)
    });
  }
};

// ---------- Helper Functions ----------

function drawFlatCard(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawVerticalLines(ctx, width, height) {
  ctx.strokeStyle = "#00ff9922";
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
}

function drawFlatProgressBar(ctx, x, y, w, h, percent, color) {
  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, w, h);

  const fillWidth = (percent / 100) * w;
  const grad = ctx.createLinearGradient(x, y, x + fillWidth, y);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "#000000");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, fillWidth, h);

  ctx.strokeStyle = "#555";
  ctx.strokeRect(x, y, w, h);
}

function drawDigitalDots(ctx, x, y, percent, color) {
  const numDots = 15;
  for (let i = 0; i < numDots; i++) {
    const offsetX = (i / numDots) * (percent / 100) * 1000;
    ctx.fillStyle = color + "55";
    ctx.beginPath();
    ctx.arc(x + offsetX, y + 15, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}