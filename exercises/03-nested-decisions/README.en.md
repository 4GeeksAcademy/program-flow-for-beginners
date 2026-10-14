# 3. Nested Decisions

## :movie_camera: Scenario
Car rental. A person can rent only if they are 21 or older **and** have a valid driver license. Check the age first. Only if the age is fine, check the license. If either check fails, the person can't rent. Every path finishes at End.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests try many ages (20, 21, 22 and more), each with and without a valid license, and check the result. So that every box can be read:
- Use **two separate decisions**, the second one inside the Yes path of the first: **`Age >= 21?`** and then **`Valid license?`**. One combined "age and license" question is not accepted here, because this exercise is about nesting.
- Write the age check with a symbol (`>=`, `>`, `<`, `<=`). Words like "over 21" are not accepted.
- Label the arrows leaving each decision **Yes** and **No**.
- Name the results clearly, for example **Rent the car** and **Reject: no rental**.
