# `03` Nested Decisions

Escenario: Alquiler de auto. Una persona solo puede alquilar si tiene 21+ y licencia de conducir valida. Si no cumple alguna condicion, no alquila y termina por la ruta de rechazo. Modela decisiones anidadas y resultados finales.

## :memo: Instrucciones
1. Abre `app.js` en esta carpeta del ejercicio.
2. Usa la app https://waficmikati.github.io/mermaid/ para crear tu diagrama Mermaid.
3. Alinea los nodos clave y las condiciones de rama con la rubrica; se aceptan estructuras de conexiones equivalentes si se preserva la logica del flujo.
4. No renombres `answer` ni `module.exports` en `app.js`.

## :bulb: Pista
- Tu grafo debe incluir estos conceptos clave: inicio (start), entrada (input), valido (valid), ruta de rechazo (home), fin (end).
- En este ejercicio, home es solo la etiqueta esperada por la rubrica para la ruta de rechazo: no alquila y termina.
- Puedes rotular ese nodo como no alquila o rechazado (la rubrica acepta sinonimos).
- Busca tener al menos 7 conexiones antes de correr tests.
- Usa etiquetas de rama exactamente como se esperan (acepta sinonimos): si (yes), no.
- Manten nombres y etiquetas simples para que coincidan con el validador.
