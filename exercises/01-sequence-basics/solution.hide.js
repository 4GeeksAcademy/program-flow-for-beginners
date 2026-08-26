const answer = `
flowchart TD
	A("Start") --> B["Boil water"]
	B["Boil water"] --> C["Brew coffee"]
	C["Brew coffee"] --> D["Serve coffee"]
	E("End")
`;

module.exports = answer.trim();
