# calculadHora - Calendario de Registro de Horas

**calculadHora** es una aplicación web progresiva (PWA) para profesionales independientes que necesitan registrar sus horas trabajadas y calcular honorarios de forma rápida, visual y completamente privada.

Creado y mantenido por [@soymarcusdev](https://soymarcus.dev).

![calculadHora Preview](img/logo.svg)

## ✨ Características

- **Diseño Bento UI** — Interfaz oscura moderna con tarjetas tipo Bento Box, optimizada para legibilidad y modo oscuro.
- **PWA Instalable** — Funciona offline gracias al Service Worker (cache-first) y se puede instalar en móvil o escritorio.
- **Persistencia Local** — Los datos se guardan en LocalStorage. Nada sale de tu dispositivo.
- **Selector de Años** — Navegá entre años desde 2026 en adelante con un stepper. Cada año tiene su propio conjunto de calendarios y datos.
- **10 Monedas** — Configurá tu tarifa horaria en USD, EUR, ARS, BRL, CLP, COP, MXN, PEN, UYU o VES.
- **Cálculo Mensual** — Calculá horas y monto por mes al instante.
- **Resumen Anual** — Total de horas, total cobrado y promedio mensual de todo el año.
- **Día Libre** — Marcá días como "libre" con un ícono de luna.
- **Captura PNG** — Exportá cualquier mes como imagen usando html2canvas.
- **Importar / Exportar JSON** — Backup y restauración completa de tus datos.
- **Navegación por Teclado** — Flechas para moverte entre días, Enter para editar, atajos en el modal (Enter guarda, L = libre, Escape = cerrar).
- **Responsive** — Fluido de smartphone a escritorio.

## 🚀 Tecnologías

- **Frontend:** HTML5, CSS3 (custom properties, animaciones, grid)
- **Tipografía:** Helvetica Neue / Helvetica Mono
- **Lógica:** Vanilla JavaScript (ES6+)
- **Iconos:** Font Awesome 6.5.2
- **Captura:** html2canvas 1.4.1
- **PWA:** Web App Manifest + Service Worker (cache-first + stale-while-revalidate para CDN)

## 📦 Uso Local

```bash
git clone https://github.com/Leidreiter/calculadHora.git
cd calculadHora
```

Abrí `index.html` en tu navegador o servilo con Live Server (el puerto configurado es 5502).

> El Service Worker requiere servir la app via HTTP(S) local (Live Server, npx serve, etc.).

## 🗂️ Estructura

```text
calculadHora/
├── css/
│   └── styles.css        # Estilos Bento UI, variables, responsive
├── js/
│   └── script.js         # Lógica: calendario, modal, LS, cálculos, año
├── img/
│   ├── logo.svg          # Logotipo oficial
│   ├── favicon.svg       # Favicon SVG
│   ├── icon-192.png      # Icono PWA 192px
│   └── icon-512.png      # Icono PWA 512px
├── index.html            # Shell de la aplicación
├── sw.js                 # Service Worker (cache-first)
├── manifest.json         # Configuración PWA
├── .vscode/
│   └── settings.json     # Live Server en puerto 5502
└── README.md
```

## 🤝 Contribuciones

1. Fork del proyecto
2. Rama: `git checkout -b feature/mi-mejora`
3. Commit: `git commit -m 'Descripción del cambio'`
4. Push: `git push origin feature/mi-mejora`
5. Abrí un Pull Request

Consultas técnicas: [@soymarcusdev](https://soymarcus.dev).

## 📄 Licencia

MIT — usalo, modificalo y compartilo libremente.

---

Desarrollado con ❤️ por [@soymarcusdev](https://soymarcus.dev).

> "Simplificando la gestión del tiempo para creadores y profesionales."
