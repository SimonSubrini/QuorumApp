# Spec 00003: Componente NeoInput

## Contexto y Objetivo
El objetivo de `NeoInput` es proveer un campo de texto estandarizado siguiendo el diseño Neo-Brutalista. Permite el ingreso de datos (texto, contraseñas) proporcionando feedback visual claro sobre el estado de foco y posibles errores de validación.

## Usuarios
*   **Usuarios Finales:** Lo utilizan para ingresar datos (ej. credenciales, códigos) visualizando claramente cuándo están escribiendo y si hay algún error.

## Historias de Usuario
*   Como usuario, quiero ver un campo de texto claro y que reaccione visualmente cuando lo toco (hago foco) para saber que estoy escribiendo en él.
*   Como usuario ingresando una contraseña, quiero poder alternar su visibilidad para asegurarme de no haberme equivocado.
*   Como usuario, quiero ver un mensaje de error rojo/naranja si ingresé un dato inválido.

## Requisitos Funcionales
*   **RF-1: Renderizado básico y etiqueta**
    *   *EARS:* CUANDO se proporcione la prop `label`, ENTONCES el componente debe renderizar el texto de la etiqueta en mayúsculas por encima del campo de texto.
*   **RF-2: Estado de Foco (Feedback visual)**
    *   *EARS:* MIENTRAS el campo de texto tenga el foco activo (`onFocus`), ENTONCES su contenedor debe cambiar a fondo blanco (`#FFFFFF`), anular su sombra y trasladarse 2px hacia abajo y a la derecha (`translateX: 2`, `translateY: 2`). Al perder el foco (`onBlur`), debe retornar a su estado normal.
*   **RF-3: Modo Contraseña y alternancia de visibilidad**
    *   *EARS:* SI el componente recibe la prop `secureTextEntry={true}`, ENTONCES el texto ingresado debe ocultarse por defecto Y debe mostrarse un botón interno. CUANDO el usuario presione dicho botón, ENTONCES el texto debe alternar entre visible y oculto, y el botón debe cambiar su texto entre "VER" y "OCULTAR" correspondientemente.
*   **RF-4: Manejo y visualización de errores**
    *   *EARS:* CUANDO el componente reciba la prop `error` con un texto, ENTONCES debe mostrar dicho texto debajo del input en color primario Y el borde del contenedor del input debe adoptar ese mismo color primario.
*   **RF-5: Accesibilidad y escala de fuente**
    *   *EARS:* SI el dispositivo tiene un factor de escala de fuente mayor a 1.2, ENTONCES el input debe reducir su `paddingVertical` (de 14 a 8) para optimizar el espacio vertical.

## Requisitos No Funcionales
*   Debe propagar correctamente todos los eventos nativos de `TextInput` (ej. `onChangeText`, `onBlur`, `onFocus`), combinándolos con su lógica interna.

## Casos Límite
*   Etiquetas o errores excesivamente largos podrían requerir múltiples líneas.
*   Botón de visibilidad de contraseña: Su posicionamiento absoluto (`right: 12`, `top: 14`) podría desalinearse si el contenedor del input cambia significativamente de altura debido a fuentes extremadamente grandes.

## Fuera de Alcance
*   Validación interna de los datos ingresados (ej. validar si es un email válido con RegEx). El componente es un "dump component" y solo muestra el error que se le pasa por la prop `error`.

## Criterios de Finalización
*   El componente reacciona visualmente al foco y desenfoque.
*   El toggle de contraseñas funciona correctamente.
*   Los estados de error se aplican al texto inferior y al borde.
*   Pasa exitosamente todos sus tests unitarios.

## Dudas Abiertas
*   [NECESITA ACLARACIÓN] Para poder testear correctamente los cambios de estilo visuales en el contenedor (como el borde de error o el cambio de fondo al hacer foco), será necesario agregar un `testID="neo-input-wrapper"` a la vista que envuelve al `TextInput` dentro de `src/components/NeoInput.tsx`. ¿Estás de acuerdo con hacer esta adición menor al código funcional para poder implementar el test de la Spec?
