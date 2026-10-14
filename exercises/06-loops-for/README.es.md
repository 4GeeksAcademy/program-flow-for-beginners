# 6. Bucles for

## :movie_camera: Escenario
Califica 5 tareas. Cuenta de la tarea 1 a la 5, califica cada una, luego muestra un resumen y termina.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests ejecutan tu bucle y revisan que el paso de calificar se ejecute **exactamente 5 veces** y que el resumen aparezca después del bucle. Este ejercicio trata de contar, así que usa un contador:
- Antes del bucle: **`i = 1`**
- La pregunta del bucle: **`¿i <= 5?`** con flechas **Sí** (seguir) y **No** (salir del bucle)
- Dentro del bucle: **Calificar tarea i** y luego **`i = i + 1`**
- Después del bucle: **Mostrar resumen**

Aquí no se acepta una pregunta como "¿Quedan más tareas?", porque con ella los tests no pueden contar.

## :bulb: Pista
- `i = i + 1` significa "suma 1 a i". Sin ese paso, `i` nunca cambia y el bucle no termina nunca.
