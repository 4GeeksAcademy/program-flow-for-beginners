<!-- hide -->
<div align="center">

# Flujo de programación para principiantes

[![certificado por 4Geeks Academy](https://img.shields.io/badge/certificado_por-4Geeks_Academy-2563eb)](https://4geeksacademy.com/)
[![autocorregido con LearnPack](https://img.shields.io/badge/autocorregido_con-LearnPack-2563eb)](https://github.com/learnpack/learnpack)
[![abrir en Codespaces](https://img.shields.io/badge/abrir_en-Codespaces-fb5a1f)](https://codespaces.new/4GeeksAcademy/program-flow-for-beginners)

</div>

*Estas instrucciones también están disponibles en [inglés](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/README.md).*
<!-- endhide -->

Flujo de programación para principiantes es un tutorial de LearnPack con 11 carpetas dentro de `exercises/`: una guía de bienvenida y 10 retos autocorregidos. Cada escenario —preparar café, un semáforo, un login con contraseña, una máquina expendedora— se resuelve dibujando un diagrama Mermaid dentro de `app.js`, y un validador local comprueba los ids de nodo, 51 conexiones obligatorias, las etiquetas de rama y las palabras prohibidas. Nivel principiante, unas 4 horas, sin saber Mermaid.

<!-- hide -->
## 📋 Sobre este tutorial

- **Dificultad:** principiante
- **Duración estimada:** 4 horas
- **Tecnologías:** lógica de programación, control de flujo, condicionales, bucles, diagramas de flujo, Mermaid
- **Ejercicios:** 11 carpetas, 10 de ellas con test automático
- **Corrección:** `isolated` — cada ejercicio se valida por su cuenta contra su propio `rubric.json`, y `learn.json` fija la entrega en `no_delivery`, así que no hay ningún proyecto que entregar
- **Idioma de las instrucciones:** inglés y español en cada carpeta de ejercicio
<!-- endhide -->

## 🎯 ¿Qué vas a aprender?

Este tutorial separa *pensar el flujo* de *escribir código*. En lugar de pelearte con la sintaxis de un lenguaje, describes la lógica como un diagrama y un validador te dice si la forma de esa lógica es correcta.

- Convertir un escenario contado en lenguaje normal en una secuencia de pasos con un inicio y un fin claros.
- Entender cómo una decisión binaria parte el flujo en dos caminos y cómo esos caminos vuelven a juntarse.
- Anidar una decisión dentro de otra cuando hacen falta dos condiciones a la vez.
- Abrir tres o más ramas desde un mismo punto de decisión.
- Ver la diferencia entre un bucle `while` (repetir hasta que algo cambie) y un bucle `for` (repetir un número conocido de veces), dibujada con flechas en vez de con sintaxis.
- El patrón de revalidación: devolver al usuario al paso de entrada hasta que el dato sea correcto.
- El patrón acumulador: mantener un total que sobrevive a cada vuelta del bucle.
- Modelar una pequeña máquina de estados, donde el mismo evento da resultados distintos según el estado actual.
- Leer una rúbrica en formato máquina (`rubric.json`) y usar los tests que fallan como lista de tareas, no como castigo.

## 👀 ¿Qué vas a construir?

Diez diagramas, uno por carpeta, ordenados para que cada uno añada exactamente una idea nueva:

1. **`01-sequence-basics`** — Preparar café antes de clase. Una línea recta, sin ninguna decisión: 3 conexiones, y las palabras "while" y "for" están prohibidas en el texto del diagrama.
2. **`02-if-else-basics`** — La puerta de una fiesta: solo puede beber alcohol quien tenga 18 años o más. Camino permitido, camino denegado y los dos confluyendo en un único fin. 6 conexiones con etiquetas `yes` y `no`.
3. **`03-nested-decisions`** — Alquiler de coche: hay que tener 21 años o más *y* carnet de conducir válido. Dos comprobaciones, una dentro de la otra. 7 conexiones.
4. **`04-multi-branch`** — Un semáforo: verde, amarillo y rojo disparan cada uno su propia acción antes de continuar. 4 conexiones.
5. **`05-loops-while`** — Login con contraseña: seguir pidiéndola mientras sea incorrecta y dar acceso cuando sea correcta. Aquí aparece tu primera flecha de retorno (de `C` a `B`). 4 conexiones, y la palabra "for" está prohibida.
6. **`06-loops-for`** — Corregir cinco tareas: iterar de la 1 a la 5, procesar cada una y mostrar un resumen. 5 conexiones con una flecha de retorno de `D` a `C`.
7. **`07-input-validation`** — Registro por email: pedir la dirección, comprobar el formato y devolver al usuario al paso de entrada hasta que sea válida. 5 conexiones, y aquí las etiquetas de rama son `valid` e `invalid` en lugar de `yes` y `no`.
8. **`08-accumulator-pattern`** — Total del carrito de la compra: leer precios repetidamente, sumarlos a un total acumulado y mostrarlo cuando el usuario termine. 5 conexiones.
9. **`09-stateful-flow`** — Un torniquete como máquina de estados: empieza bloqueado, los eventos de moneda y empuje cambian el estado, y solo se puede pasar desde un estado válido. 5 conexiones.
10. **`10-integrated-flow`** — Una máquina expendedora que junta todo lo anterior: validar la selección, repetir ante una entrada inválida, comprobar el pago, entregar el producto y cerrar el flujo. 7 conexiones y cuatro etiquetas distintas (`yes`, `no`, `valid`, `invalid`).

Sumando las diez rúbricas dibujarás **51 conexiones en total**, y seis de los ejercicios (del 05 al 10) exigen una flecha de retorno: esa única arista que convierte un flujo lineal en un bucle.

## 🎓 ¿Qué necesitas antes de empezar?

- **No necesitas saber Mermaid.** El ejercicio de bienvenida lo dice sin rodeos: aquí no se trata de dominar la sintaxis, sino la lógica. Con tres formas de escribir flechas tienes de sobra.
- **No necesitas ningún lenguaje instalado.** En ningún momento escribes JavaScript ni Python: escribes un diagrama dentro de un texto.
- **Una cuenta de GitHub** si quieres la vía de un clic, o **Node.js 22** y LearnPack instalado globalmente si prefieres trabajar en local.
- **Un navegador**, para dibujar el diagrama en el [editor de Mermaid](https://waficmikati.github.io/mermaid/) que creó un estudiante graduado de 4Geeks Academy, o en la herramienta que prefieras, antes de pegar el resultado en `app.js`.
- **Ganas de abrir `rubric.json`.** Cada ejercicio trae su propia rúbrica y es la especificación de verdad: enumera los conceptos, los pares de nodos exactos, las etiquetas de rama y el número mínimo de flechas.

## ✅ ¿Cómo funciona la autocorrección?

Cada ejercicio con test tiene un `test.js` mínimo que delega en un corrector compartido. Ese corrector carga tu respuesta —desde la variable de entorno `LEARNPACK_USER_ANSWER` si LearnPack la ha puesto, y si no importando el texto que exporta `app.js`—, la analiza línea a línea y ejecuta cinco comprobaciones independientes contra la rúbrica de esa carpeta:

1. **Conceptos obligatorios** (`required_nodes`). Las etiquetas se pasan a minúsculas, se les quitan los acentos y se traducen con [`tests/shared/synonyms.es-en.json`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/tests/shared/synonyms.es-en.json), que relaciona diez conceptos (`start`, `end`, `home`, `yes`, `no`, `input`, `output`, `valid`, `invalid`, `loop`) con sus formas en inglés y en español. Si aun así una etiqueta no encaja, la comprobación se perdona siempre que tu diagrama tenga al menos tantos nodos distintos como pide la rúbrica.
2. **Conexiones obligatorias** (`required_edges`). Esta es la estricta: pares de **ids de nodo**, como `C -> B`, que deben existir tal cual.
3. **Etiquetas de rama obligatorias** (`required_conditions`). El texto que pones encima de las flechas, por ejemplo `yes`, `no`, `valid` o `invalid`. Se comparan literalmente, sin pasar por la tabla de sinónimos, pero la comprobación se perdona si tu diagrama tiene al menos tantas etiquetas *distintas* como pide la rúbrica: por eso valen `si` y `no` en español.
4. **Patrones prohibidos** (`forbidden_patterns`). Una búsqueda de texto plano sobre todo el diagrama normalizado.
5. **Tamaño mínimo** (`min_steps`). El número total de flechas que el analizador ha conseguido leer.

Cuando algo falla, el mensaje de error dice exactamente qué falta, así que un test en rojo es una lista de tareas. Esta respuesta, por ejemplo, aprueba `07-input-validation`:

```text
flowchart TD
    A[inicio] --> B[pedir email]
    B --> C{formato correcto}
    C -->|invalido| D[mostrar error]
    D --> B
    C -->|valido| E[fin]
```

## 💡 ¿Qué errores conviene evitar?

Estas son las trampas que hacen fallar un diagrama que *parece* perfecto:

- **Una conexión por línea.** El analizador solo lee una línea si esa línea entera es una única flecha. Encadenar `A --> B --> C --> D` en una sola línea da cero flechas leídas, no tres.
- **Solo cuentan las flechas `-->`.** Las flechas gruesas (`==>`) y las punteadas (`-.->`) son invisibles para el analizador y te dejan sin conexiones sin que te des cuenta.
- **Las etiquetas van entre barras pegadas a la punta de la flecha:** `A -->|si| B`. También vale `A --|si|--> B`, pero la forma habitual de Mermaid `A -- si --> B` no se reconoce y la conexión entera se pierde.
- **Los ids importan más que las palabras.** La rúbrica pide `C -> B`, no "la flecha que vuelve de la comprobación a la entrada", así que mantén los ids `A`, `B`, `C`… en el orden que espera la rúbrica.
- **Los patrones prohibidos se buscan como texto, no como palabras.** En `05-loops-while` está prohibido "for", así que una etiqueta tan lógica como `B[Validar formato]` falla, porque "formato" contiene "for". En `01-sequence-basics` están prohibidos "while" y "for", lo que descarta también palabras como "informar".
- **Si la pista y la rúbrica no coinciden, manda la rúbrica.** En `02-if-else-basics`, `03-nested-decisions` y `07-input-validation` la pista sugiere un mínimo menor (3, 4 y 4 flechas) que el `min_steps` que el test exige de verdad (6, 7 y 5).
- **El código de partida falla a propósito.** Los diez ejercicios traen el mismo marcador de posición, `A[start] --> B[end]`, que es una sola flecha. Es una plantilla, no media solución.
- **No renombres `answer` ni `module.exports`.** Todos los ejercicios lo repiten. Si el módulo deja de exportar un texto, el corrector no se rinde: busca el literal `answer` con una expresión regular y, si tampoco lo encuentra, lee el `app.js` entero como si el fichero fuera el diagrama, comentarios incluidos. En `01-sequence-basics` y `05-loops-while` esos comentarios llevan las palabras "format" y "forma", que activan el `for` prohibido.
- **No pierdas tiempo puliendo las palabras.** Como las etiquetas se normalizan y son independientes del idioma, "inicio" y "start" puntúan igual. Invierte ese tiempo en las flechas.

## ❓ Preguntas frecuentes

### ¿Hace falta saber Mermaid para terminar el tutorial?

No. El ejercicio de bienvenida deja claro que aquí no se pide dominar Mermaid. En la práctica, tres formas cubren los diez diagramas: `flowchart TD` en la primera línea, `A --> B` para una conexión normal y `A -->|si| B` para una rama etiquetada. Las formas de nodo, como `A[paso]` o `C{decision}`, las lee el validador exactamente igual.

### ¿Puedo escribir los diagramas en español?

Sí, y las dos versiones puntúan igual. Las etiquetas de los nodos se pasan a minúsculas, se les quitan los acentos y se traducen con una tabla de sinónimos español-inglés, así que `A[inicio]` cuenta como `start`. Las etiquetas de rama no se traducen, pero la comprobación pasa mientras uses tantas etiquetas distintas como pide la rúbrica: `si`/`no` vale donde la rúbrica dice `yes`/`no`; lo que falla es repetir dos veces la misma. Lo que no se traduce nunca son los ids de los nodos ni la topología de las flechas: eso tiene que coincidir con la rúbrica.

### Mi diagrama se ve bien en el editor de Mermaid, ¿por qué falla el test?

Porque no usan el mismo analizador. Mermaid acepta flechas encadenadas, punteadas y gruesas y el formato de etiqueta `A -- si --> B`; el motor de este repositorio solo lee líneas completas con `-->` y etiquetas entre barras. Si el error dice `Expected at least 5 edges but found 3.`, tu lógica está bien y lo que falla es la forma de escribirla.

### ¿Qué controla exactamente `rubric.json`?

Cinco campos, uno por comprobación: `required_nodes` (conceptos que deben aparecer como etiquetas), `required_edges` (pares exactos de ids), `required_conditions` (etiquetas sobre las flechas), `forbidden_patterns` (texto que no puede aparecer en ningún sitio) y `min_steps` (número mínimo de flechas). Leerlo cuesta diez segundos y elimina las conjeturas; el más completo es [el del ejercicio final](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/exercises/10-integrated-flow/rubric.json).

### ¿Cuántos ejercicios se corrigen solos y hay proyecto final?

Diez de las once carpetas tienen `test.js`; `00-welcome` es una introducción de solo lectura al método de trabajo. No hay nada que entregar: `learn.json` fija el formato de entrega en `no_delivery`, así que el tutorial termina cuando el décimo diagrama se pone en verde.

### ¿Dónde escribo mi respuesta?

Solo dentro del texto entre acentos graves llamado `answer` en el `app.js` de cada carpeta. Todo lo demás —`test.js`, `rubric.json` y el motor compartido de `tests/`— es maquinaria de corrección: puedes leerla para entender qué se te pide, pero no deberías modificarla.

<!-- hide -->
## 📝 Tutoriales relacionados

Cuando el control de flujo te salga solo en forma de diagrama, escríbelo como código de verdad:

- [Tutorial para principiantes de JavaScript (interactivo)](https://4geeks.com/es/interactive-exercise/ejercicios-javascript-para-principiantes)
- [Aprende Python interactivamente (principiante)](https://4geeks.com/es/interactive-exercise/python-beginner-exercises-es)
- [Aprende listas y bucles de Python interactivamente](https://4geeks.com/es/interactive-exercise/python-loops-lists-exercises-es)

## 🚀 Cómo empezar

1. Abre el repositorio en [GitHub Codespaces](https://codespaces.new/4GeeksAcademy/program-flow-for-beginners) y espera a que termine la configuración del contenedor: instala Node 22, Jest 29.7.0, LearnPack y el plugin `@learnpack/node` por ti.
2. En la terminal, arranca el tutorial:

   ```bash
   learnpack start
   ```

3. Lee `00-welcome` y abre después `exercises/01-sequence-basics/app.js`.
4. Dibuja tu diagrama en el [editor de Mermaid](https://waficmikati.github.io/mermaid/), pega el código entre los acentos graves de la variable `answer` y guarda.
5. Lanza el test del ejercicio desde la interfaz de LearnPack y usa la lista de errores para corregir el diagrama hasta que pase; luego sigue con el siguiente.

## 💻 Instalación local

1. Instala las herramientas globalmente (las mismas versiones que usa el contenedor):

   ```bash
   npm i jest@29.7.0 -g
   npm i @learnpack/learnpack@5.0.348 -g
   learnpack plugins:install @learnpack/node@1.1.15
   ```

2. Clona el repositorio y entra en la carpeta:

   ```bash
   git clone https://github.com/4GeeksAcademy/program-flow-for-beginners.git
   cd program-flow-for-beginners
   ```

3. Desde la carpeta donde está `learn.json`, arranca LearnPack:

   ```bash
   learnpack start
   ```

> 💡 La [extensión de LearnPack para VS Code](https://marketplace.visualstudio.com/items?itemName=learn-pack.learnpack-vscode) viene preinstalada en el contenedor y es la que mejor abre los ficheros al cambiar de ejercicio.

## 📚 Cómo están organizados los ejercicios

- `exercises/00-welcome` — solo readme. Explica dónde escribir la respuesta y qué herramientas usar.
- De `exercises/01-…` a `exercises/10-…` — cada carpeta contiene `app.js` (el único fichero que editas), `README.md` y `README.en.md` en inglés, `README.es.md` en español, `rubric.json` con las reglas de validación y `test.js` como punto de entrada de los tests.
- `tests/shared/` — el motor de corrección compartido: [`mermaid-rules-engine.js`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/tests/shared/mermaid-rules-engine.js) (análisis y las cinco comprobaciones), `run-open-test.js` (carga tu respuesta), `normalize.js` (acentos, mayúsculas y sinónimos) y `synonyms.es-en.json`.
- [`learn.json`](https://github.com/4GeeksAcademy/program-flow-for-beginners/blob/HEAD/learn.json) — metadatos del tutorial: título, descripción, dificultad, duración y `"grading": "isolated"`.
- Un workflow de GitHub Actions ejecuta `learnpack audit` en cada push y cada pull request a `main`, de modo que los enlaces rotos o los ejercicios mal formados se detectan antes de que lleguen a ti.

## 🤝 Contribuciones

Creado por [@ehiber](https://github.com/ehiber) y colaboradores de [4Geeks Academy](https://4geeksacademy.com/). El [editor de Mermaid](https://waficmikati.github.io/mermaid/) que se recomienda a lo largo del tutorial lo construyó un estudiante graduado de la academia.

¿Has encontrado una errata, una rúbrica que no cuadra con su pista o un escenario que se podría explicar mejor? [Abre un issue](https://github.com/4GeeksAcademy/program-flow-for-beginners/issues) o manda un pull request: la [lista de colaboradores](https://github.com/4GeeksAcademy/program-flow-for-beginners/graphs/contributors) es pública.

Este repositorio es público en GitHub y clonarlo no cuesta nada, pero no incluye fichero `LICENSE`, así que no concede permisos explícitos de reutilización ni de redistribución.
<!-- endhide -->
