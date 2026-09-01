# Spec 00006: HelpModal

## Contexto
Componente `HelpModal` que muestra un tutorial paginado ("slides") explicando el funcionamiento del juego/app al usuario. Se apoya en componentes base ya construidos (`NeoCard`, `NeoButton`, `NeoIconButton`) e implementa el componente `Modal` nativo de React Native.

## Requerimientos Funcionales (RF)
- **RF-1: Visibilidad controlada:** El modal solo debe renderizarse (y ser visible) cuando la propiedad `visible` sea `true`.
- **RF-2: Navegación de slides:** 
  - Al presionar el botón "Siguiente" (ícono de flecha derecha), se debe avanzar al siguiente slide, actualizando el título y contenido.
  - Al presionar el botón "Atrás" (ícono de flecha izquierda), se debe retroceder al slide anterior.
- **RF-3: Límite de navegación:** 
  - Estando en el primer slide, no se puede retroceder más. El botón de atrás debe cambiar su variante a `secondary` como indicador visual.
  - Estando en el último slide, el botón de "Siguiente" desaparece y es reemplazado por el botón final de "¡ENTENDIDO!".
- **RF-4: Cierre del modal:** 
  - Al presionar el botón "¡ENTENDIDO!" en el último slide, se debe invocar la función `onClose`.
  - La misma acción debe ocurrir si se dispara el evento `onRequestClose` nativo (ej: botón físico "Atrás" en Android).
- **RF-5: Paginación visual:** Se debe mostrar un indicador de puntos (dots) que represente la cantidad de slides totales. El punto correspondiente al slide activo debe ser más ancho y tener color `primary`.

## Requerimientos No Funcionales (RNF)
- **RNF-1:** El overlay (fondo del modal) debe tener un fondo oscuro semi-transparente para dar foco a la tarjeta de ayuda.
- **RNF-2:** Debe reutilizar `NeoCard`, `NeoButton` y `NeoIconButton` para garantizar consistencia visual.

## Dudas Abiertas
*(Ninguna. El usuario aprobó la inyección de `testID` para testing con RNTL).*
