# Spec 00004: NeoCard

## Contexto
Componente contenedor básico (`NeoCard`) que implementa la estética Neo-Brutalista definida en el tema del proyecto, envolviendo el contenido de la aplicación.

## Requerimientos Funcionales (RF)
- **RF-1: Renderizado de contenido:** El componente debe aceptar y renderizar `children` correctamente.
- **RF-2: Estilo Neo-Brutalista base:** El contenedor debe tener los estilos base dictados por el tema (`backgroundColor`, `borderWidth`, `borderColor`, `borderRadius`, `shadows`).
- **RF-3: Estilos personalizados:** Debe permitir la inyección de estilos adicionales a través de la propiedad `style`.
- **RF-4: Accesibilidad por tamaño de fuente:** Si la escala de fuente del sistema (`PixelRatio.getFontScale()`) es mayor a `1.2`, el componente debe reducir su `padding` a `12` para optimizar el espacio en pantalla.
- **RF-5: Accesibilidad:** El componente debe aceptar la propiedad `accessibilityRole` y, al proveerse, setear automáticamente `accessible={true}`.

## Requerimientos No Funcionales (RNF)
- **RNF-1:** El contenedor debe construirse sobre un componente `View` nativo para máximo rendimiento.
- **RNF-2:** Debe estar tipado usando TypeScript.
- **RNF-3:** Debe implementar la propiedad `testID` para facilitar el testing en entornos automatizados.

## Dudas Abiertas
*(Ninguna. Dudas de accesibilidad y testID resueltas y aprobadas por el usuario).*
