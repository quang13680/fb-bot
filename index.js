const login = require("fca-unofficial");
const express = require("express");
const fs = require("fs");

const app = express();
app.get("/", (req, res) => res.send("Bot đang chạy"));
app.listen(process.env.PORT || 3000);

const commands = {};
fs.readdirSync("./commands").forEach(f => {
  const c = require("./commands/" + f);
  commands[c.name] = c;
});

const appState = JSON.parse(process.env.APPSTATE);

login({ appState }, (err, api) => {
  if (err) return console.error(err);
  console.log("Đã đăng nhập");
  api.listenMqtt((err, event) => {
    if (err || event.type !== "message" || !event.body?.startsWith("!")) return;
    const [name, ...args] = event.body.slice(1).split(" ");
    commands[name]?.run(api, event, args);
  });
});
