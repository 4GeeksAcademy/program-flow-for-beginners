/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart LR
    A(["Start"]) --> B["State: Locked"]
    B["State: Locked"] -->|Event: push| B["State: Locked"]
    B["State: Locked"] -->|Event: coin| C["State: Unlocked"]
    C["State: Unlocked"] -->|Event: coin| C["State: Unlocked"]
    C["State: Unlocked"] -->|Event: push| D["Allow Pass / Rotate"]
    D["Allow Pass / Rotate"] --> B["State: Locked"]
    B["State: Locked"] --> E(["End"])
`;

module.exports = answer.trim();