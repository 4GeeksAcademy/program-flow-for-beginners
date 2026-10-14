# 3. Decisiones anidadas

## :movie_camera: Escenario
Alquiler de autos. Una persona solo puede alquilar si tiene 21 años o más **y** una licencia de conducir válida. Comprueba primero la edad. Solo si la edad está bien, comprueba la licencia. Si falla cualquiera de las dos, la persona no puede alquilar. Todos los caminos terminan en Fin.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests prueban muchas edades (20, 21, 22 y más), cada una con y sin licencia válida, y revisan el resultado. Para que se pueda leer cada caja:
- Usa **dos decisiones separadas**, la segunda dentro del camino Sí de la primera: **`¿Edad >= 21?`** y luego **`¿Licencia válida?`**. Aquí no se acepta una sola pregunta que combine "edad y licencia", porque este ejercicio trata de anidar decisiones.
- Escribe la comprobación de la edad con un símbolo (`>=`, `>`, `<`, `<=`). No se aceptan frases como "mayor de 21".
- Etiqueta las flechas que salen de cada decisión con **Sí** y **No**.
- Nombra los resultados con claridad, por ejemplo **Alquilar el auto** y **Rechazar: no hay alquiler**.
