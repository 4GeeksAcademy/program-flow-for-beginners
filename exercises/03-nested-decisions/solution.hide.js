/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A("Start") --> B["Age"]
    C{"Age >=21"} -->|no| D["Reject"]
    D["Reject"] --> E("End")
    C{"Age >=21"} -->|yes| F{"Valid license?"}
    F{"Valid license?"} -->|no| D["Reject"]
    F{"Valid license?"} -->|yes| G["Approved: can rent"]
    G["Approved: can rent"] --> E("End")
    B["Age"] --> C{"Age >=21"}
`;

module.exports = answer.trim();