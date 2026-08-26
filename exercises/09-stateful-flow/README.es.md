# `09` Stateful Flow

Escenario: Maquina de estados de torniquete. Empieza bloqueado; procesa eventos (moneda/empujar), actualiza estado y permite pasar solo en transiciones validas.

## :memo: Instrucciones
1. Abre `app.js` en esta carpeta del ejercicio.
2. Usa la app https://waficmikati.github.io/mermaid/ para crear tu diagrama Mermaid.
3. Alinea los nodos clave y las condiciones de rama con la rubrica; se aceptan estructuras de conexiones equivalentes si se preserva la logica del flujo.
4. No renombres `answer` ni `module.exports` en `app.js`.

## :bulb: Pista
- Tu grafo debe incluir estos conceptos clave: inicio (start), bloqueado (locked), desbloqueado (unlocked), salida (output), fin (end).
- Busca tener al menos 5 conexiones antes de correr tests.
- Usa etiquetas de rama exactamente como se esperan (acepta sinonimos): moneda (coin), empujar (push).
- Manten nombres y etiquetas simples para que coincidan con el validador.
