# 2. Condicionales if/else

## :movie_camera: Escenario
Estás en una fiesta. Una persona solo puede beber alcohol si tiene 18 años o más. Pide la edad de la persona, compruébala y muestra qué pasa en cada caso. Los dos caminos terminan en el mismo Fin.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests ejecutan tu diagrama como si fuera un programa, con muchas edades (entre ellas 17, 18 y 19), y revisan el resultado de cada una. Para que se pueda leer cada caja:
- Escribe la decisión como una comparación con un símbolo: **`¿Edad >= 18?`**. No se aceptan frases como "mayor de 18", porque no queda claro si el 18 cuenta.
- Etiqueta las dos flechas que salen de la decisión con **Sí** y **No**.
- Nombra cada resultado con claridad, por ejemplo **Puede beber** y **No puede beber**.

Si una caja no se puede leer, el test te dice cuál es y cómo reescribirla.

## :bulb: Pista
- `>=` significa "mayor o igual que", así que `¿Edad >= 18?` es **Sí** para alguien que tiene exactamente 18.
