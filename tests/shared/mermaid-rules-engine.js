const { normalizeText, buildAliasMap, canonicalizeLabel } = require("./normalize");

function buildAdjacency(edges) {
  const adjacency = new Map();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
    adjacency.get(edge.from).add(edge.to);
  });
  return adjacency;
}

function hasReachablePath(adjacency, from, to) {
  if (!from || !to) return false;
  if (from === to) {
    const next = adjacency.get(from);
    if (next && next.has(from)) return true;
  }

  const visited = new Set();
  const queue = [from];
  visited.add(from);

  while (queue.length) {
    const current = queue.shift();
    const next = adjacency.get(current);
    if (!next) continue;

    for (const candidate of next) {
      if (candidate === to) return true;
      if (!visited.has(candidate)) {
        visited.add(candidate);
        queue.push(candidate);
      }
    }
  }

  return false;
}

function validatePathRule(rule, adjacency) {
  if (Array.isArray(rule)) {
    if (rule.length < 2) return true;
    for (let i = 0; i < rule.length - 1; i += 1) {
      if (!hasReachablePath(adjacency, rule[i], rule[i + 1])) return false;
    }
    return true;
  }

  if (rule && typeof rule === "object") {
    const via = Array.isArray(rule.via) ? rule.via : [];
    const points = [rule.from, ...via, rule.to].filter(Boolean);
    if (points.length < 2) return true;
    for (let i = 0; i < points.length - 1; i += 1) {
      if (!hasReachablePath(adjacency, points[i], points[i + 1])) return false;
    }
    return true;
  }

  return true;
}

function validateCycleRule(rule, adjacency) {
  if (typeof rule === "string") return hasReachablePath(adjacency, rule, rule);

  if (Array.isArray(rule)) {
    if (rule.length < 2) return true;
    for (let i = 0; i < rule.length; i += 1) {
      const from = rule[i];
      const to = rule[(i + 1) % rule.length];
      if (!hasReachablePath(adjacency, from, to)) return false;
    }
    return true;
  }

  if (rule && typeof rule === "object") {
    const nodes = Array.isArray(rule.nodes) ? rule.nodes : [];
    return validateCycleRule(nodes, adjacency);
  }

  return true;
}

function normalizeEdgePair(pair) {
  return Array.isArray(pair) && pair.length >= 2 ? `${pair[0]}->${pair[1]}` : null;
}

function stripWrappedQuotes(value) {
  return String(value || "")
    .trim()
    .replace(/^["']/, "")
    .replace(/["']$/, "");
}

function extractEdges(mermaid) {
  const edges = [];
  const lines = String(mermaid || "").split(/\r?\n/);
  const nodeRef = "([A-Za-z0-9_]+)(?:\\(\\([^\\)]*\\)\\)|\\(\\[[^\\]]*\\]\\)|\\[[^\\]]*\\]|\\([^\\)]*\\)|\\{[^\\}]*\\})?";
  const edgeWithPreLabel = new RegExp(`^${nodeRef}\\s*--\\|([^|]+)\\|-->\\s*${nodeRef}\\s*;?$`);
  const edgeWithPostLabel = new RegExp(`^${nodeRef}\\s*-->\\|([^|]+)\\|\\s*${nodeRef}\\s*;?$`);
  const edgePlain = new RegExp(`^${nodeRef}\\s*-->\\s*${nodeRef}\\s*;?$`);

  lines.forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("flowchart") || clean.startsWith("graph")) return;

    let match = clean.match(edgeWithPreLabel);
    if (match) {
      edges.push({ from: match[1], condition: normalizeText(match[2] || ""), to: match[3] });
      return;
    }

    match = clean.match(edgeWithPostLabel);
    if (match) {
      edges.push({ from: match[1], condition: normalizeText(match[2] || ""), to: match[3] });
      return;
    }

    match = clean.match(edgePlain);
    if (match) {
      edges.push({ from: match[1], condition: "", to: match[2] });
    }
  });

  return edges;
}

function extractNodeLabels(mermaid, aliasMap) {
  const labelMap = {};
  const regex = /([A-Za-z0-9_]+)\s*(?:\(\(([^)]*)\)\)|\(\[([^\]]*)\]\)|\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\})/g;
  let match;
  while ((match = regex.exec(String(mermaid || ""))) !== null) {
    const rawLabel = [match[2], match[3], match[4], match[5], match[6]].find((v) => typeof v === "string") || "";
    labelMap[match[1]] = canonicalizeLabel(stripWrappedQuotes(rawLabel), aliasMap);
  }
  return labelMap;
}

