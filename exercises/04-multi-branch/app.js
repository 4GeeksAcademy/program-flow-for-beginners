/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A["Start"] --> B["color"]
    B["color"] --> C{"color selected?"}
    C{"color selected?"} -->|green| D["output"]
    C{"color selected?"} -->|yellow| E["caution"]
    C{"color selected?"} -->|red| F["home"]
    D["output"] --> G["end"]
    E["caution"] --> G["end"]
    F["home"] --> G["end"]

`;

module.exports = answer.trim();