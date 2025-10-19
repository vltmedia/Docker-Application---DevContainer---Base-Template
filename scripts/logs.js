// scripts/logs.js
const { loadConfig, sh } = require("./utils");
const cfg = loadConfig();
sh("docker", ["logs", "-f", "--no-log-prefix", cfg.appName]);
