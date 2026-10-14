# 6. Loops For

## :movie_camera: Scenario
Grade 5 assignments. Count from assignment 1 to 5, grade each one, then show a summary and finish.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests run your loop and check that the grading step runs **exactly 5 times** and that the summary shows after the loop. This exercise is about counting, so use a counter:
- Before the loop: **`i = 1`**
- The loop question: **`i <= 5?`** with arrows **Yes** (keep going) and **No** (leave the loop)
- Inside the loop: **Grade assignment i**, then **`i = i + 1`**
- After the loop: **Show summary**

A question like "More assignments?" is not accepted here, because the tests can't count with it.

## :bulb: Hint
- `i = i + 1` means "add 1 to i". Without it, `i` never changes and the loop never ends.
