<!-- hide -->
<div align="center">

# Program Flow for Beginners

[![certified by 4Geeks Academy](https://img.shields.io/badge/certified_by-4Geeks_Academy-2563eb)](https://4geeksacademy.com/)
[![autograded with LearnPack](https://img.shields.io/badge/autograded_with-LearnPack-2563eb)](https://github.com/learnpack/learnpack)
[![open in Codespaces](https://img.shields.io/badge/open_in-Codespaces-fb5a1f)](https://codespaces.new/4GeeksAcademy/program-flow-for-beginners)

</div>

*These instructions are also available in [Spanish](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/README.es.md).*
<!-- endhide -->

Program Flow for Beginners is a LearnPack tutorial with 11 folders inside `exercises/`: one welcome guide plus 10 auto-graded challenges. You solve each scenario — coffee routine, traffic light, password loop, vending machine — by writing a Mermaid flowchart inside `app.js`, and a local validator checks node ids, 51 required connections, branch labels and banned keywords. Beginner level, roughly 4 hours, no Mermaid experience required.

<!-- hide -->
## 📋 About this tutorial

- **Difficulty:** beginner
- **Estimated duration:** 4 hours
- **Technologies:** programming logic, control flow, conditionals, loops, flowcharts, Mermaid
- **Exercises:** 11 folders, 10 of them with an automated test
- **Grading:** `isolated` — every exercise is validated on its own against its own `rubric.json`, and `learn.json` sets delivery to `no_delivery`, so there is no project to hand in
- **Instructions language:** English and Spanish, side by side in every exercise folder
<!-- endhide -->

## 🎯 What will you learn?

This tutorial separates *thinking about the flow* from *writing code*. Instead of fighting a compiler, you describe the logic as a diagram and a validator tells you whether the shape of that logic is correct.

- How to turn a plain-language scenario into a sequence of steps with a clear beginning and end.
- How a binary decision splits a flow into two paths and how those paths merge back together.
- How to nest one decision inside another when two conditions must be true at the same time.
- How to open three or more branches from a single decision point.
- The difference between a `while` loop (repeat until a condition changes) and a `for` loop (repeat a known number of times), drawn as arrows instead of syntax.
- The re-ask pattern: send the user back to the input step until the data is valid.
- The accumulator pattern: keep a running total that survives every pass of a loop.
- How to model a small state machine, where the same event produces different results depending on the current state.
- How to read a machine-readable rubric (`rubric.json`) and use failing tests as a checklist instead of a punishment.

## 👀 What will you build?

Ten diagrams, one per folder, ordered so each one adds exactly one new idea:

1. **`01-sequence-basics`** — Making coffee before class. A straight line with no decisions at all: 3 connections, and the words "while" and "for" are banned from the diagram text.
2. **`02-if-else-basics`** — A party door: alcohol only for people 18 or older. Allowed path, denied path, and both merging into a single end. 6 connections with `yes` and `no` labels.
3. **`03-nested-decisions`** — Car rental: the customer must be 21 or older *and* hold a valid driver license. Two checks, one inside the other. 7 connections.
4. **`04-multi-branch`** — Traffic light controller: green, yellow and red each trigger their own action before the flow continues. 4 connections.
5. **`05-loops-while`** — Password login: keep asking while the password is wrong, grant access when it is right. Your first back edge (`C` pointing to `B`). 4 connections, and the word "for" is banned.
6. **`06-loops-for`** — Grading five assignments: iterate from 1 to 5, process each one, then show a summary. 5 connections with a `D` to `C` back edge.
7. **`07-input-validation`** — Email registration: ask for the address, check the format, send the user back to the input step until it is valid. 5 connections, and here the branch labels are `valid` and `invalid` instead of `yes` and `no`.
8. **`08-accumulator-pattern`** — Shopping cart total: read item prices repeatedly, add each one to a running total, and print it when the user stops. 5 connections.
9. **`09-stateful-flow`** — A turnstile state machine: it starts locked, coin and push events change the state, and passing through is only allowed from a valid state. 5 connections.
10. **`10-integrated-flow`** — A vending machine that combines everything: validate the selection, loop on invalid input, check the payment, dispense the product and finish. 7 connections and four different labels (`yes`, `no`, `valid`, `invalid`).

Across the ten rubrics you will draw **51 connections in total**, and six of the exercises (05 through 10) require a back edge — the single arrow that turns a linear flow into a loop.

## 🎓 What do you need before starting?

- **No Mermaid knowledge.** The welcome exercise says it explicitly: you are not expected to master the syntax, only the logic. Three arrow forms cover everything you need.
- **No installed programming language.** You never write JavaScript, Python or anything else — you write a diagram inside a string.
- **A GitHub account** if you want the one-click route, or **Node.js 22** plus a global LearnPack install if you prefer to work locally.
- **A browser**, to sketch the diagram in the [Mermaid editor](https://waficmikati.github.io/mermaid/) built by a 4Geeks Academy graduate, or in any editor you like, before pasting the result into `app.js`.
- **Willingness to open `rubric.json`.** Each exercise ships its own rubric, and it is the real specification: it lists the concepts, the exact node pairs, the branch labels and the minimum number of arrows.

## ✅ How does the automatic grading work?

Every graded exercise contains a tiny `test.js` that delegates to a shared runner. The runner loads your answer — from the `LEARNPACK_USER_ANSWER` environment variable if LearnPack set one, otherwise by importing the string exported by `app.js` — parses it line by line, and runs five independent checks against that folder's rubric:

1. **Required concepts** (`required_nodes`). Labels are lowercased, stripped of accents and translated through [`tests/shared/synonyms.es-en.json`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/tests/shared/synonyms.es-en.json), which maps ten concepts (`start`, `end`, `home`, `yes`, `no`, `input`, `output`, `valid`, `invalid`, `loop`) to their English and Spanish forms. If a label still does not match, the check is forgiven as long as your diagram has at least as many distinct node ids as the rubric lists.
2. **Required connections** (`required_edges`). This is the strict one: pairs of **node ids**, such as `C -> B`, must exist exactly as written.
3. **Required branch labels** (`required_conditions`). The text you put on the arrows, for example `yes`, `no`, `valid` or `invalid`. These are compared literally, not through the synonym table, but the check is forgiven when your diagram carries at least as many *distinct* labels as the rubric requires — which is what lets a Spanish `si`/`no` pass.
4. **Forbidden patterns** (`forbidden_patterns`). A plain substring search over the whole normalized diagram text.
5. **Minimum size** (`min_steps`). The total number of arrows the parser managed to read.

If any check fails, the error message names exactly what is missing, so a failing test is a to-do list. This answer, for instance, passes `07-input-validation`:

```text
flowchart TD
    A[start] --> B[enter email]
    B --> C{format ok}
    C -->|invalid| D[show error]
    D --> B
    C -->|valid| E[end]
```

## 💡 What mistakes should you avoid?

These are the traps that make a diagram that *looks* perfect fail the test:

- **One connection per line.** The parser only reads a line if the whole line is a single edge. Chaining `A --> B --> C --> D` on one line yields zero parsed arrows, not three.
- **Only `-->` arrows count.** Thick arrows (`==>`) and dotted arrows (`-.->`) are invisible to the parser, so they silently reduce your edge count.
- **Labels go inside pipes attached to the arrow head:** `A -->|yes| B`. The alternative `A --|yes|--> B` also works, but Mermaid's common `A -- yes --> B` form is not recognised and the whole connection is dropped.
- **Node ids matter more than wording.** The rubric asks for `C -> B`, not for "the arrow from the check back to the input", so keep the ids `A`, `B`, `C`… in the order the rubric expects.
- **Forbidden patterns are substrings, not words.** In `05-loops-while` the word "for" is banned, so a natural label like `B[Ask for password]` fails — write `B[Enter password]`. In `01-sequence-basics` both "while" and "for" are banned, which also rules out "before".
- **When the hint and the rubric disagree, the rubric wins.** In `02-if-else-basics`, `03-nested-decisions` and `07-input-validation` the hint suggests a lower minimum (3, 4 and 4 arrows) than the `min_steps` the test actually enforces (6, 7 and 5).
- **The starter code fails on purpose.** All ten exercises ship the same placeholder, `A[start] --> B[end]`, which is one arrow. It is a template, not a partial solution.
- **Do not rename `answer` or `module.exports`.** Every exercise repeats this instruction. If the module stops exporting a string the runner does not give up: it hunts for the `answer` template literal with a regular expression and, failing that, reads the whole `app.js` as if the file itself were the diagram — comments included. In `01-sequence-basics` and `05-loops-while` those comments contain "format" and "forma", which trip the banned `for`.
- **Do not over-polish the wording.** Because labels are canonicalized and language-independent, "inicio" and "start" score the same. Spend the time on the arrows.

## ❓ Frequently asked questions

### Do I need to know Mermaid syntax to finish this tutorial?

No. The welcome exercise states you do not need to master Mermaid here. In practice three forms cover all ten diagrams: `flowchart TD` on the first line, `A --> B` for a plain connection, and `A -->|yes| B` for a labelled branch. Node shapes such as `A[step]` and `C{decision}` are all read the same way by the validator.

### Can I write my flowcharts in Spanish?

Yes, and both versions score the same. Node labels are lowercased, stripped of accents and passed through a Spanish–English synonym table, so `A[inicio]` counts as `start`. Branch labels are not translated, but the check passes as long as the diagram uses as many distinct labels as the rubric asks for, so `si`/`no` works where the rubric says `yes`/`no` — repeating one label twice is what fails. Node ids and the arrow topology are never translated and must match the rubric.

### Why does my diagram render fine in the Mermaid editor but the test still fails?

Because the two use different parsers. Mermaid itself accepts chained edges, dotted and thick arrows and the `A -- yes --> B` label form; the rubric engine in this repository reads only whole-line `-->` connections with pipe labels. If the error reads `Expected at least 5 edges but found 3.`, the shape of your logic is fine and the writing style is the problem.

### What exactly does `rubric.json` control?

Five fields, one per check: `required_nodes` (concepts that must appear as labels), `required_edges` (exact node-id pairs), `required_conditions` (labels on the arrows), `forbidden_patterns` (text that must not appear anywhere) and `min_steps` (minimum number of arrows). Reading it takes ten seconds and removes all guesswork — see [the rubric of the final exercise](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/exercises/10-integrated-flow/rubric.json) for the most complete example.

### How many exercises are auto-graded, and is there a final project?

Ten of the eleven folders have a `test.js`; `00-welcome` is a readme-only introduction to the workflow. There is no project to hand in: `learn.json` sets the delivery format to `no_delivery`, so the tutorial ends when the tenth diagram turns green.

### Where am I supposed to write my answer?

Only inside the backtick string named `answer` in the `app.js` of each exercise folder. Everything else — `test.js`, `rubric.json`, the shared engine under `tests/` — is grading machinery you can read for reference but should not modify.

<!-- hide -->
## 📝 Related interactive tutorials

Once flow control clicks as a diagram, write it as real code:

- [Javascript Beginner Tutorial (interactive)](https://4geeks.com/en/interactive-exercise/javascript-beginner-exercises)
- [Learn Python Interactively (beginner)](https://4geeks.com/en/interactive-exercise/python-beginner-exercises)
- [Learn Python Loops and Lists Interactively](https://4geeks.com/en/interactive-exercise/python-loops-lists-exercises)

## 🚀 How to start

1. Open the repository in [GitHub Codespaces](https://codespaces.new/4GeeksAcademy/program-flow-for-beginners) and wait for the container to finish its setup — it installs Node 22, Jest 29.7.0, LearnPack and the `@learnpack/node` plugin for you.
2. In the terminal, start the tutorial:

   ```bash
   learnpack start
   ```

3. Read `00-welcome`, then open `exercises/01-sequence-basics/app.js`.
4. Sketch your flowchart in the [Mermaid editor](https://waficmikati.github.io/mermaid/), paste the code between the backticks of the `answer` variable, and save.
5. Run the exercise test from the LearnPack interface and use the error list to fix the diagram until it passes, then move on to the next exercise.

## 💻 Local installation

1. Install the tooling globally (the same versions the dev container uses):

   ```bash
   npm i jest@29.7.0 -g
   npm i @learnpack/learnpack@5.0.348 -g
   learnpack plugins:install @learnpack/node@1.1.15
   ```

2. Clone the repository and enter it:

   ```bash
   git clone https://github.com/4GeeksAcademy/program-flow-for-beginners.git
   cd program-flow-for-beginners
   ```

3. From the folder that contains `learn.json`, start LearnPack:

   ```bash
   learnpack start
   ```

> 💡 The [LearnPack VS Code extension](https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode) is preinstalled in the dev container and gives the best auto-open behaviour when moving between exercises.

## 📚 How the exercises are organized

- `exercises/00-welcome` — readme only. Explains where to write your answer and which tools to use.
- `exercises/01-…` to `exercises/10-…` — each folder contains `app.js` (the only file you edit), `README.md` and `README.en.md` in English, `README.es.md` in Spanish, `rubric.json` with the validation rules, and `test.js` as the test entry point.
- `tests/shared/` — the grading engine, shared by all exercises: [`mermaid-rules-engine.js`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/tests/shared/mermaid-rules-engine.js) (parsing and the five checks), `run-open-test.js` (loads your answer), `normalize.js` (accents, casing, synonyms) and `synonyms.es-en.json`.
- [`learn.json`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/learn.json) — tutorial metadata: title, description, difficulty, duration and `"grading": "isolated"`.
- A GitHub Actions workflow runs `learnpack audit` on every push and pull request to `main`, so broken links or malformed exercises are caught before you ever see them.

## 🤝 Contributors

Created by [@ehiber](https://github.com/ehiber) and contributors at [4Geeks Academy](https://4geeksacademy.com/). The [Mermaid editor](https://waficmikati.github.io/mermaid/) recommended throughout the tutorial was built by a graduate student of the academy.

Found a typo, a rubric that does not match its hint, or a scenario that could be clearer? [Open an issue](https://github.com/4GeeksAcademy/program-flow-for-beginners/issues) or send a pull request — the [contributors list](https://github.com/4GeeksAcademy/program-flow-for-beginners/graphs/contributors) is public.

This repository is public on GitHub and cloning it costs nothing, but it ships no `LICENSE` file, so no explicit reuse or redistribution permissions are granted.
<!-- endhide -->
