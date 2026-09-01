# Spec 00002: Componente NeoButton

## Contexto y Objetivo
El objetivo de `NeoButton` es proveer un botón base reutilizable en toda la aplicación que implemente consistentemente el lenguaje de diseño "Neo-Brutalista" (sombras marcadas, bordes definidos y animaciones de hundimiento). Debe soportar diferentes variantes de estado y color.

## Usuarios
*   **Usuarios Finales:** Interactúan con este botón para ejecutar acciones en la app (enviar formularios, navegar, confirmar).

## Historias de Usuario
*   Como usuario, quiero ver claramente cuando un botón es clickeable, cuando está presionado y cuando está deshabilitado, para entender qué acciones puedo realizar.

## Requisitos Funcionales
*   **RF-1: Renderizado de texto**
    *   *EARS:* CUANDO el componente sea renderizado, ENTONCES debe mostrar el texto proporcionado mediante la prop `title` en mayúsculas (`textTransform: 'uppercase'`).
*   **RF-2: Acción de presión**
    *   *EARS:* CUANDO el usuario presione el botón Y el botón no esté deshabilitado, ENTONCES debe invocar la función proporcionada en la prop `onPress`.
*   **RF-3: Variantes de color**
    *   *EARS:* CUANDO el componente reciba la prop `variant` ('primary', 'secondary', 'success'), ENTONCES debe aplicar el color de fondo correspondiente del tema. Para garantizar un buen contraste, si la variante es 'success', el color del texto debe ser oscuro (`theme.colors.text`); de lo contrario, debe ser claro (`theme.colors.textLight`). Si no recibe `variant`, ENTONCES debe usar 'primary' por defecto.
*   **RF-4: Estado deshabilitado (Disabled)**
    *   *EARS:* CUANDO el botón reciba la prop `disabled={true}`, ENTONCES debe cambiar su fondo a gris oscuro (`#A0A0A0`), el texto a gris claro (`#E0E0E0`), y bloquear la ejecución del `onPress`.
*   **RF-5: Feedback táctil (Animación de hundimiento)**
    *   *EARS:* MIENTRAS el usuario mantenga presionado el botón (`onPressIn`) Y este no esté deshabilitado, ENTONCES el botón debe trasladarse 2px hacia abajo y a la derecha (`translateX: 2`, `translateY: 2`) y reducir su sombra (`shadowOffset: 0`) para simular que está hundido. Al soltar (`onPressOut`), debe volver a su estado original.
*   **RF-6: Accesibilidad y escala de fuente**
    *   *EARS:* SI el dispositivo del usuario tiene un factor de escala de fuente mayor a 1.2, ENTONCES el botón debe reducir su `paddingVertical` (de 14 a 8) y `paddingHorizontal` (de 24 a 16) para compensar el tamaño del texto y evitar deformar la UI.

## Requisitos No Funcionales
*   El componente debe mantener siempre un borde sólido (`borderWidth`) según el tema.
*   Debe ser altamente performante, delegando la gestión de toques al `TouchableOpacity` de React Native.

## Casos Límite
*   Textos extremadamente largos: El componente está configurado con `numberOfLines={0}` (infinitas líneas), por lo que el texto bajará a la siguiente línea aumentando la altura del botón.

## Fuera de Alcance
*   El botón no manejará íconos (para eso existe `NeoIconButton`).
*   El botón no maneja estados de carga "loading" internamente (eso se hace pasando un `disabled={true}` y cambiando el `title` desde el componente padre).

## Criterios de Finalización
*   El componente reacciona visualmente de forma correcta en todos sus estados (default, pressed, disabled).
*   Las variantes de color aplican correctamente según el archivo de tema (`theme.ts`).
*   Pasa exitosamente todos sus tests unitarios.
