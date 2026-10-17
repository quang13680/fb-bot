module.exports = {
  name: "help",
  run: (api, event, args, commands) => {
    const list = Object.keys(commands).map(n => "!" + n).join("\n");
    api.sendMessage("Các lệnh:\n" + list, event.threadID);
  }
};
