// scripts/tag.js
const { loadConfig, imageTag, sh } = require("./utils");

const cfg = loadConfig();
const newTag = process.argv[2]; // e.g. "1.2.3" or "stable"
if (!newTag) {
  console.error("Usage: npm run docker:tag -- <newTag>");
  process.exit(1);
}
const current = imageTag(cfg);
const [repo] = current.split(":"); // org/name
const fullNew = `${repo}:${newTag}`;

console.log(`Tagging ${current} -> ${fullNew}`);
sh("docker", ["tag", current, fullNew]);
