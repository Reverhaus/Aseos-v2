# Plantilla de importación · Aseo y Menús

Este documento explica cómo transformar un listado informal de residentes,
zonas y funciones en el JSON exacto que acepta la sección **Gestión → Importar**
de la PWA *Aseo y Menús*.

---

## 1. Estructura de datos esperada

El JSON de importación tiene esta forma:

```json
{
  "zonas": [
    {
      "id": "string-único",
      "nombre": "Nombre de la zona",
      "funciones": [
        {
          "id": "string-único",
          "nombre": "Nombre de la función",
          "turno": "manana" | "tarde",
          "residentes": [
            {
              "id": "string-único",
              "nombre": "Nombre y apellidos del residente",
              "habitacion": "101",
              "modalidad": "L,X,V" | "M,J,S",
              "prioridad": "alta" | "media" | "normal",
              "menuDesayuno": "cafe" | "cacao" | "turmix",
              "menuComida":   "turmix" | "facil" | "basal",
              "menuMerienda": "cafe" | "cacao" | "turmix",
              "menuCena":     "turmix" | "facil" | "basal"
            }
          ]
        }
      ]
    }
  ]
}
```

**Solo `zonas` es obligatorio.** El campo `registro` y `ui` de la app no se
tocan al importar (se conservan del dispositivo salvo que se incluyan).

---

## 2. Referencia de campos

### Zona (`zona`)
| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | sí | Identificador único. Ver §4.1 |
| `nombre` | string | sí | Nombre visible (ej. "Zona Norte", "Planta 2") |
| `funciones` | array | sí (puede ser `[]`) | Funciones de la zona |

### Función (`funcion`)
| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | sí | Identificador único. Ver §4.1 |
| `nombre` | string | sí | Ej. "Aseo de mañana", "Aseo de tarde" |
| `turno` | `"manana"` \| `"tarde"` | sí | Ver §4.2 |
| `residentes` | array | sí (puede ser `[]`) | Residentes asignados |

### Residente (`residente`)
| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | sí | Identificador único. Ver §4.1 |
| `nombre` | string | sí | Nombre completo del residente |
| `habitacion` | string | recomendado | Número o código de habitación. Si no se sabe, `""` |
| `modalidad` | `"L,X,V"` \| `"M,J,S"` | sí | Solo tiene efecto en turno `manana`. Ver §4.3 |
| `prioridad` | `"alta"` \| `"media"` \| `"normal"` | sí | Ver §4.4 |
| `menuDesayuno` | `"cafe"` \| `"cacao"` \| `"turmix"` | sí | Ver §4.5 |
| `menuComida` | `"turmix"` \| `"facil"` \| `"basal"` | sí | Ver §4.5 |
| `menuMerienda` | `"cafe"` \| `"cacao"` \| `"turmix"` | sí | Ver §4.5 |
| `menuCena` | `"turmix"` \| `"facil"` \| `"basal"` | sí | Ver §4.5 |

---

## 3. Valores válidos (enums)

### 3.1 `turno`
- `"manana"` → turno de mañana (sin tilde, sin mayúscula)
- `"tarde"`  → turno de tarde

### 3.2 `modalidad` (modalidad de ducha)
Solo aplica a residentes de funciones con `turno: "manana"`. Los días se
interpretan como:
- `"L,X,V"` → lunes, miércoles y viernes
- `"M,J,S"` → martes, jueves y sábado

Los domingos no hay ducha por defecto para ninguna modalidad.

En residentes de turno `tarde`, el campo se ignora pero conviene poner
`"L,X,V"` por defecto para evitar `undefined`.

### 3.3 `prioridad`
- `"alta"`   → Prioritario (⚠️). Suele ser gente que requiere atención especial.
- `"media"`  → Comedor (🍽️). Suele ser gente que come en comedor o requiere
              apoyo específico.
- `"normal"` → Normal (🟢). Sin marca especial.

### 3.4 Menús
Existen dos grupos de opciones, uno para desayuno/merienda y otro para
comida/cena:

