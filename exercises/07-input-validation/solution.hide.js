/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A["Start"] --> B["Email"]
    B["Email"] --> C{"loop"}
    C{"loop"} -->|No| B["Email"]
    C{"loop"} -->|Yes| D["valid"]
    D["valid"] --> E["end"]
`;

module.exports = answer.trim();