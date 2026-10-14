const answer = `
flowchart TD
    A(["Start"]) --> B["Ask email"]
    B["Ask email"] --> C{"Email valid?"}
    C{"Email valid?"} -->|"No"| D["Show error: invalid email"]
    D["Show error: invalid email"] --> B["Ask email"]
    C{"Email valid?"} -->|"Yes"| E["Continue registration"]
    E["Continue registration"] --> F(["End"])
`;

module.exports = answer.trim();
