const answer = `
flowchart TD
    A(["Start"]) --> B["total = 0"]
    B["total = 0"] --> C{"More items?"}
    C{"More items?"} -->|"Yes"| D["Read price"]
    D["Read price"] --> E["total = total + price"]
    E["total = total + price"] --> C{"More items?"}
    C{"More items?"} -->|"No"| F["Show total"]
    F["Show total"] --> G(["End"])
`;

module.exports = answer.trim();
