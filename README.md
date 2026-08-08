# QuorumApp 🏆

QuorumApp es una aplicación móvil nativa (construida con React Native y Expo) que permite organizar, registrar y gamificar las juntadas/reuniones de amigos a través de sistemas de puntos, apuestas, votaciones y un torneo integrado.

---

## 🛠️ Stack Tecnológico y Librerías

El ecosistema principal de la app se compone de las siguientes tecnologías:

- **Frontend:** React Native (v0.81) + Expo (~54.0.0).
- **Backend as a Service (BaaS):** Supabase (PostgreSQL, Auth, Storage, Row Level Security).
- **Navegación:** React Navigation v7 (`@react-navigation/native-stack`).
- **Componentes Nativos:**
  - `@react-native-picker/picker` (Dropdowns).
  - `@react-native-community/datetimepicker` (Selección de fechas).
  - `expo-image-picker` (Subida de fotos de evidencia).
- **Estilos:** NeoBrutalism (diseño propio usando `StyleSheet` y un sistema de `theme.ts` centralizado).
- **Testing:** Jest v29 + `@testing-library/react-native`.

---

## 🗄️ Esquema de Base de Datos (Supabase)

La aplicación utiliza las siguientes tablas fuertemente conectadas con restricciones de llave foránea (FK):

1. **`profiles`**
   - Maneja la información pública de los usuarios.
   - Columnas: `id` (FK a auth.users), `username`, `avatar_url`.
2. **`groups`**
   - Agrupaciones de usuarios o "clanes".
   - Columnas: `id`, `name`, `admin_id` (quien lo creó), `end_date`, `num_winners`, `season_number`, `state` (activo/finalizado), `winners_data` (snapshot JSON de ganadores).
3. **`group_members`**
   - Relación N:N entre usuarios y grupos, almacena los puntos totales.
   - Columnas: `id`, `group_id`, `user_id`, `points`.
4. **`juntadas`**
   - Eventos específicos dentro de un grupo.
   - Columnas: `id`, `group_id`, `name`, `date`, `location`, `photo_url` (Storage).
5. **`juntada_attendees`**
   - Check-in de asistencia (sólo los presentes pueden ganar/apostar).
   - Columnas: `id`, `juntada_id`, `user_id`.
6. **`matches` & `match_winners`**
   - Partidas jugadas y a quiénes se les otorgó +1 punto por ganar.
7. **`bets`, `bet_options`, `bet_participants`**
   - Mercado de apuestas.
   - Lógica: `amount` límite por persona (hasta 3), opciones dinámicas (`bet_options`), y los que participan de la apuesta junto a la opción elegida.
8. **`votes` & `vote_responses`**
   - Decisiones democráticas (ej: "Acto Extraordinario"). Requiere aprobación del 60% del grupo.

---

## 📱 Mapa de Navegación

La app utiliza un esquema de navegación basado en **Stack**.

- **No Autenticado (AuthStack):**
  - `LoginScreen` ↔ `RegisterScreen`
- **Autenticado (MainStack):**
  - `DashboardScreen`: Lista de grupos a los que pertenece.
    - `CreateGroupScreen`: Crear grupo y definir Temporada/Vigencia.
    - `JoinGroupScreen`: Ingresar código/ID de grupo.
- **Detalle de Grupo (GroupStack):**
  - `GroupDetailsScreen`: 
    - *Pestaña Ranking*: Muestra los `group_members` ordenados. El admin tiene un ícono (⭐). Muestra botón para Finalizar Temporada.
    - *Pestaña Juntadas*: Lista de juntadas.
    - *Pestaña Votaciones*: Lista general de votaciones del grupo (aún no migrado 100%, principalmente operan por juntada).
- **Detalle de Juntada (JuntadaStack):**
  - `JuntadaDetailsScreen`: Asistencia, Subida de Fotos, y navegación mediante un **Dropdown** hacia las Herramientas:
    - `MatchesScreen`: Añadir partidas y ganadores.
    - `BetsScreen`: Mercado de apuestas y visualización de cuotas.
    - `VotesScreen`: Actos Extraordinarios.
    - `RandomizadorScreen`: Sorteos numéricos y Creador de Torneos/Llaves.

---

## ⚙️ Funcionalidades Principales

1. **Gestión de Temporadas (Seasons):**
   - Los grupos tienen una fecha de caducidad (end_date). 
   - Una vez vencida, el admin puede coronar a X ganadores, lo que bloquea el grupo y guarda una "foto" de los resultados.
   - Permite "Clonar" para iniciar la próxima temporada, manteniendo los usuarios pero reiniciando todos a 0 puntos, lo que genera un grupo nuevo (S2, S3, etc).
2. **Sistema Económico y de Puntos (Apuestas):**
   - **Lógica Fuerte (`src/utils/betsLogic.ts`)**: Se limita la apuesta a 3 puntos máximos de pérdida.
   - El pozo (pool) recolectado se divide exactamente (fraccionado con 1 decimal) entre todos los ganadores.
3. **Torneos y Randomizador:**
   - **Lógica Fuerte (`src/utils/tournamentLogic.ts`)**: Emparejamiento aleatorio de listas de ganadores que sobreviven cada ronda (Fisher-Yates shuffle). Resuelve torneos impares otorgando pases directos ("BYE").
4. **Sistema Democrático:**
   - **Lógica Fuerte (`src/utils/votesLogic.ts`)**: Toda moción requiere **>= 60%** del total de miembros de un grupo (no solo de los asistentes) para ser aprobada y surtir efectos de puntos.

---

## 🧪 Testing y Validaciones

Las funcionalidades que involucran cálculos matemáticos críticos (reparto fraccionado de puntos, cuórums estadísticos, y algoritmos de barajado) están desacopladas de React en la carpeta `src/utils/` y cubiertas con **Unit Tests (Jest)**.

### Cómo ejecutar las pruebas:
# Ejecutar todas las pruebas
```
npm run test
```
*Se cuenta con 21 test unitarios que cubren los escenarios esperados y los casos borde (división por cero, sin ganadores, números flotantes, etc.).*

---

## 🚀 Exportación y Despliegue (Play Store)

Dado que es un proyecto de Expo gestionado, la generación del archivo **Android App Bundle (.aab)** necesario para subir a Google Play Store se realiza utilizando **EAS Build** (Expo Application Services).

### Pasos para exportar (.aab):
1. **Instalar el CLI:** `npm install -g eas-cli`
2. **Iniciar sesión:** `eas login`
3. **Configurar:** `eas build:configure` (creará `eas.json`)
4. **Construir:** Ejecuta `eas build -p android` y Expo compilará el `.aab` en la nube.
5. Descarga el enlace que te arroje la terminal, ¡listo para Play Console!
