// Prototype: validates a Mermaid flowchart by its logic (graph shape + branch
// meanings), never by node IDs or exact wording.

// ---------- text helpers ----------

function normalize(value) {
  return String(value || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function words(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

// Damerau-Levenshtein distance capped at 2 (we only care about 0, 1, or more).
function typoDistance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// Does a student's word match a keyword? Exact, longer form of a 4+ letter
// keyword (valid -> valida), or a one-letter typo of a 5+ letter keyword.
function wordMatches(word, key) {
  if (word === key) return true;
  if (key.length >= 4 && word.startsWith(key)) return true;
  if (key.length >= 5) {
    if (typoDistance(word, key) <= 1) return true;
    for (const len of [key.length - 1, key.length, key.length + 1]) {
      if (len < word.length && typoDistance(word.slice(0, len), key) <= 1) return true;
    }
  }
  return false;
}

function cleanLabel(raw) {
  // Outer quotes first, so an escaped quote at the end of the text survives.
  return String(raw || "")
    .replace(/^\s*"([\s\S]*)"\s*$/, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    // One pass, so "#35;quot;" (a literal "#quot;") is not decoded twice.
    .replace(/&?#(\d+|quot|apos|lt|gt|amp);|&(quot|apos|lt|gt|amp);/g, (_, code, html) =>
      ({ quot: '"', apos: "'", lt: "<", gt: ">", amp: "&" })[code || html] ?? String.fromCharCode(Number(code)))
    .replace(/\\"/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- parser ----------

const SKIP_LINE = /^(flowchart|graph|subgraph|end$|classDef|class\s|style\s|linkStyle|click\s|direction\s|%%)/;

// Longest openers first. Each entry: [opener, closers[], isDecision]
const SHAPES = [
  ["(((", [")))"]], ["((", ["))"]], ["([", ["])"]], ["[[", ["]]"]], ["[(", [")]"]],
  ["{{", ["}}"]], ["[/", ["/]", "\\]"], false, true], ["[\\", ["\\]", "/]"], false, true],
  ["[", ["]"]], ["(", [")"]], ["{", ["}"], true], [">", ["]"]]
];

const INLINE_LINK = /(<)?(--|==|-\.)(?![->.=])\s*([^|]+?)\s*(-{2,}>|-{3,}|={2,}>|={3,}|\.-+>|\.-+|-{2,}[ox]|={2,}[ox])/y;
const PLAIN_LINK = /(<)?(-{2,}>|-{3,}|={2,}>|={3,}|-\.+->|-\.+-|-{2,}[ox](?=\s)|={2,}[ox](?=\s)|~~~)/y;
const PIPE_LABEL = /\s*\|([^|]*)\|/y;
const NODE_ID = /[\p{L}\p{N}_]+/uy;

function splitStatements(text) {
  const out = [];
  String(text || "").split(/\r?\n/).forEach((line) => {
    let depth = 0;
    let quoted = false;
    let current = "";
    for (const ch of line) {
      if (ch === '"' && !current.endsWith("\\")) quoted = !quoted;
      if (!quoted && "[({".includes(ch)) depth += 1;
      if (!quoted && "])}".includes(ch)) depth = Math.max(0, depth - 1);
      if (ch === ";" && !quoted && depth === 0 && !/&?#[A-Za-z0-9]+$/.test(current)) { out.push(current); current = ""; continue; }
      current += ch;
    }
    out.push(current);
  });
  return out.map((s) => s.trim()).filter((s) => s && !SKIP_LINE.test(s));
}

function parseStatement(stmt, graph) {
  let pos = 0;
  const skipWs = () => { while (pos < stmt.length && /\s/.test(stmt[pos])) pos += 1; };

  const readShape = () => {
    for (const [open, closers, isDecision, isInput] of SHAPES) {
      if (!stmt.startsWith(open, pos)) continue;
      let p = pos + open.length;
      let label;
      const lead = stmt.slice(p).match(/^\s*"/);
      if (lead) {
        const startQuote = p + lead[0].length;
        let endQuote = stmt.indexOf('"', startQuote);
        while (endQuote > 0 && stmt[endQuote - 1] === "\\") endQuote = stmt.indexOf('"', endQuote + 1);
        if (endQuote === -1) return null;
        label = stmt.slice(startQuote, endQuote);
        p = endQuote + 1;
        while (p < stmt.length && /\s/.test(stmt[p])) p += 1;
        const closer = closers.find((c) => stmt.startsWith(c, p));
        if (!closer) return null;
        p += closer.length;
      } else {
        let best = -1;
        let bestCloser = null;
        closers.forEach((c) => {
          const i = stmt.indexOf(c, p);
          if (i !== -1 && (best === -1 || i < best)) { best = i; bestCloser = c; }
        });
        if (best === -1) return null;
        label = stmt.slice(p, best);
        p = best + bestCloser.length;
      }
      pos = p;
      return { label: cleanLabel(label), decision: Boolean(isDecision), input: Boolean(isInput) };
    }
    return null;
  };

  const readNode = () => {
    NODE_ID.lastIndex = pos;
    const m = NODE_ID.exec(stmt);
    if (!m) return null;
    pos = NODE_ID.lastIndex;
    const shape = readShape();
    const cls = stmt.slice(pos).match(/^:::[\w-]+/);
    if (cls) pos += cls[0].length;
    const id = m[0];
    const node = graph.nodes.get(id) || { id, label: "", decisionShape: false };
    if (shape && shape.label && !node.label) node.label = shape.label;
    if (shape && shape.decision) node.decisionShape = true;
    if (shape && shape.input) node.inputShape = true;
    graph.nodes.set(id, node);
    return id;
  };

  const readGroup = () => {
    skipWs();
    const first = readNode();
    if (!first) return null;
    const ids = [first];
    for (;;) {
      skipWs();
      if (stmt[pos] !== "&") break;
      pos += 1;
      skipWs();
      const next = readNode();
      if (!next) break;
      ids.push(next);
    }
    return ids;
  };

  const readLink = () => {
    skipWs();
    for (const re of [INLINE_LINK, PLAIN_LINK]) {
      re.lastIndex = pos;
      const m = re.exec(stmt);
      if (!m) continue;
      pos = re.lastIndex;
      let label = re === INLINE_LINK ? m[3] : "";
      PIPE_LABEL.lastIndex = pos;
      const pipe = PIPE_LABEL.exec(stmt);
      if (pipe) { label = pipe[1]; pos = PIPE_LABEL.lastIndex; }
      const arrow = re === INLINE_LINK ? m[4] : m[2];
      return { label: cleanLabel(label), both: Boolean(m[1]), invisible: arrow === "~~~" };
    }
    return null;
  };

  let left = readGroup();
  if (!left) return;
  for (;;) {
    const link = readLink();
    if (!link) break;
    const right = readGroup();
    if (!right) break;
    if (!link.invisible) {
      left.forEach((from) => right.forEach((to) => {
        graph.edges.push({ from, to, label: link.label });
        if (link.both) graph.edges.push({ from: to, to: from, label: link.label });
      }));
    }
    left = right;
  }
}

function parseFlowchart(text) {
  const graph = { nodes: new Map(), edges: [] };
  splitStatements(text).forEach((stmt) => parseStatement(stmt, graph));
  return graph;
}

// ---------- graph analysis ----------

function analyze(graph) {
  const out = new Map();
  const inn = new Map();
  graph.nodes.forEach((_, id) => { out.set(id, []); inn.set(id, []); });
  graph.edges.forEach((e) => { out.get(e.from).push(e); inn.get(e.to).push(e); });

  const reach = (starts, adj, pick) => {
    const seen = new Set(starts);
    const queue = [...starts];
    while (queue.length) {
      const cur = queue.shift();
      adj.get(cur).forEach((e) => {
        const nxt = pick(e);
        if (!seen.has(nxt)) { seen.add(nxt); queue.push(nxt); }
      });
    }
    return seen;
  };

  // Tarjan's strongly connected components; a "loop" is a component with
  // more than one node, or a single node that points to itself.
  let index = 0;
  const stack = [];
  const meta = new Map();
  const loops = [];
  const strong = (v) => {
    meta.set(v, { index, low: index, onStack: true });
    index += 1;
    stack.push(v);
    out.get(v).forEach(({ to: w }) => {
      if (!meta.has(w)) {
        strong(w);
        meta.get(v).low = Math.min(meta.get(v).low, meta.get(w).low);
      } else if (meta.get(w).onStack) {
        meta.get(v).low = Math.min(meta.get(v).low, meta.get(w).index);
      }
    });
    if (meta.get(v).low === meta.get(v).index) {
      const comp = [];
      let w;
      do { w = stack.pop(); meta.get(w).onStack = false; comp.push(w); } while (w !== v);
      const selfLoop = out.get(v).some((e) => e.to === v);
      if (comp.length > 1 || selfLoop) loops.push(new Set(comp));
    }
  };
  graph.nodes.forEach((_, id) => { if (!meta.has(id)) strong(id); });

  const isDecision = (id) => graph.nodes.get(id).decisionShape || out.get(id).length >= 2;
  const decisions = [...graph.nodes.keys()].filter(isDecision);

  return { out, inn, reach, loops, decisions };
}

// ---------- branch meaning ----------

function makeMatcher(groups) {
  const table = {};
  Object.entries(groups).forEach(([name, list]) => { table[name] = new Set(list.map(normalize)); });
  const hit = (w, name) => table[name] && [...table[name]].some((k) => wordMatches(w, k));
  return (label, name) => {
    const ws = words(label);
    if (name === "yes") return !ws.some((w) => hit(w, "no")) && ws.some((w) => hit(w, "yes"));
    return ws.some((w) => hit(w, name));
  };
}

// ---------- language ----------

// Spanish or English, guessed from the student's own words. Messages follow it.
const ES_WORDS = new Set(["inicio", "fin", "si", "edad", "pedir", "mostrar", "leer", "precio", "moneda", "empujar",
  "bloqueado", "desbloqueado", "seleccionar", "dinero", "tarea", "tareas", "correo", "luz", "verde", "rojo", "amarillo",
  "alquilar", "licencia", "hervir", "preparar", "servir", "cafe", "contrasena", "puede", "valida", "valido", "correcta",
  "suficiente", "entregar", "devolver", "persona", "eventos", "mas", "calificar", "resumen", "registro", "continuar",
  "avanzar", "detenerse", "agua", "el", "la", "de", "los", "las", "y", "es", "hay", "no puede", "articulos", "producto"]);
const EN_WORDS = new Set(["start", "end", "yes", "ask", "show", "read", "price", "coin", "push", "locked", "unlocked",
  "select", "money", "assignment", "light", "green", "red", "yellow", "rent", "license", "boil", "brew", "serve",
  "coffee", "password", "can", "valid", "correct", "enough", "dispense", "return", "person", "passes", "events", "more",
  "grade", "summary", "registration", "continue", "go", "stop", "water", "the", "of", "and", "is", "a", "to", "product"]);
function detectLanguage(text) {
  const raw = String(text || "");
  let es = (raw.match(/[¿¡ñÑáéíóúÁÉÍÓÚ]/g) || []).length * 2;
  let en = 0;
  words(raw).forEach((w) => { if (ES_WORDS.has(w)) es += 1; if (EN_WORDS.has(w)) en += 1; });
  return es > en ? "es" : "en";
}

// ---------- rubric checks ----------

function labelOf(graph, id) {
  const n = graph.nodes.get(id);
  return n && n.label ? `"${n.label}"` : id;
}

function validateFlow(answer, rubric, synonyms, opts = {}) {
  const lang = opts.lang || process.env.FLOW_LANG || detectLanguage(answer);
  const L = (en, es) => (lang === "es" ? es : en);
  const loc = (obj, key) => (lang === "es" && obj[`${key}_es`] !== undefined ? obj[`${key}_es`] : obj[key]);
  const WORD_ES = { yes: "sí", no: "no", green: "verde", yellow: "amarillo", red: "rojo", coin: "moneda", push: "empujar" };
  const say = (w) => L(w, WORD_ES[w] || w);
  const graph = parseFlowchart(answer);
  const errors = [];
  const fail = (msg) => { errors.push(msg); return { pass: false, errors, graph }; };

  if (graph.edges.length === 0) return fail(L("No arrows found. Connect your steps with arrows like A --> B.", "No encontré flechas. Conecta tus pasos con flechas como A --> B."));

  // Mistakes that stop Mermaid from drawing the diagram at all.
  const headers = String(answer || "").split("\n").filter((line) => /^\s*(?:flowchart|graph)\b/i.test(line)).length;
  if (headers > 1) errors.push(L(`Mermaid can't draw this: the "flowchart" line appears ${headers} times. Keep only the first one.`, `Mermaid no puede dibujar esto: la línea "flowchart" aparece ${headers} veces. Deja solo la primera.`));
  if (graph.nodes.has("end")) errors.push(L(`Mermaid can't draw this: "end" is a reserved word, so a box can't be named end. Rename the box, for example to End or E.`, `Mermaid no puede dibujar esto: "end" es una palabra reservada, así que una caja no puede llamarse end. Cambia el nombre de la caja, por ejemplo a End o E.`));

  const g = analyze(graph);
  const ids = [...graph.nodes.keys()];
  const isolated = ids.filter((id) => g.out.get(id).length === 0 && g.inn.get(id).length === 0);
  if (isolated.length) errors.push(L(`Not connected to anything: ${isolated.map((id) => labelOf(graph, id)).join(", ")}.`, `Sin conectar a nada: ${isolated.map((id) => labelOf(graph, id)).join(", ")}.`));

  const startWords = new Set((synonyms.start || []).map(normalize));
  let entries = ids.filter((id) => g.inn.get(id).length === 0 && !isolated.includes(id));
  if (entries.length === 0) entries = ids.filter((id) => words(graph.nodes.get(id).label).some((w) => startWords.has(w)));
  if (entries.length === 0 && ids.length) entries = [ids.find((id) => !isolated.includes(id))].filter(Boolean);
  if (entries.length === 0) errors.push(L("Can't find where the flow starts: every step has an arrow coming into it.", "No encuentro dónde empieza el flujo: todos los pasos tienen una flecha que llega a ellos."));
  if (entries.length > 1) errors.push(L(`The flow should have one start, but it starts in ${entries.length} places: ${entries.map((id) => labelOf(graph, id)).join(", ")}.`, `El flujo debe tener un solo inicio, pero empieza en ${entries.length} lugares: ${entries.map((id) => labelOf(graph, id)).join(", ")}.`));

  const endWords = new Set((synonyms.end || []).map(normalize));
  const sinks = ids.filter((id) => g.out.get(id).length === 0 && !isolated.includes(id));
  // "Stop" only counts as the End box when there is no real End box.
  const strongEnds = sinks.filter((id) => words(graph.nodes.get(id).label).some((w) => endWords.has(w) && w !== "stop"));
  const endBoxes = strongEnds.length ? strongEnds : sinks.filter((id) => words(graph.nodes.get(id).label).some((w) => endWords.has(w)));
  const exits = endBoxes.length ? endBoxes : sinks;
  const deadEnds = endBoxes.length ? sinks.filter((id) => !endBoxes.includes(id)) : [];
  if (sinks.length && !endBoxes.length) errors.push(L(`Add an End box: the flow just stops at ${sinks.map((id) => labelOf(graph, id)).join(", ")}.`, `Añade una caja de Fin: el flujo simplemente se detiene en ${sinks.map((id) => labelOf(graph, id)).join(", ")}.`));
  if (deadEnds.length) errors.push(L(`Dead end: ${deadEnds.map((id) => labelOf(graph, id)).join(", ")} has no arrow going out. Connect it to the next step or to End.`, `Sin salida: ${deadEnds.map((id) => labelOf(graph, id)).join(", ")} no tiene ninguna flecha que salga. Conéctala al siguiente paso o a Fin.`));
  if (exits.length === 0) errors.push(L("The flow never ends: every step has an arrow going out of it. Add an End.", "El flujo nunca termina: todos los pasos tienen una flecha que sale. Añade un Fin."));

  if (entries.length === 1) {
    const reached = g.reach([entries[0]], g.out, (e) => e.to);
    const unreached = ids.filter((id) => !reached.has(id) && !isolated.includes(id));
    if (unreached.length) errors.push(L(`Can't be reached from the start: ${unreached.map((id) => labelOf(graph, id)).join(", ")}.`, `No se puede llegar desde el inicio: ${unreached.map((id) => labelOf(graph, id)).join(", ")}.`));
  }
  if (exits.length) {
    const canFinish = g.reach(exits, g.inn, (e) => e.from);
    const stuck = ids.filter((id) => !canFinish.has(id) && !isolated.includes(id));
    if (stuck.length) errors.push(L(`These steps never reach the end (stuck in a loop with no way out): ${stuck.map((id) => labelOf(graph, id)).join(", ")}.`, `Estos pasos nunca llegan al final (atascados en un bucle sin salida): ${stuck.map((id) => labelOf(graph, id)).join(", ")}.`));
  }

  const blank = ids.filter((id) => !graph.nodes.get(id).label);
  if (blank.length) errors.push(L(`Every box needs text describing the step. Missing text: ${blank.join(", ")}. Write it like ${blank[0]}[Your step].`, `Cada caja necesita un texto que describa el paso. Falta texto en: ${blank.join(", ")}. Escríbelo así: ${blank[0]}[Tu paso].`));

  const minNodes = Number(rubric.min_nodes || 0);
  if (ids.length < minNodes) errors.push(L(`The flow is too short: expected at least ${minNodes} steps (including start and end), found ${ids.length}.`, `El flujo es demasiado corto: se esperaban al menos ${minNodes} pasos (contando inicio y fin) y hay ${ids.length}.`));

  const matches = makeMatcher(synonyms);

  if (rubric.decisions) {
    const n = g.decisions.length;
    if (rubric.decisions.max === 0 && n > 0) errors.push(L(`This flow should be a straight line with no decisions, but ${labelOf(graph, g.decisions[0])} branches.`, `Este flujo debe ser una línea recta sin decisiones, pero ${labelOf(graph, g.decisions[0])} se divide en varias flechas.`));
    else if (n < (rubric.decisions.min || 0)) errors.push(L(`Expected at least ${rubric.decisions.min} decision(s), found ${n}.`, `Se esperaban al menos ${rubric.decisions.min} decisión(es) y hay ${n}.`));
  }

  if (rubric.loops) {
    const n = g.loops.length;
    if (rubric.loops.max === 0 && n > 0) errors.push(L("This flow should not loop back, but it does.", "Este flujo no debe volver hacia atrás, pero lo hace."));
    else if (n < (rubric.loops.min || 0)) errors.push(L(`Expected at least ${rubric.loops.min} loop(s) (an arrow going back to an earlier step), found ${n}.`, `Se esperaba al menos ${rubric.loops.min} bucle(s) (una flecha que vuelve a un paso anterior) y hay ${n}.`));
  }

  (rubric.branching || []).forEach((rule) => {
    const inLoop = (id) => g.loops.some((loop) => loop.has(id));
    const good = g.decisions.filter((id) => {
      if (rule.in_loop && !inLoop(id)) return false;
      const branches = g.out.get(id);
      const targets = rule.branches.map((name) => {
        const hit = branches.find((e) => matches(e.label, name));
        return hit ? hit.to : null;
      });
      if (targets.includes(null)) return false;
      return new Set(targets).size === targets.length;
    });
    const want = rule.count || 1;
    if (good.length < want) {
      const where = rule.in_loop ? L(" inside a loop", " dentro de un bucle") : "";
      errors.push(L(`Expected ${want} decision(s)${where} with branches labelled ${rule.branches.join(" / ")}, each going to a different step; found ${good.length}.`, `Se esperaba(n) ${want} decisión(es)${where} con flechas etiquetadas ${rule.branches.map(say).join(" / ")}, cada una hacia un paso distinto; hay ${good.length}.`));
    } else if (rule.nested) {
      const nested = good.some((a) => good.some((b) => a !== b && g.reach([a], g.out, (e) => e.to).has(b)));
      if (!nested) errors.push(L("The second decision should come after the first one (nested), not beside it.", "La segunda decisión debe ir después de la primera (anidada), no al lado."));
    }
  });

  if (rubric.choice) {
    const { options, min_named: minNamed, min_outcomes: minOutcomes } = rubric.choice;
    const decisionTexts = [
      ...g.decisions.map((id) => graph.nodes.get(id).label),
      ...g.decisions.flatMap((id) => g.out.get(id).map((e) => e.label))
    ];
    const named = options.filter((name) => decisionTexts.some((t) => matches(t, name)));
    const outcomes = new Set(g.decisions.flatMap((id) => g.out.get(id).map((e) => e.to)).filter((id) => !g.decisions.includes(id)));
    if (named.length < minNamed) errors.push(L(`Your decision(s) should name the options (${options.join(", ")}); found ${named.length ? named.join(", ") : "none"}.`, `Tus decisiones deben nombrar las opciones (${options.map(say).join(", ")}); encontré: ${named.length ? named.map(say).join(", ") : "ninguna"}.`));
    if (outcomes.size < minOutcomes) errors.push(L(`Expected ${minOutcomes} different outcomes (one per option), found ${outcomes.size}.`, `Se esperaban ${minOutcomes} resultados distintos (uno por opción) y hay ${outcomes.size}.`));
  }

  const inAnyLoop = (id) => g.loops.some((loop) => loop.has(id));

  if (rubric.step_after_loop) {
    const FILLER = new Set(["the", "a", "an", "and", "y", "el", "la", "of", "de", "program", "programa", "process", "proceso", "flow", "flujo"]);
    const endOnly = (id) => words(graph.nodes.get(id).label).every((w) => endWords.has(w) || FILLER.has(w) || startWords.has(w));
    const leaveToEnd = g.decisions.filter(inAnyLoop).some((id) =>
      g.out.get(id).some((e) => !g.loops.some((loop) => loop.has(id) && loop.has(e.to)) && endBoxes.includes(e.to) && endOnly(e.to)));
    if (leaveToEnd) errors.push(L("After the loop finishes, add a step before End (for example, show the summary).", "Cuando termine el bucle, añade un paso antes de Fin (por ejemplo, mostrar el resumen)."));
  }

  if (rubric.first_decision_in_loop && entries.length === 1) {
    const order = [];
    const seen = new Set([entries[0]]);
    const queue = [entries[0]];
    while (queue.length) {
      const cur = queue.shift();
      if (g.decisions.includes(cur)) order.push(cur);
      g.out.get(cur).forEach((e) => { if (!seen.has(e.to)) { seen.add(e.to); queue.push(e.to); } });
    }
    if (order.length && !inAnyLoop(order[0])) errors.push(L(`If the first check (${labelOf(graph, order[0])}) fails, the flow should go back and ask again.`, `Si la primera comprobación (${labelOf(graph, order[0])}) falla, el flujo debe volver atrás y preguntar de nuevo.`));
  }

  if (rubric.events_from_states) {
    const sources = new Set(graph.edges.filter((e) => (rubric.edge_labels || []).some((n) => matches(e.label, n))).map((e) => e.from));
    if (sources.size < rubric.events_from_states) errors.push(`The events (${(rubric.edge_labels || []).join(", ")}) should be handled in at least ${rubric.events_from_states} different states, e.g. both Locked and Unlocked.`);
  }

  (rubric.order || []).forEach((rule) => {
    if (entries.length !== 1) return;
    const dist = new Map([[entries[0], 0]]);
    const queue = [entries[0]];
    while (queue.length) {
      const cur = queue.shift();
      g.out.get(cur).forEach((edge) => { if (!dist.has(edge.to)) { dist.set(edge.to, dist.get(cur) + 1); queue.push(edge.to); } });
    }
    const at = (stems) => ids.filter((id) => words(graph.nodes.get(id).label).some((w) => stems.some((s) => w.startsWith(normalize(s))))).map((id) => dist.get(id)).filter((d) => d !== undefined);
    const first = at(rule.first);
    const then = at(rule.then);
    if (first.length && then.length && Math.min(...then) < Math.min(...first)) errors.push(loc(rule, "fail"));
  });

  (rubric.edge_labels || []).forEach((name) => {
    if (!graph.edges.some((e) => matches(e.label, name))) errors.push(L(`No arrow is labelled "${name}".`, `Ninguna flecha está etiquetada "${say(name)}".`));
  });

  // Scenario words: does the diagram talk about this exercise's story?
  // Matches by word start, so "pass" covers password and "contrase" covers contraseña.
  const mentions = (texts, stems) => texts.some((t) =>
    stems.some((stem) => (/^[a-z0-9]/.test(stem) ? words(t).some((w) => w.startsWith(stem) || wordMatches(w, stem)) : t.includes(stem))));
  const allTexts = [...ids.map((id) => graph.nodes.get(id).label), ...graph.edges.map((e) => e.label)];
  (rubric.mentions || []).forEach((rule) => {
    const pool = rule.in_loop
      ? ids.filter((id) => g.loops.some((loop) => loop.has(id))).map((id) => graph.nodes.get(id).label)
      : allTexts;
    if (!mentions(pool, rule.stems.map(normalize))) {
      const where = rule.in_loop ? L("inside the loop", "dentro del bucle") : L("in your diagram", "en tu diagrama");
      errors.push(L(`Nothing ${where} mentions ${rule.about}. Write it in your own words, for example: ${rule.examples.join(", ")}.`, `Nada ${where} menciona ${loc(rule, "about")}. Escríbelo con tus palabras, por ejemplo: ${loc(rule, "examples").join(", ")}.`));
    }
  });

  const kinds = errors.map(() => "structure");
  // Advice for a diagram that passes but could be clearer.
  const tips = [];
  if (rubric.strict && errors.length === 0) {
    const { runStrictTests } = require("./flow-strict");
    runStrictTests({ graph, g, entry: entries[0], endBoxes, rubric, synonyms, matches, lang, tips }).forEach((e) => { errors.push(e.text); kinds.push(e.kind); });
  }

  return { pass: errors.length === 0, errors, kinds, graph, lang, tips: errors.length ? [] : tips };
}

module.exports = { parseFlowchart, validateFlow, analyze, normalize, words, wordMatches, typoDistance, detectLanguage };
