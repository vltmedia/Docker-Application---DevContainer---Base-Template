// scripts/stop-remove.js
const { loadConfig, sh } = require("./utils");
const cfg = loadConfig();

sh("docker", ["stop", cfg.appName], { stdio: "ignore" });
sh("docker", ["rm", cfg.appName], { stdio: "ignore" });