**Desayuno y merienda** (`menuDesayuno`, `menuMerienda`):
- `"cafe"`   → ☕ Café
- `"cacao"`  → 🍫 Cacao
- `"turmix"` → 🥤 Turmix

**Comida y cena** (`menuComida`, `menuCena`):
- `"turmix"` → 🥤 Turmix
- `"facil"`  → 🥣 Fácil masticación
- `"basal"`  → 🍽️ Basal (dieta normal)

⚠️ **`"turmix"` existe en ambos grupos**, pero NO uses `"facil"` en
desayuno/merienda ni `"cafe"`/`"cacao"` en comida/cena.

---

## 4. Reglas de normalización

Estas reglas están pensadas para que puedas transformar un listado informal
sin ambigüedad. **Aplícalas siempre en este orden.**

### 4.1 Generar IDs
La app necesita IDs únicos tipo string. Genera uno por cada zona, función y
residente. Formato sugerido:

```
zona-<slug-del-nombre>       ejemplo: zona-norte
funcion-<slug>-<turno>       ejemplo: funcion-norte-manana
residente-<numero>           ejemplo: residente-001, residente-002, ...
```

O bien IDs aleatorios cortos: `z1`, `z2`, `f1`, `f2`, `r1`, `r2`...
Lo importante es que **no se repitan** dentro de todo el JSON.

### 4.2 Interpretar turno
Los usuarios suelen decir cosas como:
- "aseo de mañana", "por la mañana", "AM", "mañanas" → `"manana"`
- "aseo de tarde", "por la tarde", "PM", "tardes" → `"tarde"`

Si no se especifica y la función se llama solo "Aseo", asume `"manana"` y
**avisa al usuario** de que lo has asumido.

### 4.3 Interpretar modalidad de ducha
Frases típicas:
- "ducha lunes miércoles y viernes", "L-X-V", "LXV" → `"L,X,V"`
- "ducha martes jueves y sábado", "M-J-S", "MJS" → `"M,J,S"`
- "todos los días" o "diario" → **no existe opción**, avisa. La app solo
  tiene dos modalidades fijas. Lo más cercano es preguntar al usuario.

Si un residente de mañana no tiene modalidad indicada:
- **No inventes.** Pregunta al usuario, o pon `"L,X,V"` por defecto y
  **marca ese residente como "revisar"** en tu respuesta.

### 4.4 Interpretar prioridad
Sinónimos habituales:
- "prioritario", "urgente", "especial", "alta" → `"alta"`
- "comedor", "media", "apoyo", "con ayuda" → `"media"`
- "normal", "sin prioridad", "estándar", o sin indicación → `"normal"`

Por defecto, si no se menciona nada → `"normal"`.

### 4.5 Interpretar menús
Sinónimos:
- Café / solo café → `"cafe"`
- Cacao / chocolate → `"cacao"`
- Turmix / batido / triturado → `"turmix"`
- Fácil / fácil masticación / blando / semiblanda → `"facil"`
- Basal / normal / dieta normal / sin restricciones → `"basal"`

**Si un residente no tiene menús indicados**, asigna valores por defecto:
- `menuDesayuno: "cafe"`
- `menuComida:   "basal"`
- `menuMerienda: "cafe"`
- `menuCena:     "basal"`

Y avisa al usuario de que lo has hecho.

### 4.6 Agrupar residentes por zona y función
Si el listado informal no especifica zona/función:
1. Pregunta al usuario antes de inventar.
2. Si el usuario dice "hazlo como veas", crea **una sola zona** llamada
   `"General"` y **una sola función** por turno llamada `"Aseo de mañana"`
   y `"Aseo de tarde"` (si hay residentes de ambos turnos).

### 4.7 Residentes duplicados
Un mismo residente puede aparecer en **ambos turnos** (mañana y tarde) si
así lo indica el usuario. En ese caso, duplica el objeto residente en cada
función con **IDs distintos**. La app deduplica por `nombre + habitacion`
en la vista de Menús, así que no habrá confusión.

