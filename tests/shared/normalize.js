function removeAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(value) {
  return removeAccents(String(value || "").toLowerCase())
    .replace(/\s+/g, " ")
    .trim();
}

function buildAliasMap(globalSynonyms = {}, localSynonyms = {}) {
  const aliasMap = {};
  const merge = { ...globalSynonyms, ...localSynonyms };

  Object.keys(merge).forEach((canonical) => {
    const aliases = Array.isArray(merge[canonical]) ? merge[canonical] : [];
    aliasMap[normalizeText(canonical)] = normalizeText(canonical);
    aliases.forEach((alias) => {
      aliasMap[normalizeText(alias)] = normalizeText(canonical);
    });
  });

  return aliasMap;
}

function canonicalizeLabel(label, aliasMap) {
  const normalized = normalizeText(label);
  return aliasMap[normalized] || normalized;
}

module.exports = {
  normalizeText,
  buildAliasMap,
  canonicalizeLabel
};
