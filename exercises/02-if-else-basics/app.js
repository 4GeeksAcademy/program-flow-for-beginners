/*
Replace the contents of the `answer` string literal with your Mermaid diagram.

Keep this format: 
    const answer = `...`; 
    module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/

const answer = `
flowchart TD
    A["Start"] --> B["Age"]
    B["Age"] --> C{"Age >= 18"}
    C{"Age >= 18"} -->|Yes| D["You can drink alcohol"]
    C{"Age >= 18"} -->|No| E["You cannot drink alcohol"]
    D["You can drink alcohol"] --> F["end"]
    E["You cannot drink alcohol"] --> F["end"]
`;

// Do not modify this
module.exports = answer.trim();