const fs = require("fs");
const path = require("path");
const { validateMermaidAnswer } = require("./mermaid-rules-engine");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractMermaidFromMarkdown(content) {
  const text = String(content || "");
  const block = text.match(/```mermaid\s*([\s\S]*?)```/i);
  if (block && block[1]) return block[1].trim();
  return text.trim();
}

function loadAnswer(exerciseDir) {
  const envAnswer = process.env.LEARNPACK_USER_ANSWER || process.env.USER_ANSWER;
  if (envAnswer && envAnswer.trim()) return envAnswer;

  const jsPath = path.join(exerciseDir, "app.js");
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, "utf8");
    // Prefer the actual exercise payload instead of any template in comments.
    const template = js.match(/const\s+answer\s*=\s*`([\s\S]*?)`\s*;?/);
    if (template && template[1] && template[1].trim()) return template[1].trim();
    const extracted = extractMermaidFromMarkdown(js);
    if (extracted) return extracted;
  }

  return "";
}

function runExerciseTest(exerciseDir) {
  const rubric = readJson(path.join(exerciseDir, "rubric.json"));
  const synonyms = readJson(path.join(__dirname, "synonyms.es-en.json"));
  const answer = loadAnswer(exerciseDir);

  const result = validateMermaidAnswer(answer, rubric, synonyms);

  if (!result.pass) {
    const details = result.report.errors.map((e) => `- ${e}`).join("\n");
    throw new Error(`Open Mermaid validation failed for app.js:\n${details}`);
  }

  return result;
}

module.exports = {
  runExerciseTest
};
