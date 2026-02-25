// Edit only the Mermaid content inside the template string.
const answer = `
graph TD
    start[Inicio] --> input[Preparar ingredientes]
    input --> A[Hervir agua]
    A --> B[Preparar cafe]
    B --> C[Servir cafe]
    C --> D[Finalizar preparacion]
    D --> output[Proceso terminado]
    output --> end[Fin]
`;

module.exports = answer.trim();
