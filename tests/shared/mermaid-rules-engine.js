const { normalizeText, buildAliasMap, canonicalizeLabel } = require("./normalize");

function extractEdges(mermaid) {
  const edges = [];
  const lines = String(mermaid || "").split(/\r?\n/);
  const nodeRef = "([A-Za-z0-9_]+)(?:\\[[^\\]]*\\]|\\([^\\)]*\\)|\\{[^\\}]*\\})?";
  const edgeRegex = new RegExp(`^${nodeRef}\\s*--(?:\\|([^|]+)\\|)?\\s*>\\s*${nodeRef}`);

  lines.forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("flowchart") || clean.startsWith("graph")) return;

    const match = clean.match(edgeRegex);
    if (match) {
      edges.push({ from: match[1], condition: normalizeText(match[2] || ""), to: match[3] });
    }
  });

  return edges;
}

function extractNodeLabels(mermaid, aliasMap) {
  const labelMap = {};
  const regex = /([A-Za-z0-9_]+)\s*\[(.*?)\]/g;
  let match;
  while ((match = regex.exec(String(mermaid || ""))) !== null) {
    labelMap[match[1]] = canonicalizeLabel(match[2], aliasMap);
  }
  return labelMap;
}

function validateMermaidAnswer(userAnswer, rubric, globalSynonyms) {
  const aliasMap = buildAliasMap(globalSynonyms, rubric.accepted_synonyms || {});
  const edges = extractEdges(userAnswer);
  const nodeLabels = extractNodeLabels(userAnswer, aliasMap);

  const canonicalNodes = new Set(Object.values(nodeLabels));
  const edgePairs = edges.map((e) => `${e.from}->${e.to}`);
  const conditions = edges.map((e) => e.condition).filter(Boolean);
  const normalizedAnswer = normalizeText(userAnswer);

  const missingNodes = (rubric.required_nodes || []).filter(
    (node) => !canonicalNodes.has(canonicalizeLabel(node, aliasMap))
  );

  const missingEdges = (rubric.required_edges || []).filter(
    (pair) => !edgePairs.includes(`${pair[0]}->${pair[1]}`)
  );

  const missingConditions = (rubric.required_conditions || []).filter(
    (condition) => !conditions.includes(normalizeText(condition))
  );

  const forbiddenHits = (rubric.forbidden_patterns || []).filter((pattern) =>
    normalizedAnswer.includes(normalizeText(pattern))
  );

  const minSteps = Number(rubric.min_steps || 0);
  const stepError = edges.length < minSteps ? `Expected at least ${minSteps} edges but found ${edges.length}.` : null;

  const errors = [];
  if (missingNodes.length) errors.push(`Missing required nodes: ${missingNodes.join(", ")}`);
  if (missingEdges.length) errors.push(`Missing required edges: ${missingEdges.map((e) => `${e[0]}->${e[1]}`).join(", ")}`);
  if (missingConditions.length) errors.push(`Missing required conditions: ${missingConditions.join(", ")}`);
  if (forbiddenHits.length) errors.push(`Forbidden patterns detected: ${forbiddenHits.join(", ")}`);
  if (stepError) errors.push(stepError);

  return {
    pass: errors.length === 0,
    report: {
      errors,
      parsed: {
        edges,
        nodeLabels
      }
    }
  };
}

module.exports = {
  validateMermaidAnswer
};
