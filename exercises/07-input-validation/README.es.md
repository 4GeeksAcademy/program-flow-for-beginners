# 7. Validación de entrada

## :movie_camera: Escenario
Registro de usuario. Pide el email y comprueba su formato. Si no es válido, muestra un error y vuelve a pedirlo. Si es válido, continúa el registro y termina.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests prueban un email válido al primer intento, y también uno, dos o tres emails no válidos antes de uno válido. Tu flujo debe volver a pedirlo después de cada email no válido y terminar después de uno válido. Para que se pueda leer cada caja:
- Incluye una caja que pida el email, por ejemplo **Pedir email**. La flecha de "intentar de nuevo" debe volver a esta caja.
- Escribe la decisión como **`¿Email válido?`** con flechas **Sí** y **No** (o **Válido** e **Inválido**).
- Una caja de error (por ejemplo **Mostrar error: email inválido**) solo debe aparecer después de un email no válido, y una caja de éxito (por ejemplo **Continuar el registro**) solo después de uno válido.
