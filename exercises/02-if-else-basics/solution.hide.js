const answer = `
flowchart TD
    A(["Start"]) --> B["Ask age"]
    B["Ask age"] --> C{"Age >= 18?"}
    C{"Age >= 18?"} -->|"Yes"| D["Can drink alcohol"]
    C{"Age >= 18?"} -->|"No"| E["Cannot drink alcohol"]
    D["Can drink alcohol"] --> F(["End"])
    E["Cannot drink alcohol"] --> F(["End"])
`;

module.exports = answer.trim();
