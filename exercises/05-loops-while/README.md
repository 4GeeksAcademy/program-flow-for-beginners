# 5. Loops While

## :movie_camera: Scenario
Password login. Ask for the password. While it is wrong, show an error and ask again. When it is correct, grant access and finish.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests try a correct password on the first attempt, and one, two or three wrong passwords before the correct one. Each time, your flow must ask again after a wrong password and finish after the correct one. So that every box can be read:
- Have a box that asks for the password, for example **Ask password**. The "try again" arrow must go back to this box, not straight to the decision.
- Write the decision as a yes/no question that says what Yes means: **`Password correct?`**, with arrows **Yes** and **No**.
- Add a box for the success, for example **Access granted**. It must only happen after the correct password.
