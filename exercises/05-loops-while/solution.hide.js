/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A["Start"] --> B["Password"]
    B["Password"] --> C{"Is it correct?"}
    C{"Is it correct?"} -->|No| D["loop - failed attempt"]
    D["loop - failed attempt"] --> B["Password"]
    C{"Is it correct?"} -->|Yes| E["access allowed"]
    E["access allowed"] --> F["end"]
`;

module.exports = answer.trim();