function validateMermaidAnswer(userAnswer, rubric, globalSynonyms) {
  const aliasMap = buildAliasMap(globalSynonyms, rubric.accepted_synonyms || {});
  const edges = extractEdges(userAnswer);
  const nodeLabels = extractNodeLabels(userAnswer, aliasMap);
  const adjacency = buildAdjacency(edges);

  const canonicalNodes = new Set(Object.values(nodeLabels));
  const edgePairs = edges.map((e) => `${e.from}->${e.to}`);
  const edgePairSet = new Set(edgePairs);
  const conditions = edges.map((e) => e.condition).filter(Boolean);
  const canonicalConditions = conditions.map((condition) => canonicalizeLabel(condition, aliasMap));
  const uniqueNodeIds = new Set([
    ...Object.keys(nodeLabels),
    ...edges.map((e) => e.from),
    ...edges.map((e) => e.to)
  ]);
  const normalizedAnswer = normalizeText(userAnswer);
  const languageIndependent = rubric.language_independent !== false;
  const rubricVersion = Number(rubric.rubric_version || 1);
  const strictEdges = typeof rubric.strict_edges === "boolean"
    ? rubric.strict_edges
    : rubricVersion < 2;

  let missingNodes = (rubric.required_nodes || []).filter(
    (node) => !canonicalNodes.has(canonicalizeLabel(node, aliasMap))
  );
  if (languageIndependent && missingNodes.length) {
    const minimumNodes = Number((rubric.required_nodes || []).length);
    if (uniqueNodeIds.size >= minimumNodes) missingNodes = [];
  }

  const missingEdges = strictEdges
    ? (rubric.required_edges || []).filter((pair) => !edgePairSet.has(`${pair[0]}->${pair[1]}`))
    : [];

  const alternativeEdgeSets = Array.isArray(rubric.any_of_edge_sets) ? rubric.any_of_edge_sets : [];
  const alternativeEdgeSetsValid = alternativeEdgeSets.length === 0 || alternativeEdgeSets.some((edgeSet) =>
    Array.isArray(edgeSet) && edgeSet.every((pair) => {
      const normalized = normalizeEdgePair(pair);
      return normalized ? edgePairSet.has(normalized) : true;
    })
  );

  const requiredPaths = Array.isArray(rubric.required_paths) ? rubric.required_paths : [];
  const missingPaths = requiredPaths.filter((rule) => !validatePathRule(rule, adjacency));

  const requiredCycles = Array.isArray(rubric.required_cycles) ? rubric.required_cycles : [];
  const missingCycles = requiredCycles.filter((rule) => !validateCycleRule(rule, adjacency));

  const expectedConditions = (rubric.required_conditions || []).map((condition) =>
    canonicalizeLabel(condition, aliasMap)
  );
  const presentConditions = new Set(canonicalConditions);
  const missingConditions = expectedConditions.filter((condition) => !presentConditions.has(condition));

  const forbiddenHits = (rubric.forbidden_patterns || []).filter((pattern) =>
    normalizedAnswer.includes(normalizeText(pattern))
  );

  const minSteps = Number(rubric.min_steps || 0);
  const stepError = edges.length < minSteps ? `Expected at least ${minSteps} edges but found ${edges.length}.` : null;

  const errors = [];
  if (missingNodes.length) errors.push(`Missing required nodes: ${missingNodes.join(", ")}`);
  if (missingEdges.length) errors.push(`Missing required edges: ${missingEdges.map((e) => `${e[0]}->${e[1]}`).join(", ")}`);
  if (!alternativeEdgeSetsValid) errors.push("Missing one valid alternative edge set from any_of_edge_sets.");
  if (missingPaths.length) errors.push(`Missing required paths: ${missingPaths.length}`);
  if (missingCycles.length) errors.push(`Missing required cycles: ${missingCycles.length}`);
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