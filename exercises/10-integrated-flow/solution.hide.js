const answer = `
flowchart TD
    A(["Start"]) --> B["Select product"]
    B["Select product"] --> C{"Valid selection?"}
    C{"Valid selection?"} -->|"No"| D["Show error: invalid selection"]
    D["Show error: invalid selection"] --> B["Select product"]
    C{"Valid selection?"} -->|"Yes"| E["Insert money"]
    E["Insert money"] --> F{"Enough money?"}
    F{"Enough money?"} -->|"No"| G["Insert more money"]
    G["Insert more money"] --> F{"Enough money?"}
    F{"Enough money?"} -->|"Yes"| H["Dispense product"]
    H["Dispense product"] --> I["Return change"]
    I["Return change"] --> J(["End"])
`;

module.exports = answer.trim();
