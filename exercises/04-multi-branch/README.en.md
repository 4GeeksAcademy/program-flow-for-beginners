# 4. Multi Branch

## :movie_camera: Scenario
Traffic light. Read the light color and choose the action:
- **Green**: go.
- **Yellow**: slow down (stopping is also accepted).
- **Red**: stop.

After the action, all three paths join in one step (for example **Continue**) and then End.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests try each color and check the action your diagram chooses. So that every box can be read:
- Either use **one decision** (for example **`Light color?`**) with three arrows labelled **Green**, **Yellow** and **Red**,
- or ask yes/no questions one after another: **`Is it green?`**, then **`Is it yellow?`**, with arrows labelled **Yes** and **No**.
- Name each action clearly: **Go**, **Slow down**, **Stop**.
