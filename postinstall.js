
const fs = require("fs");
const path = require("path");

const tinymcePackagePath = require.resolve("tinymce/package.json");
const source = path.dirname(tinymcePackagePath);

const destination = path.join(
  process.cwd(),
  "public",
  "tinymce"
);

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });

fs.cpSync(source, destination, { recursive: true });

console.log("TinyMCE source:", source);
console.log("TinyMCE copied to:", destination);
console.log("Copied files:", fs.readdirSync(destination));