### 4.8 Nombres y textos
- **Nombres de residente**: respeta la capitalización natural. Ej. `"María
  López Serrano"`, no `"MARÍA LÓPEZ SERRANO"`.
- **Habitación**: como string, sin ceros a la izquierda salvo que el usuario
  lo indique. Ej. `"101"`, `"B-12"`, `"M5"`.
- **Zona / función**: respeta el nombre que da el usuario. Si dice "planta
  norte", déjalo como `"Planta Norte"` (title case).

### 4.9 Caracteres especiales
- Codifica todo como UTF-8. Los emojis están soportados.
- Escapa `"` como `\"` dentro de strings.
- No uses saltos de línea dentro de un string de nombre.

---

## 5. Ejemplos de transformación

### Ejemplo 1 · Listado informal mínimo

**Entrada del usuario:**
```
Zona Norte:
- 101 María López, ducha lunes miércoles y viernes, prioritaria, café y basal
- 102 Antonio Ruiz, sin ducha especial, normal
- 103 Carmen Díaz, MJS, comedor, cacao y triturada
```

**Salida esperada:**
```json
{
  "zonas": [
    {
      "id": "zona-norte",
      "nombre": "Zona Norte",
      "funciones": [
        {
          "id": "funcion-norte-manana",
          "nombre": "Aseo de mañana",
          "turno": "manana",
          "residentes": [
            {
              "id": "residente-001",
              "nombre": "María López",
              "habitacion": "101",
              "modalidad": "L,X,V",
              "prioridad": "alta",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            },
            {
              "id": "residente-002",
              "nombre": "Antonio Ruiz",
              "habitacion": "102",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            },
            {
              "id": "residente-003",
              "nombre": "Carmen Díaz",
              "habitacion": "103",
              "modalidad": "M,J,S",
              "prioridad": "media",
              "menuDesayuno": "cacao",
              "menuComida": "turmix",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            }
          ]
        }
      ]
    }
  ]
}
```

**Nota**: a Antonio no se le indicó modalidad → se asume `L,X,V` y se avisa.

---

### Ejemplo 2 · Dos turnos y varias zonas

**Entrada del usuario:**
```
Planta 1: turno mañana Josefa (108) y Manuel (109), sin prioridad, dieta normal
Planta 2: turno tarde Rosario (201) y Francisco (202), Rosario con ayuda comedor
```

