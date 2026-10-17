const login = require("@dongdev/fca-unofficial");
const express = require("express");
const fs = require("fs");

const app = express();
app.get("/", (req, res) => res.send("Bot đang chạy"));
app.listen(process.env.PORT || 3000);

// Không để lỗi bất ngờ làm sập tiến trình (Render sẽ tự khởi động lại và đăng nhập lần nữa)
process.on("uncaughtException", e => console.error("Lỗi:", e.message));
process.on("unhandledRejection", e => console.error("Lỗi:", e));

const PREFIX = "!";
const commands = {};
fs.readdirSync("./commands")
  .filter(f => f.endsWith(".js"))
  .forEach(f => {
    const c = require("./commands/" + f);
    commands[c.name] = c;
  });

let appState = null;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
} catch (e) {
  console.error("Không đọc được appstate.json:", e.message);
}

if (appState) {
  console.log("Đăng nhập 1 lần duy nhất...");
  login({ appState }, (err, api) => {
    if (err) return console.error("Đăng nhập lỗi, không thử lại:", err);
    console.log("Đã đăng nhập");

    api.setOptions({ listenEvents: true, selfListen: false, autoReconnect: false });

    const stop = api.listenMqtt((err, event) => {
      if (err) {
        console.error("Mất kết nối, dừng lắng nghe, không thử lại:", err);
        if (typeof stop === "function") stop();
        return;
      }
      if (event.type !== "message" || !event.body) return;
      if (!event.body.startsWith(PREFIX)) return;

      const [name, ...args] = event.body.slice(PREFIX.length).trim().split(/\s+/);
      const cmd = commands[name.toLowerCase()];
      if (!cmd) return;
      try {
        cmd.run(api, event, args, commands);
      } catch (e) {
        console.error("Lỗi lệnh", name, e);
      }
    });
  });
}
