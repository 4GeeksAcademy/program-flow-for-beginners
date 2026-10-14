const answer = `
flowchart TD
    A(["Start"]) --> B["Ask password"]
    B["Ask password"] --> C{"Password correct?"}
    C{"Password correct?"} -->|"No"| D["Show error: wrong password"]
    D["Show error: wrong password"] --> B["Ask password"]
    C{"Password correct?"} -->|"Yes"| E["Access granted"]
    E["Access granted"] --> F(["End"])
`;

module.exports = answer.trim();
