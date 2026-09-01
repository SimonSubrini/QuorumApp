# Spec 00001: Componente AdBannerPlaceholder

## Contexto y Objetivo
El objetivo de este componente es reservar el espacio visual exacto que ocupará un banner de publicidad (ej. AdMob) en el futuro. Esto previene saltos de diseño (layout shifts) y permite estructurar la interfaz correctamente antes de implementar el SDK de publicidad real.

## Usuarios
*   **Desarrolladores/Diseñadores:** Utilizan este componente para visualizar cómo quedará el layout final de las pantallas con publicidad integrada.

## Historias de Usuario
*   Como desarrollador, quiero ver un bloque visual con dimensiones predefinidas donde irá la publicidad, para poder diseñar el resto de la interfaz sabiendo exactamente cuánto espacio consumirá el anuncio.

## Requisitos Funcionales
*   **RF-1: Dimensiones fijas**
    *   *EARS:* CUANDO el componente sea renderizado, ENTONCES debe ocupar el 100% del ancho disponible en su contenedor padre y tener una altura fija de 50px.
*   **RF-2: Mensajes indicativos**
    *   *EARS:* CUANDO el componente sea renderizado, ENTONCES debe mostrar un texto principal "Espacio reservado para Anuncio (AdMob)" truncado a una sola línea (`numberOfLines={1}`) y un subtexto indicando la resolución "320x50".
*   **RF-3: Estilo visual distintivo**
    *   *EARS:* CUANDO el componente sea renderizado, ENTONCES debe presentar un fondo gris claro (`#e0e0e0`) y un borde superior (`#bdbdbd`) para destacar claramente del contenido normal de la aplicación.

## Requisitos No Funcionales
*   Debe ser un componente presentacional puro (sin manejo de estado, sin hooks de ciclo de vida).

## Casos Límite
*   Pantallas excesivamente estrechas: Si el dispositivo tiene un ancho menor a 320px, el texto se trunca (`numberOfLines={1}`) para evitar desbordes visuales.

## Fuera de Alcance
*   Integración con cualquier SDK de publicidad real.
*   Cualquier tipo de interactividad, presiones (onPress) o navegación.

## Criterios de Finalización
*   El componente se muestra con las medidas exactas solicitadas (50px de alto, 100% ancho).
*   Se renderizan ambos textos de reserva (título y subtítulo), respetando el truncamiento del título.
*   Todos los tests unitarios vinculados a esta spec aprueban con éxito.
