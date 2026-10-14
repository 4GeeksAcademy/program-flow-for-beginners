# 10. Integrated Flow

## :movie_camera: Scenario
Vending machine. The customer selects a product. If the selection is invalid, show an error and let them select again. When it is valid, ask for money. If the money is not enough, either ask for more money or give the money back and finish. When the money is enough, dispense the product, return the change, and finish.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests try every mix of up to two invalid selections and up to two short payments. Your flow must never dispense before both checks pass, and must dispense exactly once. So that every box can be read:
- Have a box that asks for each thing: **Select product** and **Insert money**. The "try again" arrows must go back to these boxes (or to a box like **Insert more money**).
- Write the decisions as **`Valid selection?`** and **`Enough money?`**, with arrows **Yes** and **No**.
- Name the result clearly: **Dispense product**. If you give the money back, say so: **Return the money**.
