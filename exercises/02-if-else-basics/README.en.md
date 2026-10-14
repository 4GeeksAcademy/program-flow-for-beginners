# 2. If Else Basics

## :movie_camera: Scenario
You are at a party. A person can drink alcohol only if they are 18 or older. Ask for the person's age, check it, and show what happens in each case. Both paths finish at the same End.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests run your diagram like a program, with many ages, including 17, 18 and 19, and check the result for each one. So that every box can be read:
- Write the decision as a comparison with a symbol: **`Age >= 18?`**. Words like "over 18" are not accepted, because it's unclear whether 18 counts.
- Label the two arrows leaving the decision **Yes** and **No**.
- Name each result clearly, for example **Can drink** and **Cannot drink**.

If a box can't be read, the test tells you which one and how to reword it.

## :bulb: Hint
- `>=` means "greater than or equal to", so `Age >= 18?` is **Yes** for someone who is exactly 18.
