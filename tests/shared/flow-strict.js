// Strict scenario checker. Two rules:
//
// 1. Read every box exactly, or tell the student which box to reword and how.
//    Never guess. A box it can't read is never silently skipped.
// 2. Run the diagram on every input that can change the result and compare
//    with the right answer. For number checks that means each number written
//    in the diagram or the rubric, and the values just below and above it.
//
// Each error is { kind, text }. kind "reword" means "I couldn't read this box",
// "logic" means "I read everything and the flow gives a wrong answer".

const { normalize, words, wordMatches, typoDistance } = require("./flow-engine");

const MAX_STEPS = 600;

const NEGATORS = ["not", "no", "never", "without", "nunca", "sin", "nor", "ni", "nada", "ningun", "ninguna", "nobody", "noone", "nadie"];
// Verbs that mean "ask the user". Strong ones can stand alone ("Ask again");
// weak ones only count next to the thing being asked ("Wait for event").
const ASK_VERBS = ["enter", "enters", "ask", "asks", "read", "reads", "input", "inputs", "type", "types", "insert",
  "inserts", "scan", "scans", "request", "requests", "prompt", "prompts", "write", "writes", "put", "puts", "deposit",
  "ingresa", "ingresar", "ingrese", "introduce", "introducir", "introduzca", "pedir", "pide", "pida", "solicita",
  "solicitar", "leer", "lee", "escribe", "escribir", "teclea", "teclear", "inserta", "insertar", "mete", "meter",
  "deposita", "depositar", "marca", "marcar", "captura", "capturar", "escanea", "escanear", "gimme", "dame", "dime"];
const WEAK_ASK_VERBS = ["get", "gets", "select", "selects", "choose", "chooses", "pick", "picks", "receive", "receives",
  "wait", "waits", "dial", "elegir", "elige", "escoger", "escoge",
  "seleccionar", "selecciona", "espera", "esperar", "recibir", "recibe", "obtener", "obten", "coger", "coge", "tomar", "toma", "grab", "grabs", "fetch", "fetches", "obtain", "obtains", "retrieve", "retrieves"];
const AGAIN = ["again", "retry", "otra vez", "de nuevo", "nuevamente"];
// Words that suggest a box changes a value. Used only to explain a failure:
// if such a box can't be read, the student is asked to reword it.
const CHANGE = ["add", "adds", "sum", "suma", "sumar", "agrega", "agregar", "anade", "anadir", "acumula", "acumular",
  "increment", "increase", "incrementa", "aumenta", "update", "actualiza", "plus", "count", "cuenta", "contar", "next",
  "siguiente"];
const FILLER = ["the", "a", "an", "your", "his", "her", "their", "user", "user's", "users", "customer", "person",
  "el", "la", "los", "las", "un", "una", "su", "tu", "de", "del", "al", "usuario", "cliente", "for", "por", "is", "es",
  "it", "this", "esta", "este", "of", "again", "new", "nuevo", "nueva", "first", "next", "o", "or", "and", "y"];
const MORE = ["more", "another", "other", "next", "remaining", "left", "still", "todavia", "aun", "mas", "otro", "otra", "otros", "quedan", "queda",
  "siguiente", "continue", "continuar", "seguir", "sigue", "keep", "add"];
const DONE = ["done", "finished", "finish", "stop", "terminado", "terminaste", "termino", "listo", "lista", "checkout", "pay", "pagar"];
// "Item price entered?" right after reading the price: was one given?
const ENTERED = ["entered", "given", "typed", "introducido", "ingresado", "escrito"];
// Bare result words ("Valid", "Correct") read as the yes or no outcome, only
// as the last step before End and only where the rubric allows it.
const GENERIC_YES = ["valid", "valido", "valida", "correct", "correcto", "correcta", "true", "verdadero", "verdadera", "yes", "si", "ok", "okay"];
const GENERIC_NO = ["invalid", "invalido", "invalida", "incorrect", "incorrecto", "incorrecta", "false", "falso", "falsa", "no"];
const END_WORDS = ["end", "fin", "final", "finish"];
const ADULT = ["adult", "adulto", "adulta", "legal age", "mayor de edad", "of age"];
const MINOR = ["minor", "menor de edad", "underage", "menor"];
// Word forms of comparisons. null = ambiguous: people use it both ways.
const WORD_CMP = [
  [/(?:mayor|greater|more|bigger|higher)\s*(?:than\s*|que\s*)?(?:o|or)\s*(?:igual|equal)\s*(?:a|que|to|than)?\s*(\d+)/, ">="],
  [/(?:menor|less|smaller|lower)\s*(?:than\s*|que\s*)?(?:o|or)\s*(?:igual|equal)\s*(?:a|que|to|than)?\s*(\d+)/, "<="],
  [/(\d+)\s*(?:years?|anos)?\s*(?:old\s*)?(?:or|o)\s*(?:older|more|over|above|mas|mayor|greater|higher)/, ">="],
  [/(\d+)\s*(?:years?|anos)?\s*(?:old\s*)?(?:or|o)\s*(?:younger|less|under|below|menos|menor|lower)/, "<="],
  [/(\d+)\s*(?:anos|years)\s*cumplidos/, ">="],
  [/(?:at least|al menos|como minimo|minimo)\s*(\d+)/, ">="],
  [/(?:at most|como maximo|maximo)\s*(\d+)/, "<="],
  [/(\d+)\s*\+/, ">="],
  [/(?:older than|more than|greater than|bigger than|higher than|mayor que)\s*(\d+)/, ">"],
  [/(?:younger than|less than|smaller than|lower than|below|under|menor que|menos de|menor de|menores de)\s*(\d+)/, "<"],
  [/(?:over|above|mayor de|mayores de|mas de)\s*(\d+)/, null]
];

// ---------- text ----------

