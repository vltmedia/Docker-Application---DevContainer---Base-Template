// scripts/stop-remove.js
console.log("Stopping and removing existing container if any...");
const { loadConfig, sh } = require("./utils");
const cfg = loadConfig();
console.log(`Container name: ${cfg.appName}`);

// Don't fail the whole script if the container isn't there.
sh("docker", ["stop", "-t", "0", cfg.appName], { stdio: "ignore", allowFail: true });
sh("docker", ["rm", "-f", cfg.appName],       { stdio: "ignore", allowFail: true });

console.log(`Stopped and removed (if existed): ${cfg.appName}`);
console.log("Done.");
