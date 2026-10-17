module.exports = {
  name: "hello",
  run: (api, event) => api.sendMessage("Xin chào!", event.threadID)
};
