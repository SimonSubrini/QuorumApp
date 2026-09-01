# Spec 00005: NeoIconButton

## Contexto
Componente `NeoIconButton` que funciona como un botón interactivo cuyo contenido es exclusivamente un ícono de `Ionicons`. Implementa comportamiento interactivo y estética Neo-Brutalista al igual que `NeoButton`.

## Requerimientos Funcionales (RF)
- **RF-1: Renderizado del ícono:** El componente debe renderizar un ícono de la librería `@expo/vector-icons/Ionicons` correspondiente a la propiedad `icon` proveída y con el tamaño dictado en `size` (por defecto 24).
- **RF-2: Variantes de diseño:**
  - `primary` (por defecto): Fondo de color primario, ícono de color texto claro (`textLight`).
  - `secondary`: Fondo de color secundario, ícono de color texto claro (`textLight`).
  - `success`: Fondo de color success, ícono de color texto oscuro (`text`).
- **RF-3: Interacción animada (Press):** Al ser presionado, la sombra del botón debe desaparecer y el contenedor debe trasladarse visualmente 2px hacia abajo y a la derecha (`transform: [{ translateX: 2 }, { translateY: 2 }]`).
- **RF-4: Estado deshabilitado (Disabled):** 
  - Si `disabled` es true, el fondo debe ser `#A0A0A0` y el ícono `#E0E0E0`.
  - No debe ser clickeable.
  - No debe realizar la interacción visual del RF-3.
- **RF-5: Accesibilidad por tamaño de fuente:** Si la escala de fuente del sistema es mayor a `1.2`, el padding debe ser `6`. De lo contrario, debe ser `10`.
- **RF-6: Accesibilidad nativa:** El componente debe aceptar `accessibilityLabel` e implementarlo junto a `accessibilityRole="button"`.

## Requerimientos No Funcionales (RNF)
- **RNF-1:** Construido usando `TouchableOpacity` y `@expo/vector-icons`.
- **RNF-2:** Tipado con TypeScript.
- **RNF-3:** Uso de `testID` para testing con RNTL.

## Dudas Abiertas
*(Ninguna. El usuario aprobó la inclusión de `testID` y `accessibilityLabel`).*
