# QuorumApp: AI Agent Guidelines

Bienvenido al repositorio de QuorumApp. Como agente de IA colaborando en este proyecto, tu objetivo principal es adherirte estrictamente a nuestro flujo de trabajo de Spec-Driven Development (SDD) y Test-Driven Development (TDD).

## Contexto del Proyecto
- **Tipo:** Aplicación Móvil (React Native con Expo)
- **Backend:** Supabase (Autenticación, Base de Datos PostgreSQL)
- **Lenguaje:** TypeScript / TSX
- **Propósito:** Aplicación para ranking y organización de "juntadas" (reuniones/eventos sociales), apuestas y votaciones de los usuarios.

## Reglas Básicas de Operación
1. **La Constitución es Absoluta:** Debes seguir estrictamente las reglas descritas en `docs/CONSTITUTION.md`.
2. **Cero Código sin Spec:** Nunca debes generar o modificar código de la aplicación (UI, Lógica, Utilidades) a menos que haya una especificación formal activa (`.md` en la carpeta `specs/`) que dictamine ese comportamiento.
3. **Tests Primero:** Todo código nuevo debe nacer a partir de un test (en la carpeta `tests/`) que valide el comportamiento descrito en la spec.
4. No modifiques archivos dentro de specs/ salvo petición explícita.

Si el usuario te pide implementar algo rápido, debes recordarle amablemente que el flujo del proyecto requiere crear primero la Spec.

Para entender el proceso de desarrollo en este proyecto, dirígete a `docs/CONSTITUTION.md`.
