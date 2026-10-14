# 9. Flujo con estado

## :movie_camera: Escenario
Un torniquete en una estación de metro. Empieza **Bloqueado**. Los eventos llegan de uno en uno: **Moneda** o **Empujar**.
- Bloqueado + Moneda: pasa a Desbloqueado.
- Bloqueado + Empujar: nadie pasa; sigue Bloqueado.
- Desbloqueado + Empujar: la persona pasa y vuelve a quedar Bloqueado.
- Desbloqueado + Moneda: sigue Desbloqueado.

El torniquete sigue atendiendo eventos. Solo llega a Fin cuando no hay más eventos.

## :memo: Instrucciones
1. Abre `app.js` en la carpeta de este ejercicio.
2. Usa este **[Editor Mermaid](https://waficmikati.github.io/mermaid/)** para crear tu diagrama.
3. Pega el código Mermaid dentro de `answer`. No cambies el nombre de `answer` ni de `module.exports` en `app.js`.

## :mag: Cómo se revisa tu diagrama
Los tests envían todas las secuencias de hasta 5 eventos (por ejemplo Moneda, Empujar, Empujar) y cuentan cuántas personas pasan. También revisan que una caja llamada **Bloqueado** o **Desbloqueado** solo se alcance cuando el torniquete de verdad está en ese estado. Para que se pueda leer cada caja:
- Dibuja una caja por estado, **Bloqueado** y **Desbloqueado**, y etiqueta las flechas que salen de ellas con **Moneda** y **Empujar**.
- Añade una caja que diga cuándo pasa alguien, por ejemplo **La persona pasa**.
- Desde **Bloqueado**, añade una flecha etiquetada **No hay más eventos** que vaya a Fin.
