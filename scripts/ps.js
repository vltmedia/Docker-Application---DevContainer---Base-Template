// scripts/ps.js
const { loadConfig, sh } = require("./utils");
const cfg = loadConfig();
sh("docker", ["ps", "--filter", `name=${cfg.appName}`]);
