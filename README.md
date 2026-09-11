# 🧼 Aseo y Menús

PWA ligera para gestionar el **aseo diario** (mañana/tarde) y los **menús**
(desayuno, comida, merienda, cena) de residentes en residencias o centros
de día.

Funciona **sin conexión**, guarda los datos **solo en el dispositivo** y se
instala como app en móvil o tablet. No necesita servidor ni base de datos.

---

## ✨ Funcionalidades

- **Aseo de mañana y tarde** con orden por prioridad, ducha o habitación.
- **Menús por turno** (desayuno/comida y merienda/cena) con grupos por tipo
  de dieta.
- **Swipe** para marcar completado / deshacer.
- **Botón de ducha** que se marca por defecto si al residente le toca ducha
  hoy (L·X·V o M·J·S) y se puede desmarcar manualmente.
- **Incidencia** de deposición (💩).
- **Tema día/noche** que interpola con el deslizamiento del selector.
- **Gestión completa** de zonas, funciones y residentes.
- **Exportar / Importar** todos los datos en JSON.
- **Reinicio diario automático**: los registros son del día y se limpian al
  cambiar la fecha. Los residentes se conservan.

---

## 🚀 Uso en local

Como es una PWA con Service Worker, **necesita servirse por HTTP**, no
vale abrir el `index.html` directamente.

```bash
# Python 3
python -m http.server 8000

# o con Node
npx serve