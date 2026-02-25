/*
Edit only the Mermaid flow inside `answer`.
Keep this shape: const answer = `...`; module.exports = answer.trim();
---
Edita solo el flujo Mermaid dentro de `answer`.
Manten esta forma: const answer = `...`; module.exports = answer.trim();
*/
const answer = `
flowchart TD
    A[Inicio] --> B[Preparar café]
    B --> C[Servir café]
    C --> D[Finalizar preparación]
    D --> output[Proceso terminado]
    output --> end[Fin]
`;

module.exports = answer.trim();
