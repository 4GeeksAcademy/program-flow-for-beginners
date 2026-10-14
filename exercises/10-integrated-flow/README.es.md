# 10. Flujo integrado

## :movie_camera: Escenario
Máquina expendedora. El cliente selecciona un producto. Si la selección no es válida, muestra un error y deja que vuelva a seleccionar. Cuando sea válida, pide el dinero. Si el dinero no alcanza, pide más dinero o devuélvelo y termina. Cuando el dinero alcance, entrega el producto, devuelve el cambio y termina.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests prueban todas las combinaciones de hasta dos selecciones no válidas y hasta dos pagos insuficientes. Tu flujo nunca debe entregar el producto antes de que pasen las dos comprobaciones, y debe entregarlo exactamente una vez. Para que se pueda leer cada caja:
- Incluye una caja que pida cada cosa: **Seleccionar producto** e **Insertar dinero**. Las flechas de "intentar de nuevo" deben volver a esas cajas (o a una caja como **Insertar más dinero**).
- Escribe las decisiones como **`¿Selección válida?`** y **`¿Dinero suficiente?`**, con flechas **Sí** y **No**.
- Nombra el resultado con claridad: **Entregar producto**. Si devuelves el dinero, dilo: **Devolver el dinero**.
