# 8. Patrón acumulador

## :movie_camera: Escenario
Total del carrito de compras. Empieza con el total en 0. Mientras haya más artículos, lee el siguiente precio y súmalo al total. Cuando no queden artículos, muestra el total y termina.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests ejecutan tu diagrama con algunos carritos (precio 3; luego 3 y 5; luego 3, 5 y 2) y revisan el total que muestra. Para que se pueda leer cada caja:
- Antes del bucle: **`total = 0`**
- La pregunta del bucle: **`¿Más artículos?`** con flechas **Sí** y **No**
- Dentro del bucle: **Leer precio** y luego **`total = total + precio`**
- Después del bucle: **Mostrar total**

También puedes leer primero el precio y parar cuando el precio sea 0: **`¿Precio = 0?`**.

## :bulb: Pista
- `total = total + precio` significa "el nuevo total es el total anterior más este precio".
