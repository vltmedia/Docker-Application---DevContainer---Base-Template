// scripts/build.js
const { loadConfig, imageTag, sh } = require("./utils");

const targetArg = process.argv[2] || "dev"; // dev | prod
const cfg = loadConfig();

const target = cfg.dockerfileTargets[targetArg] || targetArg;

const args = [
  "build",
  "--target", target,
  "-t", imageTag(cfg),
  "."
];

// extra build args
if (Array.isArray(cfg.buildArgs) && cfg.buildArgs.length) {
  args.push(...cfg.buildArgs);
}

console.log("docker", args.join(" "));
sh("docker", args);
