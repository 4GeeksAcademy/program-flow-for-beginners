# `03` Nested Decisions

Scenario: Car rental. A person can rent only if they are 21+ and have a valid driver license. If they fail any condition, they cannot rent and finish through the rejection path. Model nested decisions and final outcomes.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use the app https://waficmikati.github.io/mermaid/ to create your Mermaid diagram.
3. Keep core nodes and branch conditions aligned with the rubric; equivalent edge layouts are accepted when flow logic is preserved.
4. Do not rename `answer` or `module.exports` in `app.js`.

## :bulb: Hint
- Your graph should include these key concepts: start, input, valid, rejection path (home), end.
- In this exercise, home is only the rubric label for the rejected path: no rental, then finish.
- You can label that node as no rental or rejected (the rubric accepts synonyms).
- Aim for at least 7 edges in total before running tests.
- Use branch labels exactly as expected: yes, no.
- Keep names and labels simple to match the validator.
