// scripts/publish.js
const { loadConfig, imageTag, imageTagLatest, sh } = require("./utils");

const cfg = loadConfig();
const tag = imageTag(cfg);
const latestTag = imageTagLatest(cfg);

// Make sure image is built for prod target before pushing
// (You can comment this out if you build elsewhere.)
console.log("Building prod image before publish...");
process.argv[2] = "prod"; // cheeky way to reuse build.js default arg handling
require("./build");

console.log(`Pushing ${tag} ...`);
sh("docker", ["push", tag]);

if (cfg.tagLatestOnPublish && !tag.endsWith(":latest")) {
  console.log(`Tagging ${tag} as ${latestTag} and pushing...`);
  sh("docker", ["tag", tag, latestTag]);
  sh("docker", ["push", latestTag]);
}

console.log("Publish complete.");
