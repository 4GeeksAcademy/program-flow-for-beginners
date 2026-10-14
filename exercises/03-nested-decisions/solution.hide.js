const answer = `
flowchart TD
    A(["Start"]) --> B["Ask age and license"]
    B["Ask age and license"] --> C{"Age >= 21?"}
    C{"Age >= 21?"} -->|"No"| D["Reject: no rental"]
    C{"Age >= 21?"} -->|"Yes"| E{"Valid license?"}
    E{"Valid license?"} -->|"No"| D["Reject: no rental"]
    E{"Valid license?"} -->|"Yes"| F["Rent the car"]
    D["Reject: no rental"] --> G(["End"])
    F["Rent the car"] --> G(["End"])
`;

module.exports = answer.trim();
