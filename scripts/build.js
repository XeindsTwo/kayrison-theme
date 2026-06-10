const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceHtmlPath = path.join(root, "index.html");
const sourceCssPath = path.join(root, "src", "css", "style.css");
const distDir = path.join(root, "dist");
const distHtmlPath = path.join(distDir, "index.html");

const fontImport =
  '@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=Roboto+Condensed:wght@500&display=swap");';

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function resolveCss(filePath, seen = new Set()) {
  const absolutePath = path.resolve(filePath);

  if (seen.has(absolutePath)) {
    return "";
  }

  seen.add(absolutePath);

  const css = read(absolutePath).replace(/^\uFEFF/, "");
  const dir = path.dirname(absolutePath);

  return css.replace(/@import\s+["'](.+?)["'];?/g, (_, importPath) => {
    const nextPath = path.resolve(dir, importPath);
    return resolveCss(nextPath, seen);
  });
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  if (!match) {
    throw new Error("Не найден тег <body> в index.html");
  }

  return match[1].trim();
}

function build() {
  const html = extractBody(read(sourceHtmlPath));
  const css = [fontImport, resolveCss(sourceCssPath).trim()].join("\n\n");
  const output = `${html}\n\n<style>\n${css}\n</style>\n`;

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(distHtmlPath, output, "utf8");

  console.log(`Built ${path.relative(root, distHtmlPath)}`);
}

build();
