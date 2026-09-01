# Constitución del Proyecto (QuorumApp)

Este documento define la ley suprema del flujo de trabajo en QuorumApp. Todos los desarrolladores y agentes de IA deben apegarse estrictamente a estos principios.

## 1. La Especificación (Spec) Manda
*   **Fuente de Verdad:** Ningún comportamiento se implementa, modifica o elimina si no está dictado en una especificación activa dentro de la carpeta `specs/`.
*   **Decisiones Faltantes:** Si durante la implementación se detecta ambigüedad, falta de detalles de diseño o un caso de borde no contemplado en la Spec, **se detiene el trabajo inmediatamente**. El agente debe preguntar al usuario cómo proceder, y luego actualizar la Spec antes de escribir el código.
*   **Atómica y Trazable:** Cada spec debe enfocarse en una sola funcionalidad o pantalla para mantener la simplicidad y facilitar el testing.
*   **Requisitos de la spec** Cada spec debe contener: contexto y objetivo, usuarios, historias de usuario, requisitos funcionales numerados (RF-x) con criterios de aceptación en notación EARS en español, requisitos no funcionales, casos límite, fuera de alcance, criterios de finalización y dudas abiertas marcadas como [NECESITA ACLARACIÓN]

## 2. Test-Driven Development (TDD)
*   **Tests Primero:** Por cada spec, primero se estructuran y escriben los tests (dentro de la carpeta `tests/`).
*   **Mapeo 1:1:** Cada archivo de test debe corresponder lógicamente a una spec o un componente/lógica definida en una spec.
*   **Ciclo Rojo-Verde-Refactor:** 
    1. Escribir el test para el comportamiento de la spec y ver que falle (Rojo).
    2. Escribir el código mínimo necesario para que el test pase (Verde).
    3. Mejorar el código sin romper el test (Refactor).

## 3. Convenciones de Idioma
*   **Inglés para el Código:** Nombres de variables, funciones, clases, tipos, interfaces y la lógica interna de los tests deben estar en Inglés.
*   **Español para el Usuario y Documentación:** Todos los textos visibles en la interfaz de usuario (UI), mensajes de error, logs destinados al usuario, comentarios descriptivos en el código y documentos en Markdown (`.md` como esta constitución o las specs) deben estar en Español.

## 4. El Proceso de 6 Etapas (SDD Cycle)
El flujo de trabajo basado en especificaciones consta de 6 etapas rigurosas:

1.  **Generación:** El usuario propone una idea o se extrae de un código legacy. Se redacta un borrador de la Spec en `specs/`.
2.  **Clarificación:** El agente revisa el borrador y hace preguntas incisivas para eliminar ambigüedades, dependencias ocultas o casos de borde (ej. *¿Qué pasa si falla la red? ¿Cómo se ve el estado de carga?*).
3.  **Planificación:** Una vez aprobada la Spec, el agente genera un plan de implementación técnico (qué componentes se tocan, qué tests se crean).
4.  **Generación de Tareas:** Se crea un checklist en un `task.md` para dividir el plan en pasos atómicos.
5.  **Implementación (TDD):** Se escribe el test. Se escribe el código. Pasa el test.
6.  **Validación:** Se verifica que todos los tests pasen, que la UI sea coherente y se actualiza la documentación final o walkthroughs, luego de la aprobación del usuario, se escribe un commit (en español) y se hace push al repositorio de github.

## 5. Estructura de Archivos
*   `specs/`: Carpeta con todas las especificaciones, usando un orden secuencial de 5 dígitos (`spec_00001_titulo.md`).
*   `tests/`: Espejo de la estructura de `src/`, conteniendo los tests unitarios y de integración.
*   `src/`: Código fuente de la aplicación (UI y lógica pura).
