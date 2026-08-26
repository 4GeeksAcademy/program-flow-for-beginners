/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A["Start"] --> B["Tasks List"]
    B["Tasks List"] --> C{"loop"}
    C{"loop"} -->|Yes| D["process task"]
    D["process task"] --> E["Next Task"]
    E["Next Task"] --> C{"loop"}
    C{"loop"} -->|No| F["output"]
    F["output"] --> G["end"]
`;

module.exports = answer.trim();