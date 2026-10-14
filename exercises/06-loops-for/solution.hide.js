const answer = `
flowchart TD
    A(["Start"]) --> B["i = 1"]
    B["i = 1"] --> C{"i <= 5?"}
    C{"i <= 5?"} -->|"Yes"| D["Grade assignment i"]
    D["Grade assignment i"] --> E["i = i + 1"]
    E["i = i + 1"] --> C{"i <= 5?"}
    C{"i <= 5?"} -->|"No"| F["Show summary"]
    F["Show summary"] --> G(["End"])
`;

module.exports = answer.trim();
