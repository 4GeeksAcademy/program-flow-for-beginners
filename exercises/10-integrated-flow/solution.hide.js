/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A([Start]) --> B[select product]
    B --> C{valid selection?}
    C -->|No - loop| B
    C -->|Yes| D[insert payment]
    D --> E{valid payment?}
    E -->|No - loop| D
    E -->|Yes| F[process transaction]
    F --> G[dispense product]
    G --> H[output: return change]
    H --> I([End])
`;

module.exports = answer.trim();