# 9. Stateful Flow

## :movie_camera: Scenario
A turnstile at a metro station. It starts **Locked**. Events arrive one at a time, either **Coin** or **Push**:
- Locked + Coin: it becomes Unlocked.
- Locked + Push: nobody passes; it stays Locked.
- Unlocked + Push: the person passes, and it becomes Locked again.
- Unlocked + Coin: it stays Unlocked.

The turnstile keeps handling events. It reaches End only when there are no more events.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests send every sequence of up to 5 events (for example Coin, Push, Push) and count how many people pass. They also check that a box named **Locked** or **Unlocked** is only reached when the turnstile really is in that state. So that every box can be read:
- Draw one box per state, **Locked** and **Unlocked**, and label the arrows leaving them **Coin** and **Push**.
- Add a box that says when someone gets through, for example **Person passes**.
- From **Locked**, add one arrow labelled **No more events** to End.
