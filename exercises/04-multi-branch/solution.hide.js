/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A[Start] --> B[color]
    B --> C{color selected?}
    C -->|green| D[output]
    C -->|yellow| E[caution]
    C -->|red| F[home]
    D --> G[end]
    E --> G
    F --> G
`;

module.exports = answer.trim();