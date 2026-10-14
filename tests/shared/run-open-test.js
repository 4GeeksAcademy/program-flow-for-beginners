const fs = require("fs");
const path = require("path");
const { validateFlow } = require("./flow-engine");

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
    try {
      delete require.cache[require.resolve(jsPath)];
      const exported = require(jsPath);
      if (typeof exported === "string" && exported.trim()) return exported.trim();
    } catch (error) {
      // Fall back to text extraction if the module cannot be loaded.
    }

    const js = fs.readFileSync(jsPath, "utf8");
    const template = js.match(/(?:^|\r?\n)\s*const\s+answer\s*=\s*`([\s\S]*?)`\s*;?/);
    if (template && template[1] && template[1].trim()) return template[1].trim();
    const extracted = extractMermaidFromMarkdown(js);
    if (extracted) return extracted;
  }

  return "";
}

function runExerciseTest(exerciseDir) {
  const rubric = readJson(path.join(exerciseDir, "rubric.json"));
  const synonyms = readJson(path.join(__dirname, "flow-synonyms.json"));
  const answer = loadAnswer(exerciseDir);

  const result = validateFlow(answer, rubric, synonyms);

  if (!result.pass) {
    const heading = result.lang === "es" ? "Tu diagrama todavía no está bien:" : "Your diagram is not quite right yet:";
    const error = new Error(`${heading}\n${result.errors.map((e) => `- ${e}`).join("\n")}`);
    // Without a stack, jest shows only the message, not lines of this file.
    error.stack = error.message;
    throw error;
  }

  // LearnPack shows what a passing test prints in place of its own success line.
  if (result.tips && result.tips.length) {
    const es = result.lang === "es";
    const passed = es ? "✅ Todas las pruebas pasaron." : "✅ All tests have passed.";
    const heading = es ? "Consejos para que tu diagrama se entienda mejor:" : "Tips to make your diagram clearer:";
    process.stdout.write(`${passed}\n\n${heading}\n${result.tips.map((t) => `- ${t}`).join("\n")}\n`);
  }

  return result;
}

module.exports = {
  runExerciseTest
};
