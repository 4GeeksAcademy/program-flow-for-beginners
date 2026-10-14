# 7. Input Validation

## :movie_camera: Scenario
User registration. Ask for the email and check its format. If it is invalid, show an error and ask again. If it is valid, continue the registration and finish.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests try a valid email on the first attempt, and one, two or three invalid emails before a valid one. Your flow must ask again after each invalid email and finish after a valid one. So that every box can be read:
- Have a box that asks for the email, for example **Ask email**. The "try again" arrow must go back to this box.
- Write the decision as **`Email valid?`** with arrows **Yes** and **No** (or **Valid** and **Invalid**).
- An error box (for example **Show error: invalid email**) must only appear after an invalid email, and a success box (for example **Continue registration**) only after a valid one.
