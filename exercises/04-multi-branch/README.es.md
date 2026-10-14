# 4. Múltiples ramas

## :movie_camera: Escenario
Semáforo. Lee el color de la luz y elige la acción:
- **Verde**: avanzar.
- **Amarillo**: reducir la velocidad (detenerse también se acepta).
- **Rojo**: detenerse.

Después de la acción, los tres caminos se unen en un paso (por ejemplo **Continuar**) y luego llegan a Fin.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests prueban cada color y revisan la acción que elige tu diagrama. Para que se pueda leer cada caja:
- Usa **una sola decisión** (por ejemplo **`¿Color de la luz?`**) con tres flechas etiquetadas **Verde**, **Amarillo** y **Rojo**,
- o haz preguntas de sí/no una tras otra: **`¿Está en verde?`** y luego **`¿Está en amarillo?`**, con flechas etiquetadas **Sí** y **No**.
- Nombra cada acción con claridad: **Avanzar**, **Reducir la velocidad**, **Detenerse**.
