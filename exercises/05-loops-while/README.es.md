# 5. Bucles while

## :movie_camera: Escenario
Inicio de sesión con contraseña. Pide la contraseña. Mientras sea incorrecta, muestra un error y vuelve a pedirla. Cuando sea correcta, concede el acceso y termina.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests prueban una contraseña correcta al primer intento, y también una, dos o tres contraseñas incorrectas antes de la correcta. En cada caso, tu flujo debe volver a pedirla después de una contraseña incorrecta y terminar después de la correcta. Para que se pueda leer cada caja:
- Incluye una caja que pida la contraseña, por ejemplo **Pedir contraseña**. La flecha de "intentar de nuevo" debe volver a esta caja, no directamente a la decisión.
- Escribe la decisión como una pregunta de sí/no que diga qué significa Sí: **`¿Contraseña correcta?`**, con flechas **Sí** y **No**.
- Añade una caja para el éxito, por ejemplo **Acceso concedido**. Solo debe aparecer después de la contraseña correcta.
