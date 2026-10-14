const answer = `
flowchart TD
    A(["Start"]) --> B["Locked"]
    B["Locked"] -->|"Coin"| C["Unlocked"]
    B["Locked"] -->|"Push"| B["Locked"]
    C["Unlocked"] -->|"Coin"| C["Unlocked"]
    C["Unlocked"] -->|"Push"| D["Person passes"]
    D["Person passes"] --> B["Locked"]
    B["Locked"] -->|"No more events"| E(["End"])
`;

module.exports = answer.trim();
