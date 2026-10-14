# 8. Accumulator Pattern

## :movie_camera: Scenario
Shopping cart total. Start the total at 0. While there are more items, read the next price and add it to the total. When there are no more items, show the total and finish.

## :memo: Instructions
1. Open `app.js` in this exercise folder.
2. Use this **[Mermaid Editor](https://waficmikati.github.io/mermaid/)** to create your diagram.
3. Paste the Mermaid code inside `answer`. Do not rename `answer` or `module.exports` in `app.js`.

## :mag: How your diagram is checked
The tests run your diagram with a few carts (prices 3; then 3 and 5; then 3, 5 and 2) and check the total it shows. So that every box can be read:
- Before the loop: **`total = 0`**
- The loop question: **`More items?`** with arrows **Yes** and **No**
- Inside the loop: **Read price**, then **`total = total + price`**
- After the loop: **Show total**

You can also read the price first and stop when the price is 0: **`Price = 0?`**.

## :bulb: Hint
- `total = total + price` means "the new total is the old total plus this price".