**Salida esperada:**
```json
{
  "zonas": [
    {
      "id": "zona-planta-1",
      "nombre": "Planta 1",
      "funciones": [
        {
          "id": "funcion-planta-1-manana",
          "nombre": "Aseo de mañana",
          "turno": "manana",
          "residentes": [
            {
              "id": "residente-001",
              "nombre": "Josefa",
              "habitacion": "108",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            },
            {
              "id": "residente-002",
              "nombre": "Manuel",
              "habitacion": "109",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            }
          ]
        }
      ]
    },
    {
      "id": "zona-planta-2",
      "nombre": "Planta 2",
      "funciones": [
        {
          "id": "funcion-planta-2-tarde",
          "nombre": "Aseo de tarde",
          "turno": "tarde",
          "residentes": [
            {
              "id": "residente-003",
              "nombre": "Rosario",
              "habitacion": "201",
              "modalidad": "L,X,V",
              "prioridad": "media",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            },
            {
              "id": "residente-004",
              "nombre": "Francisco",
              "habitacion": "202",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Ejemplo 3 · Mismo residente en ambos turnos

**Entrada:**
```
María López (101) está en mañana y en tarde. Ducha LXV. Normal.
```

**Salida:**
```json
{
  "zonas": [
    {
      "id": "zona-general",
      "nombre": "General",
      "funciones": [
        {
          "id": "funcion-general-manana",
          "nombre": "Aseo de mañana",
          "turno": "manana",
          "residentes": [
            {
              "id": "residente-001",
              "nombre": "María López",
              "habitacion": "101",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            }
          ]
        },
        {
          "id": "funcion-general-tarde",
          "nombre": "Aseo de tarde",
          "turno": "tarde",
          "residentes": [
            {
              "id": "residente-002",
              "nombre": "María López",
              "habitacion": "101",
              "modalidad": "L,X,V",
              "prioridad": "normal",
              "menuDesayuno": "cafe",
              "menuComida": "basal",
              "menuMerienda": "cafe",
              "menuCena": "basal"
            }
          ]
        }
      ]
    }
  ]
}
```

Los IDs son distintos (`residente-001` y `residente-002`) aunque sea la
misma persona. La app la mostrará una sola vez en Menús y dos veces en Aseo
(una por turno).

---

## 6. Checklist antes de devolver el JSON

Antes de entregar el JSON al usuario, verifica:

- [ ] Es JSON válido (puedes parsearlo con `JSON.parse`).
- [ ] El objeto raíz tiene una clave `"zonas"` que es un array.
- [ ] Cada zona tiene `id`, `nombre`, `funciones`.
- [ ] Cada función tiene `id`, `nombre`, `turno`, `residentes`.
- [ ] Cada residente tiene los 8 campos obligatorios.
- [ ] Todos los IDs son únicos en todo el documento.
- [ ] Todos los `turno` son `"manana"` o `"tarde"`.
- [ ] Todos los `prioridad` son `"alta"`, `"media"` o `"normal"`.
- [ ] Todos los `modalidad` son `"L,X,V"` o `"M,J,S"`.
- [ ] `menuDesayuno` y `menuMerienda` solo usan `"cafe"`, `"cacao"` o `"turmix"`.
- [ ] `menuComida` y `menuCena` solo usan `"turmix"`, `"facil"` o `"basal"`.
- [ ] Los nombres están en su capitalización natural (no TODO MAYÚSCULAS).
- [ ] No hay caracteres raros (mojibake, `\u00e1` en vez de `á`).
- [ ] Has avisado al usuario de cualquier valor que hayas asumido por defecto.

---

## 7. Qué devolver al usuario

Cuando entregues el JSON, incluye:

1. **El JSON completo**, en un bloque de código, listo para copiar y pegar
   en el modal Importar de la app.
2. **Un resumen** con:
   - Cuántas zonas, funciones y residentes has generado.
   - Qué valores has asumido por defecto (modalidad, menús, prioridad, etc.).
   - Qué información te ha faltado y el usuario debería completar después
     (a mano desde la app, editando cada residente).

Ejemplo de respuesta:

> He preparado el JSON con **2 zonas**, **3 funciones** y **8 residentes**.
>
> **Valores asumidos** (porque no se indicaron):
> - 4 residentes sin modalidad de ducha → asignado `"L,X,V"` por defecto.
> - 6 residentes sin menús → desayuno `cafe`, comida `basal`, merienda
>   `cafe`, cena `basal`.
>
> **Falta por completar** (edítalo después desde la app):
> - Habitación de "Pepa la del 3º".
> - Modalidad de ducha de Antonio y Manuel.

---

## 8. Errores comunes a evitar

| Error | Corrección |
|---|---|
| Usar `"mañana"` con ñ | Usar `"manana"` sin ñ |
| Usar `"lunes,miércoles,viernes"` | Usar `"L,X,V"` |
| Poner `"prioridad": "Comedor"` | Usar `"media"` |
| Poner `"menuComida": "cafe"` | Usar `"basal"` u otro de comida |
| Repetir IDs | Generar IDs únicos |
| Dejar `habitacion` como número | Convertir a string: `"101"` no `101` |
| Devolver el JSON con comentarios `//` | El JSON debe ser puro, sin comentarios |
| Devolver solo las zonas sin el wrapper `{ "zonas": [...] }` | Incluir siempre el objeto raíz |
| Inventar zonas o funciones | Preguntar al usuario primero |