function prep(label) {
  return normalize(label)
    .replace(/[’`´]/g, "'")
    .replace(/\bcan'?t\b|\bcannot\b/g, "can not")
    .replace(/\bwon'?t\b/g, "will not")
    .replace(/\b(is|does|do|are|was|were|has|have|did|should|could|would|must)n'?t\b/g, "$1 not")
    .replace(/≥|=>/g, ">=").replace(/≤|=</g, "<=").replace(/≠|<>/g, "!=").replace(/==+/g, "=")
    .replace(/&&/g, " and ").replace(/\|\|/g, " or ")
    .replace(/<br\s*\/?>/g, " ");
}

const ws = (text) => words(prep(text));

// Verbs match exactly, or with one typo when long enough ("chose" for "choose").
// No longer-form matching: "ready" must not count as "read".
function hasVerb(text, list) {
  const oneSwap = (w, k) => w.length === k.length && [...w].filter((c, i) => c !== k[i]).length === 1;
  // whole-word typos only: "selected" is not a typo of "selects"
  return ws(text).some((w) => list.some((k) => w === k || (k.length === 4 && oneSwap(w, k)) || (k.length >= 5 && typoDistance(w, k) <= 1 && !w.startsWith(k) && !k.startsWith(w))));
}

function has(text, list) {
  const w = ws(text);
  const joined = ` ${w.join(" ")} `;
  return (list || []).some((k) => {
    const key = normalize(k);
    if (/[^a-z0-9]/.test(key)) return joined.includes(` ${words(key).join(" ")} `) || prep(text).includes(key);
    return w.some((x) => wordMatches(x, key));
  });
}

function hasExact(text, list) {
  const w = ws(text);
  const joined = ` ${w.join(" ")} `;
  return list.some((k) => (k.includes(" ") ? joined.includes(` ${k} `) : w.includes(k)));
}

// Any "not" counts once: "Cannot rent: no license" is one refusal, not a double negative.
const negated = (text) => ws(text).some((w) => NEGATORS.includes(w));

// How well does the text match a word list? 3 exact, 2 longer form, 1 typo, 0 none.
function matchQuality(text, list) {
  const w = ws(text);
  const joined = ` ${w.join(" ")} `;
  let best = 0;
  (list || []).forEach((k) => {
    const key = normalize(k);
    if (/[^a-z0-9]/.test(key)) { if (joined.includes(` ${words(key).join(" ")} `) || prep(text).includes(key)) best = 3; return; }
    w.forEach((x) => {
      if (x === key) best = 3;
      else if (key.length >= 4 && x.startsWith(key)) best = Math.max(best, 2);
      else if (key.length >= 6 && wordMatches(x, key)) best = Math.max(best, 1);
    });
  });
  return best;
}

// ---------- expressions ----------

function tokenize(expr) {
  const tokens = [];
  const re = /\s*(\d+(?:\.\d+)?|[a-z_][a-z0-9_]*|[-+*/()])/y;
  let m;
  while ((m = re.exec(expr)) !== null) tokens.push(m[1]);
  return tokens;
}

// Parses an arithmetic expression into a tree. Throws if it isn't one.
function parseExpr(tokens) {
  let i = 0;
  const atom = () => {
    const t = tokens[i++];
    if (t === undefined) throw new Error("end");
    if (t === "(") { const v = sum(); if (tokens[i++] !== ")") throw new Error(")"); return v; }
    if (t === "-") return { op: "neg", a: atom() };
    if (/^\d/.test(t)) return { num: Number(t) };
    if (/^[a-z_]/.test(t)) return { id: t };
    throw new Error("bad");
  };
  const product = () => { let v = atom(); while (tokens[i] === "*" || tokens[i] === "/") { const op = tokens[i++]; v = { op, a: v, b: atom() }; } return v; };
  const sum = () => { let v = product(); while (tokens[i] === "+" || tokens[i] === "-") { const op = tokens[i++]; v = { op, a: v, b: product() }; } return v; };
  const tree = sum();
  if (i !== tokens.length) throw new Error("trailing");
  return tree;
}

// Longest leading run of tokens that is a valid expression ("price + 1 euro" -> "price + 1").
function parseExprPrefix(text) {
  const tokens = tokenize(text);
  for (let n = tokens.length; n > 0; n -= 1) {
    try { return parseExpr(tokens.slice(0, n)); } catch (e) { /* try shorter */ }
  }
  return null;
}

const idsIn = (tree) => (!tree ? [] : tree.id ? [tree.id] : [...idsIn(tree.a), ...idsIn(tree.b)]);

// ---------- assignments ----------

const ADD_VERBS = "add|sum|suma|sumar|agrega|agregar|anade|anadir|acumula|acumular";
const INC_VERBS = "increment|increase|incrementa|incrementar|aumenta|aumentar";

function parseAssignments(label) {
  const text = prep(label).replace(/←|<-/g, "=").replace(/:=/g, "=").replace(/\?/g, "");
  let m = text.match(new RegExp(`^\\s*(?:${ADD_VERBS})\\s+(?:it\\s+|lo\\s+)?(?:to|a|al|en|into)\\s+(?:the\\s+|el\\s+|la\\s+)?([a-z_][a-z0-9_]*)\\s*$`));
  if (m) return [{ target: m[1], tree: { op: "+", a: { id: m[1] }, b: { id: "__input__" } }, words: true }];
  // "add price to total", "add item price to total": the last word before "to" is what's added
  m = text.match(new RegExp(`\\b(?:${ADD_VERBS})\\s+(?:the\\s+|el\\s+|la\\s+)?(?:[a-z_][a-z0-9_]*\\s+){0,3}([a-z_][a-z0-9_]*)\\s+(?:to|a|al|en|into)\\s+(?:the\\s+|el\\s+|la\\s+)?([a-z_][a-z0-9_]*)\\b`));
  if (m && !/=/.test(text)) return [{ target: m[2], tree: { op: "+", a: { id: m[2] }, b: { id: m[1] } }, words: true }];
  m = text.match(new RegExp(`\\b(?:${ADD_VERBS})\\s+(\\d+)\\s+(?:to|a|al)\\s+(?:the\\s+|el\\s+|la\\s+)?([a-z_][a-z0-9_]*)\\b`));
  if (m && !/=/.test(text)) return [{ target: m[2], tree: { op: "+", a: { id: m[2] }, b: { num: Number(m[1]) } }, words: true }];
  m = text.match(new RegExp(`\\b(?:${INC_VERBS})\\s+(?:the\\s+|el\\s+|la\\s+)?([a-z_][a-z0-9_]*)(?:\\s+(?:by|en)\\s+(\\d+))?`));
  if (m && !/=/.test(text)) return [{ target: m[1], tree: { op: "+", a: { id: m[1] }, b: { num: Number(m[2] || 1) } }, words: true }];
  m = text.replace(/\b(zero|cero)\b/g, "0").match(/\b(?:set|put|make|pon|poner|asigna|asignar)\s+(?:the\s+|el\s+|la\s+)?([a-z_][a-z0-9_]*)\s+(?:to|a|en|=|equal|equals|equal to|igual a|as)\s+(-?\d+(?:\.\d+)?|[a-z_][a-z0-9_]*)\b/);
  if (m && !/=/.test(text.replace(/\s=\s/, ""))) return [{ target: m[1], tree: /^-?\d/.test(m[2]) ? { num: Number(m[2]) } : { str: m[2] }, words: true }];
  m = text.match(/^\s*([a-z_][a-z0-9_]*)\s*([+-])\s*(\d+)\s*$/);
  if (m) return [{ target: m[1], tree: { op: m[2], a: { id: m[1] }, b: { num: Number(m[3]) } } }];
  m = text.replace(/\b(zero|cero)\b/g, "0").match(/^\s*(?:start\s+)?(?:the\s+|el\s+|la\s+)?([a-z_][a-z0-9_]*)\s+(?:starts|begins|empieza|comienza|vale|is|es|equals|at)(?:\s+(?:at|with|from|en|a|con))?\s+(-?\d+(?:\.\d+)?)\s*$/);
  if (m) return [{ target: m[1], tree: { num: Number(m[2]) }, words: true }];
  const out = [];
  text.split(/[,;]| and | y /).forEach((part) => {
    let p = part.match(/([a-z_][a-z0-9_]*)\s*(\+\+|--)/);
    if (p) { out.push({ target: p[1], tree: { op: p[2] === "++" ? "+" : "-", a: { id: p[1] }, b: { num: 1 } } }); return; }
    p = part.match(/([a-z_][a-z0-9_]*)\s*([+\-*])=\s*(.+)/);
    if (p) { const rhs = parseExprPrefix(p[3]); if (rhs) out.push({ target: p[1], tree: { op: p[2], a: { id: p[1] }, b: rhs } }); return; }
    p = part.match(/([a-z_][a-z0-9_]*)\s*=(?![=<>])\s*(.+)/);
    if (p) {
      const single = p[2].trim().match(/^([a-z_][a-z0-9_]*)$/);
      const rhs = parseExprPrefix(p[2]);
      if (rhs) out.push({ target: p[1], tree: rhs, maybeString: single ? single[1] : null });
    }
  });
  return out;
}

// ---------- the checker ----------

function runStrictTests({ graph, g, entry, endBoxes, rubric, matches, lang, tips = [] }) {
  const spec = rubric.strict;
  const inputs = spec.inputs || {};
  const inputNames = Object.keys(inputs);
  const classes = spec.classes || [];
  // Messages in the student's language (English or Spanish).
  const es = lang === "es";
  const L = (en, sp) => (es ? sp : en);
  const loc = (obj, key) => (obj && es && obj[`${key}_es`] !== undefined ? obj[`${key}_es`] : obj && obj[key]);
  const ex = (es && spec.examples_es) || spec.examples || {};
  const sayOf = (n) => loc(inputs[n], "say");
  const nameOf = (n) => loc(inputs[n], "name") || n;
  const optName = (n, v) => (es && inputs[n] && inputs[n].options_es && inputs[n].options_es[v]) || v;
  const stateName = (st) => (es && spec.state_names_es && spec.state_names_es[st]) || st;
  const T = (says) => L(`Test "${says}": `, `Prueba "${says}": `);
  const goes = (r) => L(`Your diagram goes: ${trace(r)}.`, `Tu diagrama hace: ${trace(r)}.`);
  const label = (id) => graph.nodes.get(id).label;
  const q = (id) => `"${label(id)}"`;
  const outs = (id) => g.out.get(id);
  // Advice shown when the diagram passes: what works but could be clearer.
  const tip = (en, sp) => { const t = L(en, sp); if (!tips.includes(t)) tips.push(t); };

  // ----- what does each name refer to? -----
  const assignmentsOf = new Map();
  graph.nodes.forEach((n, id) => {
    const list = g.decisions.includes(id) ? [] : parseAssignments(n.label).filter((a) => !(a.tree.id === a.target));
    assignmentsOf.set(id, list);
  });
  const assigned = new Set();
  const stringValues = new Set();
  assignmentsOf.forEach((list) => list.forEach((a) => { assigned.add(a.target); }));
  // "state = locked": a single word that is not a variable is a text value.
  assignmentsOf.forEach((list) => list.forEach((a) => {
    if (a.maybeString && !assigned.has(a.maybeString) && !inputRef(a.maybeString)) { a.tree = { str: a.maybeString }; stringValues.add(a.maybeString); }
    if (a.tree.str) stringValues.add(a.tree.str);
  }));

  function inputRef(name) {
    const hits = inputNames.filter((n) => has(name, inputs[n].words));
    return hits.length === 1 ? hits[0] : null;
  }
  function resolve(name) {
    if (name === "__input__") {
      const nums = inputNames.filter((n) => inputs[n].type === "number" || inputs[n].type === "list");
      return nums.length === 1 ? { input: nums[0] } : null;
    }
    if (assigned.has(name)) return { var: name };
    const input = inputRef(name);
    if (input) return { input };
    return null;
  }
  // How a value is written in code: "i", "age" / "edad", "total + price".
  const codeName = (ref) => (!ref ? "" : ref.var ? ref.var : ref.input ? (es ? (inputs[ref.input].name_es || ref.input).replace(/^(el|la|los|las) /, "") : ref.input) : "");
  const codeOf = (t) => (t.num !== undefined ? String(t.num) : t.str !== undefined ? t.str : t.id !== undefined ? (resolve(t.id) && resolve(t.id).input ? codeName(resolve(t.id)) : t.id)
    : t.op === "neg" ? `-${codeOf(t.a)}` : `${codeOf(t.a)} ${t.op} ${codeOf(t.b)}`);
  const canon = (word) => {
    for (const n of inputNames) {
      const opt = (inputs[n].options || []).find((o) => matches(word, o));
      if (opt) return opt;
    }
    return word;
  };

  // ----- reading a question -----
  const numberInputs = inputNames.filter((n) => inputs[n].type === "number");
  const boolInputs = inputNames.filter((n) => inputs[n].type === "bool");
  const listInputs = inputNames.filter((n) => inputs[n].type === "list");
  const choiceInputs = inputNames.filter((n) => inputs[n].type === "enum" || inputs[n].type === "event");
  const eventInput = inputNames.find((n) => inputs[n].type === "event");

  function parseOperand(tok) {
    if (/^-?\d/.test(tok)) return { num: Number(tok) };
    const opt = canon(tok);
    if (inputNames.some((n) => (inputs[n].options || []).includes(opt))) return { str: opt };
    const r = resolve(tok);
    if (r) return r;
    return { str: canon(tok) };
  }

  function parseCmp(text) {
    let m = text.match(/^\s*(?:is\s+|es\s+)?(-?\d+(?:\.\d+)?)\s*(>=|<=|>|<|=)\s*([a-z_][a-z0-9_]*)/);
    if (m) {
      const R = resolve(m[3]);
      if (!R) return { error: L(`I don't know what "${m[3]}" is.`, `No sé qué es "${m[3]}".`) };
      const flip = { ">=": "<=", "<=": ">=", ">": "<", "<": ">", "=": "=" };
      return { cmp: { left: R, op: flip[m[2]], right: { num: Number(m[1]) } } };
    }
    m = text.match(/([a-z_][a-z0-9_]*)?\s*(>=|<=|!=|=|>|<)\s*(-?\d+(?:\.\d+)?|[a-z_][a-z0-9_]*)/);
    if (m && (m[1] || /^-?\d/.test(m[3]) === false)) {
      // left side: the last real word before the operator
      let left = m[1];
      if (!left || FILLER.includes(left)) {
        const before = text.slice(0, m.index + (m[1] ? m[0].indexOf(m[1]) : 0)).trim().split(/\s+/).filter((w) => w && !FILLER.includes(w));
        left = before.pop() || left;
      }
      if (!left) return null;
      const ref = resolve(left);
      if (!ref) return { error: L(`I don't know what "${left}" is. Use the thing the flow asks for (${inputNames.map(nameOf).join(", ") || "none here"}) or a variable you set earlier, like i = 1.`, `No sé qué es "${left}". Usa lo que pide el flujo (${inputNames.map(nameOf).join(", ") || "nada aquí"}) o una variable que hayas fijado antes, como i = 1.`) };
      return { cmp: { left: ref, op: m[2], right: parseOperand(m[3]) } };
    }
    m = text.match(/(-?\d+(?:\.\d+)?)\s*(>=|<=|>|<)\s*([a-z_][a-z0-9_]*)/);
    if (m) {
      const R = resolve(m[3]);
      if (!R) return { error: L(`I don't know what "${m[3]}" is.`, `No sé qué es "${m[3]}".`) };
      const flip = { ">=": "<=", "<=": ">=", ">": "<", "<": ">" };
      return { cmp: { left: R, op: flip[m[2]], right: { num: Number(m[1]) } } };
    }
    for (const [re, op] of WORD_CMP) {
      m = text.match(re);
      if (!m) continue;
      if (op === null) {
        const phrase = m[0].trim();
        return { error: L(`"${phrase}" can be read two ways: does ${m[1]} count or not? Write it with a symbol: ${nameOf(numberInputs[0]) || "value"} >= ${m[1]} (${m[1]} counts) or ${nameOf(numberInputs[0]) || "value"} > ${m[1]} (${m[1]} doesn't).`, `"${phrase}" se puede entender de dos maneras: ¿cuenta el ${m[1]} o no? Escríbelo con un símbolo: ${nameOf(numberInputs[0]) || "valor"} >= ${m[1]} (el ${m[1]} cuenta) o ${nameOf(numberInputs[0]) || "valor"} > ${m[1]} (el ${m[1]} no cuenta).`) };
      }
      const before = text.slice(0, m.index).trim().split(/\s+/).filter((w) => w && !FILLER.includes(w)).pop();
      let ref = before ? resolve(before) : null;
      if (ref && ref.input && inputs[ref.input].type !== "number") ref = null;
      if (!ref && numberInputs.length === 1) ref = { input: numberInputs[0] };
      if (!ref) return { error: L(`Say what is being compared, for example ${ex.decision || "age >= 18?"}`, `Di qué se está comparando, por ejemplo ${ex.decision || "¿edad >= 18?"}`) };
      return { cmp: { left: ref, op, right: { num: Number(m[1]) }, words: m[0].trim() } };
    }
    // "Is the price 0?"
    m = text.replace(/\b(zero|cero)\b/g, "0").match(/\b(?:is|es)\s+(?:the\s+|el\s+|la\s+|this\s+|that\s+|este\s+|esta\s+|ese\s+|esa\s+)?([a-z_][a-z0-9_]*)\s+(?:equal to\s+|igual a\s+)?(-?\d+(?:\.\d+)?)\s*$/);
    if (m && resolve(m[1])) return { cmp: { left: resolve(m[1]), op: "=", right: { num: Number(m[2]) } } };
    // "price is 0?"
    m = text.match(/([a-z_][a-z0-9_]*)\s+(?:es|is|equals|igual a|equal to)\s+(-?\d+(?:\.\d+)?)\b/);
    if (m && resolve(m[1])) return { cmp: { left: resolve(m[1]), op: "=", right: { num: Number(m[2]) } } };
    return null;
  }

  // Returns { cond } or { error } for one simple question.
  function parseSimple(text, id) {
    const c = parseCmp(text);
    if (c && c.cmp && c.cmp.left.input && inputs[c.cmp.left.input].type === "bool" && c.cmp.right.str !== undefined) {
      const n = c.cmp.left.input;
      const wrongValue = has(c.cmp.right.str, inputs[n].no) || ["false", "falso", "no", "n"].includes(c.cmp.right.str);
      return { cond: { type: "bool", input: n, flip: (c.cmp.op === "!=") !== wrongValue } };
    }
    if (c) return c.error ? c : { cond: { type: "cmp", ...c.cmp } };

    const neg = negated(text);
    const age = numberInputs.find((n) => inputs[n].adult_at !== undefined);
    if (age && (hasExact(text, ADULT) || hasExact(text, MINOR))) {
      const minor = hasExact(text, MINOR) && !hasExact(text, ["mayor de edad"]);
      return { cond: { type: "adult", input: age, flip: minor !== neg } };
    }
    for (const n of listInputs) {
      if (hasExact(text, MORE)) return { cond: { type: "more", input: n, flip: neg } };
      if (hasExact(text, DONE)) return { cond: { type: "more", input: n, flip: !neg, done: true } };
      if (hasExact(text, ENTERED)) return { cond: { type: "more", input: n, flip: neg, done: true } };
    }
    if (eventInput && hasExact(text, MORE.concat(["people", "personas", "events", "eventos"])) && !inputs[eventInput].options.some((o) => matches(text, o))) {
      return { cond: { type: "more", input: eventInput, flip: neg } };
    }
    for (const n of choiceInputs) {
      const named = inputs[n].options.filter((o) => matches(text, o));
      if (named.length === 1) return { cond: { type: "is", input: n, option: named[0], flip: neg } };
      if (named.length > 1) return { error: L(`It names more than one option (${named.join(", ")}). Ask about one at a time, like "Is it ${named[0]}?", or label the arrows with the options.`, `Nombra más de una opción (${named.map((o) => optName(n, o)).join(", ")}). Pregunta por una sola cada vez, como "¿Es ${optName(n, named[0])}?", o etiqueta las flechas con las opciones.`) };
    }
    const named = stateNamed(text);
    if (named && !stringValues.size) return { cond: { type: "cmp", left: { var: "__state__" }, op: neg ? "!=" : "=", right: { str: named } } };
    // "Locked?" when the flow keeps the state in a variable (state = locked)
    const stateWord = [...stringValues].find((s) => hasExact(text, [s]));
    if (stateWord) {
      const holder = [...assignmentsOf.values()].flat().find((a) => a.tree.str === stateWord);
      return { cond: { type: "cmp", left: { var: holder.target }, op: neg ? "!=" : "=", right: { str: stateWord } } };
    }
    // The customer's own choice after a wrong answer ("Add more money?", "Cancel?"): explore both answers.
    const choiceAbout = inputNames.find((n) => inputs[n].stop_ok && (has(text, inputs[n].words) || hasExact(text, ["cancel", "cancelar", "give up"])) && (hasExact(text, ["more", "mas", "add", "another", "again", "otra", "cancel", "cancelar", "give up", "keep", "seguir"]) || hasExact(text, ["try"])));
    if (choiceAbout && !has(text, inputs[choiceAbout].yes) && !has(text, inputs[choiceAbout].no)) return { cond: { type: "choice", input: choiceAbout } };
    // yes/no facts: "Valid license?", "Password correct?", "Enough money?"
    let about = boolInputs.filter((n) => has(text, inputs[n].words));
    const meaning = (n) => has(text, inputs[n].yes) || has(text, inputs[n].no) || has(text, inputs[n].partial_no);
    if (about.length > 1) about = about.filter(meaning);
    if (about.length === 0 && boolInputs.length === 1 && meaning(boolInputs[0])) about = [boolInputs[0]];
    if (about.length === 0 && boolInputs.length > 1 && boolInputs.filter(meaning).length === 1) about = boolInputs.filter(meaning);
    if (about.length === 1) {
      const n = about[0];
      const partial = has(text, inputs[n].partial_no) && !has(text, inputs[n].no) && !has(text, inputs[n].yes);
      const noWord = has(text, inputs[n].no) || partial;
      const yesWord = has(text, inputs[n].yes);
      const arrowsSayIt = id && outs(id).some((e) => has(e.label, inputs[n].yes) || has(e.label, inputs[n].no));
      if (!noWord && !yesWord && !neg && !arrowsSayIt) {
        return { error: L(`Say what Yes means, for example ${ex[n] || ex.decision}`, `Di qué significa Sí, por ejemplo ${ex[n] || ex.decision}`) };
      }
      return { cond: { type: "bool", input: n, flip: noWord !== neg, partial } };
    }
    if (about.length > 1) return { error: L(`It could be about ${about.map(nameOf).join(" or ")}. Ask about one thing, for example ${about.map((n) => ex[n]).filter(Boolean).join(" or ")}.`, `Podría referirse a ${about.map(nameOf).join(" o ")}. Pregunta por una sola cosa, por ejemplo ${about.map((n) => ex[n]).filter(Boolean).join(" o ")}.`) };
    return null;
  }

  function parseCond(id) {
    const r = parseCondText(id);
    const worded = (c) => (c.parts ? c.parts.flatMap(worded) : c.words ? [c] : []);
    const list = r.cond ? worded(r.cond) : [];
    if (list.length) {
      const code = list.map((c) => `${codeName(c.left)} ${c.op} ${c.right.num}`).join(L(" and ", " y "));
      tip(`${q(id)} works. In code you'd write the comparison with a symbol: ${code}.`, `${q(id)} funciona. En código la comparación se escribe con un símbolo: ${code}.`);
    }
    return r;
  }
  function parseCondText(id) {
    const text = prep(label(id)).replace(/[¿?]/g, " ").trim();
    for (const [sep, type] of [[/\s+(?:and|y)\s+/, "and"], [/\s+(?:or|o)\s+/, "or"]]) {
      const parts = text.split(sep);
      if (parts.length > 1) {
        const parsed = parts.map((p) => parseSimple(p, null));
        if (parsed.every((p) => p && p.cond)) return { cond: { type, parts: parsed.map((p) => p.cond) } };
      }
    }
    const one = parseSimple(text, id);
    if (one) return one;
    return { error: L(`Write it as a yes/no question I can check, for example ${ex.decision || "age >= 18?"}`, `Escríbela como una pregunta de sí/no que yo pueda comprobar, por ejemplo ${ex.decision || "¿edad >= 18?"}`) };
  }

  // The turnstile's states named in plain words. Exact words only: "unlocked" is not "locked".
  const stateWords = spec.states || {};
  function stateNamed(text) {
    const w = ws(text);
    const hits = Object.keys(stateWords).filter((st) => stateWords[st].some((k) => w.includes(normalize(k))));
    return hits.length === 1 ? hits[0] : null;
  }

  // ----- reading every box -----
  const isEventEdge = (e) => eventInput && inputs[eventInput].options.some((o) => matches(e.label, o));
  const PASS_EDGE = (e) => Boolean(spec.count_class) && classify(e.label) === spec.count_class;

  function classify(text) {
    const scored = classes.map((c) => ({ c, q: matchQuality(text, c.words) }));
    const best = Math.max(0, ...scored.map((x) => x.q));
    if (!best) return null;
    // A typo-level match never beats a real one ("pasar" is not "parar");
    // otherwise the first class in the rubric's order wins.
    const c = (best >= 2 ? scored.find((x) => x.q >= 2) : scored.find((x) => x.q === 1)).c;
    if (negated(text) && c.negated !== undefined) return c.negated === "none" ? null : c.negated;
    return c.name;
  }

  // "Valid", "Correct", "Not valid": the yes or no outcome, but only as the last
  // step before End. Earlier in the flow the same word is just a note.
  const vagueResults = new Set();
  const vagueAsks = new Map();
  function genericClass(id) {
    const gr = spec.generic_result;
    if (!gr) return null;
    const last = endBoxes.includes(id) || (outs(id).length === 1 && endBoxes.includes(outs(id)[0].to));
    if (!last) return null;
    const w = ws(label(id)).filter((x) => !FILLER.includes(x) && !END_WORDS.includes(x));
    const not = w.length > 1 && ["not", "no"].includes(w[0]);
    const rest = not ? w.slice(1) : w;
    if (!rest.length) return null;
    const cls = rest.every((x) => GENERIC_YES.includes(x)) ? (not ? gr.no : gr.yes) : rest.every((x) => GENERIC_NO.includes(x)) ? (not ? gr.yes : gr.no) : null;
    if (cls) vagueResults.add(id);
    return cls;
  }

  function inputsAskedBy(id) {
    const n = graph.nodes.get(id);
    const text = n.label;
    let about = inputNames.filter((x) => has(text, inputs[x].ask_words || inputs[x].words));
    // A parallelogram is input OR output in flowcharts, so the shape alone doesn't mean "asks".
    const strong = hasVerb(text, ASK_VERBS);
    const cls = classes.find((c) => c.name === classify(text));
    const outcome = cls && !cls.when;
    const verb = strong || (hasVerb(text, WEAK_ASK_VERBS) && !outcome) || (n.inputShape && !classify(text));
    const onlyTopic = ws(text).every((w) => FILLER.includes(w) || about.some((x) => has(w, inputs[x].words)));
    // "Ask again" in a one-question exercise: it can only be asking that question.
    const bare = ws(text).filter((w) => !FILLER.includes(w) && !ASK_VERBS.includes(w)).length === 0;
    if (!about.length && strong && inputNames.length === 1 && !classify(text) && (bare || hasExact(text, AGAIN))) about = [inputNames[0]];
    // A bare "Input" right before "Valid selection?" asks for the selection.
    if (!about.length && strong && bare && inputNames.length > 1 && outs(id).length === 1 && g.decisions.includes(outs(id)[0].to)) {
      const r = parseCond(outs(id)[0].to);
      const asks = (c) => (c.parts ? c.parts.flatMap(asks) : c.input ? [c.input] : [c.left, c.right].filter((x) => x && x.input).map((x) => x.input));
      const next = r.cond ? [...new Set(asks(r.cond))] : [];
      if (next.length === 1) {
        about = next;
        vagueAsks.set(id, next[0]);
      }
    }
    if (!about.length) return [];
    if (verb || onlyTopic) return about;
    return [];
  }

  const readings = new Map();
  graph.nodes.forEach((node, id) => {
    if (endBoxes.includes(id)) return readings.set(id, { kind: "end", cls: classify(node.label) || genericClass(id) });
    const evOuts = outs(id).filter(isEventEdge);
    if (evOuts.length) {
      const others = outs(id).filter((e) => !isEventEdge(e));
      const unreadable = others.find((e) => e.label && !has(e.label, ["no more", "none", "nothing", "no events", "end", "fin", "done", "exit", "salir", "no hay", "ninguno", "ningun", "terminar", "finish", "stop", "off", "apagar", "close", "closes", "closed", "closing", "shut", "shuts", "shutdown", "cierra", "cierre", "cerrar"]));
      if (unreadable) return readings.set(id, { kind: "reword", text: L(`I can't read the arrow "${unreadable.label}" leaving ${q(id)}. Label it with an event (${inputs[eventInput].options.join(" or ")}) or "No more events".`, `No puedo leer la flecha "${unreadable.label}" que sale de ${q(id)}. Etiquétala con un evento (${inputs[eventInput].options.map((o) => optName(eventInput, o)).join(" o ")}) o con "No hay más eventos".`) });
      return readings.set(id, { kind: "evswitch", edges: evOuts, others });
    }
    if (g.decisions.includes(id)) {
      for (const n of choiceInputs) {
        const named = outs(id).filter((e) => inputs[n].options.some((o) => matches(e.label, o)));
        if (named.length >= 2) return readings.set(id, { kind: "switch", input: n, edges: outs(id) });
      }
      const r = parseCond(id);
      if (r.error) return readings.set(id, { kind: "reword", text: L(`I can't read the question ${q(id)}. ${r.error}`, `No puedo leer la pregunta ${q(id)}. ${r.error}`) });
      const pol = (e) => {
        if (matches(e.label, "no") || negated(e.label)) return false;
        if (matches(e.label, "yes")) return true;
        const n = r.cond.input;
        if (n && inputs[n].yes && has(e.label, inputs[n].yes)) return true;
        if (n && inputs[n].no && has(e.label, inputs[n].no)) return false;
        return null;
      };
      const yes = outs(id).filter((e) => pol(e) === true);
      const no = outs(id).filter((e) => pol(e) === false);
      if (yes.length !== 1 || no.length !== 1 || outs(id).length !== 2) {
        return readings.set(id, { kind: "reword", text: L(`Label the two arrows leaving ${q(id)} with Yes and No (one each).`, `Etiqueta las dos flechas que salen de ${q(id)} con Sí y No (una cada una).`) });
      }
      return readings.set(id, { kind: "cond", cond: r.cond, yes: yes[0], no: no[0] });
    }
    const assigns = assignmentsOf.get(id);
    if (assigns.length) {
      if (assigns.some((a) => a.words) && !/=/.test(node.label)) tip(`${q(id)} works. In code you'd write it as ${assigns.map((a) => `${a.target} = ${codeOf(a.tree)}`).join(", ")}.`, `${q(id)} funciona. En código se escribe ${assigns.map((a) => `${a.target} = ${codeOf(a.tree)}`).join(", ")}.`);
      const rest = prep(node.label).replace(/[a-z_][a-z0-9_]*\s*(\+\+|--|[+\-*]?=)\s*[^,;]*/g, " ");
      return readings.set(id, { kind: "assign", list: assigns, cls: classify(rest) });
    }
    const asked = ["outcome", "choice"].includes(spec.check.type) && classify(node.label) ? [] : inputsAskedBy(id);
    // A box that asks again, or asks while saying "error"/"invalid", only makes sense after a wrong answer.
    const errorish = (classes.find((c) => c.name === classify(node.label)) || {}).when === "wrong";
    if (asked.length) return readings.set(id, { kind: "input", inputs: asked, reask: errorish || hasExact(node.label, [...AGAIN, "more", "mas", "otra", "another"]) });
    const st = !stringValues.size && Object.keys(stateWords).length ? stateNamed(node.label) : null;
    return readings.set(id, { kind: "action", cls: classify(node.label) || genericClass(id), sets: st });
  });
  // One tip for all vague names of a kind: "valid" and "invalid" together.
  const both = (list) => [...new Set(list)].join(L(" and ", " y "));
  if (vagueResults.size) {
    const names = both([...vagueResults].map(q));
    tip(vagueResults.size > 1 ? `The ${names} boxes work, but names that say what happens, like ${ex.result}, are clearer.` : `${names} works, but a name that says what happens, like ${ex.result}, is clearer.`,
      vagueResults.size > 1 ? `Las cajas ${names} funcionan, pero los nombres que dicen qué pasa, como ${ex.result}, se entienden mejor.` : `${names} funciona, pero un nombre que diga qué pasa, como ${ex.result}, se entiende mejor.`);
  }
  if (vagueAsks.size) {
    const names = both([...vagueAsks.keys()].map(q));
    const better = both([...vagueAsks.values()].map((n) => ex[`ask_${n}`] || ex.ask));
    tip(vagueAsks.size > 1 ? `The ${names} boxes work, but names like ${better} say what is being asked for.` : `${names} works, but a name like ${better} says what is being asked for.`,
      vagueAsks.size > 1 ? `Las cajas ${names} funcionan, pero nombres como ${better} dicen qué se pide.` : `${names} funciona, pero un nombre como ${better} dice qué se pide.`);
  }
  const inputBoxes = new Set();
  readings.forEach((r) => { if (r.kind === "input") r.inputs.forEach((n) => inputBoxes.add(n)); });
  readings.forEach((r, id) => {
    if (r.kind === "evswitch") r.consume = !inputBoxes.has(eventInput);
  });

  // ----- running one test -----
  // script: answers to questions that a wrong value can go either way on
  // ("Is it empty?" for a wrong email). Each run follows one such script.
  function run(given, script = []) {
    let choice = 0;
    const ref = spec.check.reference;
    let refState = ref ? ref.start : null;
    const eventsSoFar = [];
    let stateMismatch = null;
    let misplacedAsk = null;
    let restart = null;
    const streams = {};
    inputNames.forEach((n) => { streams[n] = { list: [...(given[n] || [])], idx: 0 }; });
    const vars = {};
    const current = {};
    const path = [];
    const visits = new Map();
    const hits = [];
    let counted = 0;
    let lastDecision = -1;
    const stop = (status, extra) => ({ status, path, visits, vars, current, streams, hits, counted, lastDecision, stateMismatch, misplacedAsk, restart, ...extra });

    const fresh = {}; // read, but no decision has run since
    const consume = (n) => {
      const s = streams[n];
      if (s.idx >= s.list.length) return false;
      current[n] = s.list[s.idx];
      s.idx += 1;
      fresh[n] = true;
      if (ref && n === eventInput) { refState = ref.on[refState][current[n]][0]; eventsSoFar.push(current[n]); }
      return true;
    };
    class Halt { constructor(r) { this.r = r; } }
    class Unknown { constructor(name) { this.name = name; } }
    class Uninit { constructor(name) { this.name = name; } }
    const inputValue = (n, at) => {
      if (current[n] !== undefined) return current[n];
      if (inputBoxes.has(n)) throw new Halt(stop("error", { text: L(`${q(at)} checks the ${nameOf(n)} before the flow asks for it. Ask first, then check.`, `${q(at)} comprueba ${nameOf(n)} antes de que el flujo lo pida. Pídelo primero y luego compruébalo.`) }));
      if (!consume(n)) throw new Halt(stop("waiting"));
      return current[n];
    };
    const valueOf = (ref, at) => {
      if (ref.num !== undefined) return ref.num;
      if (ref.str !== undefined) return ref.str;
      if (ref.var !== undefined) {
        const v = vars[ref.var];
        if (v && v.uninit) throw new Halt(stop("error", { text: L(`${q(v.at)} uses ${v.uninit} before it gets a value. Set it first, for example ${v.uninit} = 0, before the loop.`, `${q(v.at)} usa ${v.uninit} antes de que tenga un valor. Fíjalo primero, por ejemplo ${v.uninit} = 0, antes del bucle.`) }));
        if (v && v.unknown) throw new Halt(stop("reword", { text: L(`In ${q(v.at)}, I don't know what "${v.unknown}" is. Use a variable you set earlier or the thing the flow asks for.`, `En ${q(v.at)} no sé qué es "${v.unknown}". Usa una variable que hayas fijado antes o lo que pide el flujo.`) }));
        if (v === undefined) throw new Halt(stop("error", { text: L(`${q(at)} uses ${ref.var} before it gets a value. Set it first, for example ${ref.var} = 0, before the loop.`, `${q(at)} usa ${ref.var} antes de que tenga un valor. Fíjalo primero, por ejemplo ${ref.var} = 0, antes del bucle.`) }));
        return vars[ref.var];
      }
      return inputValue(ref.input, at);
    };
    const evalTree = (t, at) => {
      if (t.num !== undefined) return t.num;
      if (t.str !== undefined) return t.str;
      if (t.id !== undefined) {
        const ref = resolve(t.id);
        if (!ref) throw new Unknown(t.id);
        if (ref.var !== undefined) {
          const v = vars[ref.var];
          if (v && v.unknown) throw new Unknown(v.unknown);
          if (v === undefined || (v && v.uninit)) throw new Uninit(ref.var);
        }
        return valueOf(ref, at);
      }
      if (t.op === "neg") return -evalTree(t.a, at);
      const a = evalTree(t.a, at);
      const b = evalTree(t.b, at);
      return t.op === "+" ? a + b : t.op === "-" ? a - b : t.op === "*" ? a * b : a / b;
    };
    let justRead = {};
    const test = (c, at) => {
      switch (c.type) {
        case "and": return c.parts.every((p) => test(p, at));
        case "or": return c.parts.some((p) => test(p, at));
        case "cmp": {
          const a = valueOf(c.left, at);
          const b = valueOf(c.right, at);
          switch (c.op) {
            case ">=": return a >= b;
            case ">": return a > b;
            case "<=": return a <= b;
            case "<": return a < b;
            case "!=": return a !== b;
            default: return a === b;
          }
        }
        case "adult": return (inputValue(c.input, at) >= inputs[c.input].adult_at) !== c.flip;
        case "more": {
          const s = streams[c.input];
          // "Done?" right after reading asks about the answer just typed.
          if (c.done && justRead[c.input] && current[c.input] !== undefined) return (current[c.input] !== inputs[c.input].sentinel) !== c.flip;
          const left = s.list.slice(s.idx).filter((v) => v !== inputs[c.input].sentinel).length > 0;
          return left !== c.flip;
        }
        case "is": return (inputValue(c.input, at) === c.option) !== c.flip;
        case "choice": {
          if (choice < script.length) return script[choice++];
          throw new Halt(stop("branch"));
        }
        case "bool": {
          const v = Boolean(inputValue(c.input, at));
          if (c.partial && !v) {
            if (choice < script.length) return script[choice++];
            throw new Halt(stop("branch"));
          }
          return v !== c.flip;
        }
        default: throw new Error(c.type);
      }
    };

    let node = entry;
    try {
      for (let step = 0; step < MAX_STEPS; step += 1) {
        path.push(node);
        visits.set(node, (visits.get(node) || 0) + 1);
        const r = readings.get(node);
        if (r.kind === "end") {
          if (r.cls && node !== entry) hits.push({ cls: r.cls, at: node, step: path.length - 1, seg: lastDecision, current: { ...current }, vars: { ...vars } });
          return stop("end");
        }
        // A box that names a state must match the turnstile's real state at that moment.
        if (ref && !stateMismatch && ["evswitch", "action", "assign"].includes(r.kind) && Object.keys(stateWords).length) {
          const named = stateNamed(label(node));
          if (named && named !== refState) stateMismatch = { at: node, expected: refState, after: [...eventsSoFar] };
        }
        if (r.kind === "reword") return stop("reword", { text: r.text, at: node });
        let next;
        justRead = { ...fresh };
        if (r.kind === "cond" || r.kind === "switch" || r.kind === "evswitch") Object.keys(fresh).forEach((n) => { fresh[n] = false; });
        if (r.kind === "cond") {
          lastDecision = path.length - 1;
          next = (test(r.cond, node) ? r.yes : r.no).to;
        } else if (r.kind === "switch") {
          lastDecision = path.length - 1;
          const v = inputValue(r.input, node);
          const named = r.edges.filter((e) => matches(e.label, v));
          const rest = r.edges.filter((e) => !inputs[r.input].options.some((o) => matches(e.label, o)));
          if (named.length === 1) next = named[0].to;
          else if (rest.length === 1) next = rest[0].to;
          else return stop("reword", { at: node, text: L(`${q(node)} has no arrow for "${v}". Add one, or one arrow labelled "other".`, `${q(node)} no tiene flecha para "${optName(r.input, v)}". Añade una, o una flecha etiquetada "otro".`) });
        } else if (r.kind === "evswitch") {
          if (r.consume && !consume(eventInput)) {
            if (r.others.length === 1) { next = r.others[0].to; } else return stop("idle");
          } else {
            const v = inputValue(eventInput, node);
            const named = r.edges.filter((e) => matches(e.label, v));
            if (named.length === 1) { next = named[0].to; if (PASS_EDGE(named[0])) counted += 1; } else if (r.consume) next = node; // event ignored here
            else if (r.others.length === 1) next = r.others[0].to;
            else return stop("reword", { at: node, text: L(`${q(node)} has no arrow for "${v}".`, `${q(node)} no tiene flecha para "${optName(eventInput, v)}".`) });
          }
        } else {
          if (r.kind === "assign") {
            r.list.forEach((a) => {
              try { vars[a.target] = evalTree(a.tree, node); } catch (e) {
                if (e instanceof Unknown) vars[a.target] = { unknown: e.name, at: node };
                else if (e instanceof Uninit) vars[a.target] = { uninit: e.name, at: node };
                else throw e;
              }
            });
          }
          if (r.kind === "input") {
            // After "not enough money" the flow must ask for that again (or give it back), not start over.
            // Giving the money back first and then serving the next choice is fine.
            if (!restart) {
              const m = inputNames.find((x) => inputs[x].no_restart && current[x] === false && !r.inputs.includes(x));
              const refunded = m && hits.some((h) => h.cls === inputs[m].stop_needs && h.current[m] === false);
              if (m && !refunded && r.inputs.some((x) => x !== m)) restart = { at: node, input: m };
            }
            if (r.reask && !misplacedAsk) { const n = r.inputs.find((x) => current[x] !== false && inputs[x].type === "bool"); if (n) misplacedAsk = { at: node, input: n }; }
            for (const n of r.inputs) {
              if (fresh[n]) continue; // "Ask again" then "Enter email": still the same answer
              if (!consume(n)) return stop(inputs[n].type === "event" ? "idle" : "waiting");
            }
          }
          if (r.kind === "action" && r.sets) vars.__state__ = r.sets;
          if ((r.kind === "action" || r.kind === "assign") && r.cls && node !== entry) {
            hits.push({ cls: r.cls, at: node, step: path.length - 1, seg: lastDecision, current: { ...current }, vars: { ...vars } });
            if (r.cls === spec.count_class) counted += 1;
          }
          const o = outs(node);
          if (o.length !== 1) return stop("stuck");
          if (spec.count_class && PASS_EDGE(o[0])) counted += 1;
          next = o[0].to;
        }
        node = next;
      }
    } catch (e) {
      if (e instanceof Halt) return e.r;
      throw e;
    }
    return stop("forever");
  }

  // ----- explaining a run -----
  const trace = (r) => {
    const shown = r.path.filter((id) => readings.get(id).kind !== "cond" && readings.get(id).kind !== "switch");
    const dedup = shown.filter((id, i) => i === 0 || id !== shown[i - 1]);
    const parts = dedup.map((id) => q(id));
    const cut = parts.length > 14 ? [...parts.slice(0, 4), "…", ...parts.slice(-8)] : parts;
    return cut.join(" → ");
  };
  const className = (c) => loc(classes.find((x) => x.name === c) || {}, "says") || c;

  function foreverText(r) {
    const tail = r.path.slice(-60);
    const loopDecisions = [...new Set(tail)].filter((id) => readings.get(id).kind === "cond");
    for (const id of loopDecisions) {
      const ins = condInputs(readings.get(id).cond);
      const notReAsked = ins.find((n) => !tail.some((t) => readings.get(t).kind === "input" && readings.get(t).inputs.includes(n)));
      if (notReAsked) {
        return L(`the loop goes back to ${q(id)} without asking for the ${nameOf(notReAsked)} again, so it repeats forever. Point the arrow back to the box that asks for it${inputBoxes.has(notReAsked) ? "" : ` (add one, like ${ex.ask || `"Ask ${notReAsked}"`})`}.`,
          `el bucle vuelve a ${q(id)} sin pedir otra vez ${nameOf(notReAsked)}, así que se repite para siempre. Haz que la flecha vuelva a la caja que lo pide${inputBoxes.has(notReAsked) ? "" : ` (añade una, como ${ex.ask || `"Pedir ${nameOf(notReAsked)}"`})`}.`);
      }
      const vs = condVars(readings.get(id).cond);
      const unchanged = vs.find((v) => !tail.some((t) => readings.get(t).kind === "assign" && readings.get(t).list.some((a) => a.target === v)));
      if (unchanged) return L(`the loop never ends: ${unchanged} never changes inside it. Add a step like ${unchanged} = ${unchanged} + 1.`, `el bucle nunca termina: ${unchanged} nunca cambia dentro de él. Añade un paso como ${unchanged} = ${unchanged} + 1.`);
    }
    return L("the flow goes round the loop forever and never reaches End.", "el flujo da vueltas en el bucle para siempre y nunca llega a Fin.");
  }
  const condInputs = (c) => (c.parts ? c.parts.flatMap(condInputs) : c.input ? [c.input] : [c.left, c.right].filter((x) => x && x.input).map((x) => x.input)).filter((n) => inputs[n] && inputs[n].type !== "list");
  const condVars = (c) => (c.parts ? c.parts.flatMap(condVars) : [c.left, c.right].filter((x) => x && x.var).map((x) => x.var));

  // A run that didn't finish normally. Returns an error or null.
  function abnormal(r, says, wantFinish = true) {
    if (r.status === "reword") return { kind: "reword", text: r.text };
    if (r.status === "error") return { kind: "logic", text: `${T(says)}${r.text}` };
    if (r.status === "forever") return { kind: "logic", doubtable: true, text: `${T(says)}${foreverText(r)}` };
    if (r.status === "stuck") return { kind: "logic", text: T(says) + L(`the flow gets stuck at ${q(r.path[r.path.length - 1])}.`, `el flujo se queda atascado en ${q(r.path[r.path.length - 1])}.`) };
    if (wantFinish && r.status === "waiting") return { kind: "logic", doubtable: true, text: T(says) + L("the flow should finish here, but it asks for more input. ", "el flujo debería terminar aquí, pero pide más datos. ") + goes(r) };
    return null;
  }

  // ----- test cases -----
  const check = spec.check;
  const describe = (vals) => Object.entries(vals).map(([n, v]) => {
    const say = sayOf(n);
    if (Array.isArray(say)) return v ? say[0] : say[1];
    if (say) return say.replace("{v}", Array.isArray(v) ? v.join(", ") : v);
    return `${nameOf(n)} ${v}`;
  }).join(" ");

  const results = []; // { says, error, run }
  let lastRun = null;
  const add = (says, error) => results.push({ says, error, run: lastRun });

  // Every path a run can take (see run's script), stopping at 64.
  function runs(given) {
    const out = [];
    const stack = [[]];
    while (stack.length && out.length < 64) {
      const script = stack.pop();
      const r = run(given, script);
      if (r.status === "branch") { stack.push([...script, false], [...script, true]); continue; }
      out.push(r);
    }
    return out;
  }
  // The first error over every path, or null.
  function judge(given, evaluate) {
    for (const r of runs(given)) {
      lastRun = r;
      const e = evaluate(r);
      if (e) return e;
    }
    return null;
  }

  // The outcome a run reached: the first box after the last decision that says one.
  function outcomeOf(r) {
    const after = r.hits.filter((h) => h.step > r.lastDecision);
    if (after.length) return { cls: after[0].cls, at: after[0].at };
    const unread = r.path.slice(r.lastDecision + 1).filter((id) => readings.get(id).kind === "action" && !readings.get(id).cls && id !== entry);
    return { cls: null, at: unread[0] };
  }
  const classInfo = (c) => classes.find((x) => x.name === c) || {};

  if (check.first_input) {
    const order = [];
    const seen = new Set([entry]);
    const queue = [entry];
    while (queue.length) {
      const cur = queue.shift();
      if (readings.get(cur).kind === "cond") order.push(cur);
      outs(cur).forEach((e) => { if (!seen.has(e.to)) { seen.add(e.to); queue.push(e.to); } });
    }
    if (order.length && !condInputs(readings.get(order[0]).cond).includes(check.first_input)) {
      add("", { kind: "logic", text: L(`Check the ${nameOf(check.first_input)} first: ${q(order[0])} comes before it.`, `Comprueba primero ${nameOf(check.first_input)}: ${q(order[0])} va antes.`) });
    }
  }
  if (check.type === "outcome") {
    const numbers = new Set();
    graph.nodes.forEach((n) => (prep(n.label).match(/-?\d+(?:\.\d+)?/g) || []).forEach((x) => numbers.add(Number(x))));
    const valuesFor = (n) => {
      if (inputs[n].type === "bool") return [true, false];
      const set = new Set([0, 120]);
      [...(check.thresholds[n] || []), ...numbers].forEach((c) => [c - 1, c, c + 1].forEach((v) => { if (v >= 0) set.add(v); }));
      const near = (v) => Math.min(...(check.thresholds[n] || [0]).map((t) => Math.abs(v - t)));
      return [...set].sort((a, b) => near(a) - near(b) || a - b);
    };
    let combos = [{}];
    inputNames.forEach((n) => { combos = combos.flatMap((c) => valuesFor(n).map((v) => ({ ...c, [n]: v }))); });
    combos.forEach((vals) => {
      const want = check.rule.find((rule) => Object.entries(rule.if || {}).every(([n, cond]) => (Array.isArray(cond) ? test2(vals[n], cond) : vals[n] === cond))).then;
      const says = describe(vals);
      add(says, judge(Object.fromEntries(Object.entries(vals).map(([n, v]) => [n, [v]])), (r) => {
        const bad = abnormal(r, says);
        if (bad) return bad;
        const got = outcomeOf(r);
        if (!got.cls) {
          if (got.at) return { kind: "reword", text: L(`I can't tell what ${q(got.at)} means for the result. ${ex.result ? `Use words like ${ex.result}.` : ""}`, `No sé qué significa ${q(got.at)} para el resultado. ${ex.result ? `Usa palabras como ${ex.result}.` : ""}`) };
          return { kind: "logic", text: T(says) + L(`after the decision, add a box that says what happens, like ${ex.result}.`, `después de la decisión, añade una caja que diga qué pasa, como ${ex.result}.`) };
        }
        if (got.cls !== want) return { kind: "logic", text: T(says) + L(`the answer should be "${className(want)}". Your diagram goes: ${trace(r)}, and ${q(got.at)} means "${className(got.cls)}".`, `la respuesta debería ser "${className(want)}". Tu diagrama hace: ${trace(r)}, y ${q(got.at)} significa "${className(got.cls)}".`) };
        return null;
      }));
    });
  }

  if (check.type === "choice") {
    const n = check.input;
    inputs[n].options.forEach((opt) => {
      const says = (sayOf(n) || "{v}").replace("{v}", optName(n, opt));
      add(says, judge({ [n]: [opt] }, (r) => {
        const bad = abnormal(r, says);
        if (bad) return bad;
        const got = outcomeOf(r);
        if (!got.cls) {
          if (got.at) return { kind: "reword", text: L(`I can't tell what ${q(got.at)} tells the driver to do. Use words like ${ex.result}.`, `No sé qué le indica ${q(got.at)} al conductor. Usa palabras como ${ex.result}.`) };
          return { kind: "logic", text: T(says) + L(`add a box that says what to do for ${opt}, like ${ex.result}.`, `añade una caja que diga qué hacer con ${optName(n, opt)}, como ${ex.result}.`) };
        }
        const want = check.expect[opt];
        if (!want.includes(got.cls)) return { kind: "logic", text: T(says) + L(`${opt} should mean ${want.map(className).join(" or ")}, but your diagram says ${q(got.at)} (${className(got.cls)}).`, `${optName(n, opt)} debería significar ${want.map(className).join(" o ")}, pero tu diagrama dice ${q(got.at)} (${className(got.cls)}).`) };
        return null;
      }));
    });
  }

  if (check.type === "retry") {
    // Asking again is the point of these exercises, so each question needs a box that asks it.
    const unasked = check.inputs.filter((n) => !inputBoxes.has(n));
    unasked.forEach((n) => add(`asking for the ${n}`, { kind: "logic", text: L(`Add a step that asks for the ${nameOf(n)}, like ${ex[`ask_${n}`] || ex.ask}, and point the "try again" arrow back to it.`, `Añade un paso que pida ${nameOf(n)}, como ${ex[`ask_${n}`] || ex.ask}, y haz que la flecha de "intentar de nuevo" vuelva a él.`) }));
  }
  if (check.type === "retry" && !results.length) {
    // The user answers wrong k times, then right every time they're asked
    // (a flow may restart and ask an earlier question again).
    const ks = Array.from({ length: (check.max_wrong || 3) + 1 }, (_, k) => k);
    let combos = [{}];
    check.inputs.forEach((n) => { combos = combos.flatMap((c) => ks.map((k) => ({ ...c, [n]: k }))); });
    combos.forEach((wrongs) => {
      const given = Object.fromEntries(check.inputs.map((n) => [n, [...Array(wrongs[n]).fill(false), ...Array(12).fill(true)]]));
      const says = check.inputs.map((n) => {
        const wrong = wrongs[n];
        return wrong ? L(`${sayOf(n)[1]} ${wrong === 1 ? "once" : `${wrong} times`}, then ${sayOf(n)[0]}`, `${sayOf(n)[1]} ${wrong === 1 ? "una vez" : `${wrong} veces`}, luego ${sayOf(n)[0]}`) : sayOf(n)[0];
      }).join("; ");
      add(says, judge(given, (r) => {
        if (r.status === "waiting") {
          const n = check.inputs.find((x) => r.streams[x].idx >= r.streams[x].list.length) || check.inputs[0];
          return { kind: "logic", doubtable: true, text: T(says) + L(`after ${sayOf(n)[0]}, the flow should move on, but it keeps asking. `, `después de ${sayOf(n)[0]}, el flujo debería seguir adelante, pero sigue preguntando. `) + goes(r) };
        }
        const bad = abnormal(r, says);
        if (bad) return bad;
        // Result boxes must fit the answers given so far: no "Access granted"
        // after a wrong password, no "Invalid email" after a valid one.
        const asked = (h) => check.inputs.some((n) => h.current[n] !== undefined);
        for (const h of r.hits.filter(asked)) {
          const info = classInfo(h.cls);
          // An error box that names one question ("Invalid code", "Not enough money")
          // must follow a wrong answer to that question.
          const named = check.inputs.filter((n) => has(label(h.at), inputs[n].words));
          const watched = info.about ? [info.about] : named.length === 1 ? named : check.inputs;
          const anyWrong = watched.some((n) => h.current[n] === false);
          const allRight = check.inputs.every((n) => h.current[n] === true);
          if (info.when === "wrong" && !anyWrong) return { kind: "logic", text: T(says) + L(`${q(h.at)} shows up although ${watched.length === 1 ? `there was ${sayOf(watched[0])[0]}` : "every answer was right"}. `, `${q(h.at)} aparece aunque ${watched.length === 1 ? `hubo ${sayOf(watched[0])[0]}` : "todas las respuestas fueron correctas"}. `) + goes(r) };
          if ((info.when === "right" || h.cls === check.success) && !allRight) return { kind: "logic", text: T(says) + L(`${q(h.at)} shows up before every check has passed. `, `${q(h.at)} aparece antes de que pasen todas las comprobaciones. `) + goes(r) };
        }
        if (r.restart) return { kind: "logic", text: T(says) + L(`after ${sayOf(r.restart.input)[1]}, the flow goes back to ${q(r.restart.at)} and starts over. Ask for more money, or give the money back and finish. `, `después de ${sayOf(r.restart.input)[1]}, el flujo vuelve a ${q(r.restart.at)} y empieza de nuevo. Pide más dinero, o devuelve el dinero y termina. `) + goes(r) };
        if (r.misplacedAsk) return { kind: "logic", text: T(says) + L(`${q(r.misplacedAsk.at)} asks again although there was no ${sayOf(r.misplacedAsk.input)[1].replace(/^(a|an) /, "")}. `, `${q(r.misplacedAsk.at)} vuelve a pedir aunque no hubo ${sayOf(r.misplacedAsk.input)[1]}. `) + goes(r) };
        const short = check.inputs.filter((n) => r.streams[n].idx < wrongs[n] + 1);
        const okHits = r.hits.filter((h, i, all) => h.cls === check.success && asked(h) && !all.slice(0, i).some((x) => x.cls === h.cls && x.seg === h.seg));
        // Some questions may also just stop (give the money back and finish),
        // but only right after a wrong answer to that question.
        if (short.length && short.every((n) => inputs[n].stop_ok && r.streams[n].idx >= 1 && r.current[n] === false) && !okHits.length) {
          const needs = short.map((n) => inputs[n].stop_needs).filter(Boolean).find((c) => !r.hits.some((h) => h.cls === c));
          if (needs) return { kind: "logic", text: T(says) + L(`the flow stops without a step where ${className(needs)}. Add one, or ask again.`, `el flujo termina sin un paso en el que ${className(needs)}. Añádelo, o vuelve a pedir.`) };
          return null;
        }
        if (short.length) return { kind: "logic", doubtable: true, text: T(says) + L(`after ${sayOf(short[0])[1]}, the flow should ask again, but it doesn't. `, `después de ${sayOf(short[0])[1]}, el flujo debería volver a pedir, pero no lo hace. `) + goes(r) };
        if (check.success) {
          if (!okHits.length) {
            const unread = r.path.filter((id) => readings.get(id).kind === "action" && !readings.get(id).cls && id !== entry);
            if (unread.length && !r.hits.length) return { kind: "reword", text: L(`I can't find the step where ${className(check.success)}. Say it in a box, for example ${ex.result}.`, `No encuentro el paso en el que ${className(check.success)}. Dilo en una caja, por ejemplo ${ex.result}.`) };
            return { kind: "logic", text: T(says) + L(`the flow should reach a step where ${className(check.success)}. `, `el flujo debería llegar a un paso en el que ${className(check.success)}. `) + goes(r) };
          }
          if (okHits.length > 1) return { kind: "logic", text: T(says) + L(`${q(okHits[0].at)} happens ${okHits.length} times; it should happen once. `, `${q(okHits[0].at)} ocurre ${okHits.length} veces; debería ocurrir una sola vez. `) + goes(r) };
        }
        return null;
      }));
    });
  }

  if (check.type === "counter") {
    const says = loc(check, "says");
    add(says, judge({}, (r) => {
      const bad = abnormal(r, says);
      if (bad) return bad;
      const inLoop = (id) => g.loops.some((loop) => loop.has(id));
      // A box can grade and count at once: "Grade assignment i, then i = i + 1".
      const grades = (id) => readings.get(id).kind === "assign" && check.step_words && has(label(id), check.step_words);
      const body = [...graph.nodes.keys()].filter((id) => inLoop(id) && (readings.get(id).kind === "action" || grades(id)));
      const wrong = body.find((id) => (r.visits.get(id) || 0) !== check.times);
      const summary = r.hits.filter((h) => h.cls === check.summary && h.step > r.lastDecision);
      const inside = body.find((id) => check.summary_words && has(label(id), check.summary_words));
      if (inside) return { kind: "logic", text: T(says) + L(`${q(inside)} is inside the loop, so it runs every time. Show the summary after the loop.`, `${q(inside)} está dentro del bucle, así que se ejecuta cada vez. Muestra el resumen después del bucle.`) };
      if (!body.length) return { kind: "logic", text: T(says) + L("put the step that grades an assignment inside the loop.", "pon dentro del bucle el paso que califica una tarea.") };
      if (wrong) return { kind: "logic", doubtable: true, text: T(says) + L(`the loop should run ${check.times} times, but ${q(wrong)} runs ${r.visits.get(wrong) || 0} time(s).`, `el bucle debería ejecutarse ${check.times} veces, pero ${q(wrong)} se ejecuta ${r.visits.get(wrong) || 0} vez/veces.`) };
      if (!summary.length) return { kind: "reword", text: L(`After the loop, I can't find the step that shows the summary. Say it in a box, for example ${ex.result}.`, `Después del bucle no encuentro el paso que muestra el resumen. Dilo en una caja, por ejemplo ${ex.result}.`) };
      return null;
    }));
  }

  if (check.type === "accumulate") {
    const n = check.input;
    const loopVars = new Set();
    graph.nodes.forEach((_, id) => {
      const r = readings.get(id);
      if (r.kind === "assign" && g.loops.some((loop) => loop.has(id))) r.list.forEach((a) => loopVars.add(a.target));
    });
    const candidatesOf = (at) => {
      const named = ws(label(at.at)).filter((w) => assigned.has(w));
      return named.length ? named : [...loopVars].filter((v) => !inputRef(v));
    };
    check.lists.forEach((list) => {
      const says = (sayOf(n) || "{v}").replace("{v}", list.join(", "));
      const want = list.reduce((a, b) => a + b, 0);
      add(says, judge({ [n]: [...list, inputs[n].sentinel] }, (r) => {
        const bad = abnormal(r, says);
        if (bad) return bad;
        const unread = r.streams[n].list.slice(r.streams[n].idx).filter((v) => v !== inputs[n].sentinel);
        if (unread.length) return { kind: "logic", doubtable: true, text: T(says) + L("the flow stops before reading every price. ", "el flujo termina antes de leer todos los precios. ") + goes(r) };
        const shown = r.hits.filter((h) => h.cls === check.show && h.step > r.lastDecision);
        if (!shown.length) return { kind: "reword", text: L(`After the loop, I can't find the step that shows the total. Say it in a box, for example ${ex.result}.`, `Después del bucle no encuentro el paso que muestra el total. Dilo en una caja, por ejemplo ${ex.result}.`) };
        const at = shown[0];
        const uninitVar = candidatesOf(at).map((v) => at.vars[v]).find((v) => v && v.uninit);
        if (uninitVar) return { kind: "logic", text: T(says) + L(`${q(uninitVar.at)} uses ${uninitVar.uninit} before it gets a value. Set it first, for example ${uninitVar.uninit} = 0, before the loop.`, `${q(uninitVar.at)} usa ${uninitVar.uninit} antes de que tenga un valor. Fíjalo primero, por ejemplo ${uninitVar.uninit} = 0, antes del bucle.`) };
        const unknownVar = candidatesOf(at).map((v) => at.vars[v]).find((v) => v && v.unknown);
        if (unknownVar) return { kind: "reword", text: L(`In ${q(unknownVar.at)}, I don't know what "${unknownVar.unknown}" is. Use a variable you set earlier or the thing the flow asks for.`, `En ${q(unknownVar.at)} no sé qué es "${unknownVar.unknown}". Usa una variable que hayas fijado antes o lo que pide el flujo.`) };
        const named = ws(label(at.at)).filter((w) => assigned.has(w));
        const candidates = named.length ? named : [...loopVars].filter((v) => !inputRef(v));
        if (!candidates.length) return { kind: "reword", text: L(`I can't find the running total. Write the adding step like ${ex.add}.`, `No encuentro el total acumulado. Escribe el paso de sumar como ${ex.add}.`) };
        if (!candidates.some((v) => at.vars[v] === want)) {
          return { kind: "logic", doubtable: true, text: T(says) + L(`the total should be ${want}, but when ${q(at.at)} runs, ${candidates.map((v) => `${v} = ${at.vars[v] === undefined ? "nothing yet" : at.vars[v]}`).join(", ")}.`, `el total debería ser ${want}, pero cuando se ejecuta ${q(at.at)}, ${candidates.map((v) => `${v} = ${at.vars[v] === undefined ? "nada todavía" : at.vars[v]}`).join(", ")}.`) };
        }
        return null;
      }));
    });
  }

  if (check.type === "events") {
    const ref = check.reference;
    const refRun = (seq) => {
      let state = ref.start;
      let passes = 0;
      seq.forEach((e) => { const t = ref.on[state][e]; state = t[0]; if (t[1]) passes += 1; });
      return passes;
    };
    const seqs = [];
    const grow = (s) => { if (s.length) seqs.push(s); if (s.length < check.max_len) inputs[eventInput].options.forEach((o) => grow([...s, o])); };
    grow([]);
    const anyCounter = [...readings.values()].some((r) => (r.kind === "action" || r.kind === "assign") && r.cls === spec.count_class) || graph.edges.some(PASS_EDGE);
    if (!anyCounter) add("", { kind: "reword", text: L(`I can't find the step where a person passes through. Add a box like ${ex.result}.`, `No encuentro el paso en el que una persona pasa. Añade una caja como ${ex.result}.`) });
    else {
      seqs.sort((a, b) => a.length - b.length).forEach((seq) => {
        const says = seq.map((o) => optName(eventInput, o)).join(", ");
        add(says, judge({ [eventInput]: seq }, (r) => {
          const bad = abnormal(r, says, false);
          if (bad) return bad;
          const want = refRun(seq);
          if (r.status === "end" && r.streams[eventInput].idx < seq.length) {
            return { kind: "logic", text: T(says) + L(`the turnstile should keep handling events, but your flow ends after ${r.streams[eventInput].idx} of them.`, `el torniquete debería seguir atendiendo eventos, pero tu flujo termina después de ${r.streams[eventInput].idx}.`) };
          }
          if (r.counted !== want) {
            return { kind: "logic", text: T(says) + L(`${want === 1 ? "1 person" : `${want} people`} should get through, but your diagram lets ${r.counted} through.`, `${want === 1 ? "debería pasar 1 persona" : `deberían pasar ${want} personas`}, pero tu diagrama deja pasar ${r.counted}.`) };
          }
          if (r.stateMismatch) {
            const m = r.stateMismatch;
            return { kind: "logic", text: T(says) + L(`${m.after.length ? `after ${m.after.join(", ")}` : "at the start"} the turnstile is ${m.expected}, but your flow is at ${q(m.at)}.`, `${m.after.length ? `después de ${m.after.map((o) => optName(eventInput, o)).join(", ")}` : "al principio"} el torniquete está ${stateName(m.expected)}, pero tu flujo está en ${q(m.at)}.`) };
          }
          return null;
        }));
      });
    }
  }

  function test2(v, [op, n]) {
    return op === ">=" ? v >= n : op === ">" ? v > n : op === "<=" ? v <= n : op === "<" ? v < n : v === n;
  }

  // Report: every reword (deduplicated), else the first two failing tests.
  const rewords = [...new Set(results.filter((x) => x.error && x.error.kind === "reword").map((x) => x.error.text))];
  if (rewords.length) return rewords.map((text) => ({ kind: "reword", text }));
  const failing = results.filter((x) => x.error);
  if (!failing.length) return [];
  const doubtful = (id) => {
    const r = readings.get(id);
    if (r.kind !== "action" || id === entry) return null;
    const text = label(id);
    // A box already read as a result ("Wrong password, try again") is understood: it's a message, not an ask.
    if (!r.cls && (hasExact(text, ASK_VERBS) || hasExact(text, WEAK_ASK_VERBS) || hasExact(text, ["try", "retry", "intenta", "intentar", "reintentar"]))) {
      return L(`I can't tell what ${q(id)} asks for. If it asks again, point the arrow back to the box that asks${ex.ask ? `, like ${ex.ask}` : ""}.`, `No sé qué pide ${q(id)}. Si vuelve a pedir algo, haz que la flecha vuelva a la caja que lo pide${ex.ask ? `, como ${ex.ask}` : ""}.`);
    }
    if ((hasExact(text, CHANGE) || /[+=]/.test(text)) && g.loops.some((loop) => loop.has(id))) {
      return L(`I can't tell what ${q(id)} changes. Write it as a calculation, like ${ex.add || "i = i + 1"}.`, `No sé qué cambia ${q(id)}. Escríbelo como un cálculo, como ${ex.add || "i = i + 1"}.`);
    }
    return null;
  };
  const doubts = [...new Set(failing.filter((x) => x.error.doubtable).flatMap((x) => (x.run ? [...new Set(x.run.path)] : [])).map(doubtful).filter(Boolean))];
  if (doubts.length) return doubts.map((text) => ({ kind: "reword", text }));
  const out = [...new Set(failing.map((x) => x.error.text))].slice(0, 2).map((text) => ({ kind: "logic", text }));
  if (failing.length > 2) out.push({ kind: "logic", text: L(`${failing.length} of ${results.length} test cases fail.`, `Fallan ${failing.length} de ${results.length} casos de prueba.`) });
  return out;
}

module.exports = { runStrictTests, parseAssignments, prep };
