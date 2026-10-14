const answer = `
flowchart TD
    A(["Start"]) --> B["Read light color"]
    B["Read light color"] --> C{"Light color?"}
    C{"Light color?"} -->|"Green"| D["Go"]
    C{"Light color?"} -->|"Yellow"| E["Slow down"]
    C{"Light color?"} -->|"Red"| F["Stop"]
    D["Go"] --> G["Continue"]
    E["Slow down"] --> G["Continue"]
    F["Stop"] --> G["Continue"]
    G["Continue"] --> H(["End"])
`;

module.exports = answer.trim();
