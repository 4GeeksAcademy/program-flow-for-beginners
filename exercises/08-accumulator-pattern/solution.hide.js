/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart LR
    A["start"] --> B["Price"]
    B["Price"] --> C{"loop - Are there more products?"}
    C{"loop - Are there more products?"} -->|Yes| D["Add Price to Total"]
    D["Add Price to Total"] --> B["Price"]
    C{"loop - Are there more products?"} -->|No| E["output - Show Total"]
    E["output - Show Total"] --> F["end - Purchase End"]
`;

module.exports = answer.trim();