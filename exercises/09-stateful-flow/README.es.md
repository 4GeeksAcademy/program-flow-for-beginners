# `09` Stateful Flow

Escenario: Maquina de estados de torniquete. Empieza bloqueado; procesa eventos (moneda/empujar), actualiza estado y permite pasar solo en transiciones validas.

## :memo: Instrucciones
1. Abre `app.js` en esta carpeta del ejercicio.
2. Escribe o pega tu flujo Mermaid dentro del template string.
3. Manten los ids de nodos (`A`, `B`, `C`, ...) y las conexiones segun la rubrica.
4. No renombres `answer` ni `module.exports` en `app.js`.

## :bulb: Pista
- Tu grafo debe incluir estos conceptos clave: inicio (start), entrada (input), valido (valid), salida (output), fin (end).
- Busca tener al menos 5 conexiones antes de correr tests.
- Usa etiquetas de rama exactamente como se esperan (acepta sinonimos): si (yes), no.
- Manten nombres y etiquetas simples para que coincidan con el validador.
