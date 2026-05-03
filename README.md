# calculadHora - Calendario de Registro de Horas 2026

**calculadHora** es una aplicación web progresiva (PWA) diseñada para profesionales independientes y trabajadores que necesitan llevar un control estricto de sus horas trabajadas y calcular sus honorarios de forma rápida, visual y privada. 

Este proyecto fue creado y es mantenido por [@soymarcusdev](https://soymarcus.dev).

![calculadHora Preview](img/logo.svg)

## ✨ Características

- **Diseño Bento UI:** Interfaz moderna y minimalista basada en el concepto de "Bento Box", optimizada para la legibilidad y el modo oscuro.
- **PWA Funcional:** Instalable en dispositivos móviles y de escritorio. Funciona sin conexión a internet gracias a su Service Worker.
- **Persistencia Local:** Los datos se guardan automáticamente en el navegador utilizando `LocalStorage`. Tus datos no salen de tu dispositivo.
- **Cálculo Automático:** Define una tarifa horaria global y obtén el total de horas y el monto a cobrar por cada mes al instante.
- **Exportación a Imagen:** Permite capturar la tarjeta de cualquier mes como un archivo PNG para compartir o guardar como respaldo, utilizando la librería `html2canvas`.
- **Responsive Design:** Adaptado para una experiencia fluida desde smartphones hasta pantallas de gran resolución.

## 🚀 Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Custom Variables, Animaciones).
- **Tipografía:** Syne para titulares y Space Mono para datos numéricos.
- **Lógica:** Vanilla JavaScript (ES6+).
- **Iconografía:** Font Awesome 6.5.2.
- **Librerías Externas:** html2canvas para la generación de capturas.
- **PWA:** Web App Manifest y Service Worker (Cache-First strategy).

## 📦 Instalación y Uso Local

Para correr este proyecto localmente, simplemente clona el repositorio y abre el archivo `index.html` en tu navegador:

```bash
git clone https://github.com/tu-usuario/calculadhora.git
cd calculadhora
```

*Nota: Para que el Service Worker de la PWA funcione correctamente, se recomienda servir los archivos a través de un servidor local (como Live Server en VS Code) o mediante HTTPS.*

## 🛠️ Estructura del Proyecto

```text
calculadHora/
├── css/
│   └── styles.css      # Estilos principales, variables y layout Bento
├── js/
│   └── script.js      # Lógica del calendario, modal y LocalStorage
├── img/
│   ├── logo.svg       # Logotipo oficial
│   ├── icon-192.png   # Icono PWA
│   └── icon-512.png   # Icono PWA
├── index.html         # Estructura principal de la aplicación
├── sw.js              # Service Worker para soporte offline
├── manifest.json      # Configuración de la PWA
└── README.md          # Documentación del proyecto
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la interfaz o añadir nuevas funcionalidades:

1. Haz un Fork del proyecto.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaMejora`).
3. Haz un commit de tus cambios (`git commit -m 'Añade una mejora increíble'`).
4. Haz un Push a la rama (`git push origin feature/NuevaMejora`).
5. Abre un Pull Request.

Si tienes dudas técnicas, puedes contactar directamente a @soymarcusdev.

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Siéntete libre de usarlo, modificarlo y compartirlo.

---

Desarrollado con ❤️ por @soymarcusdev.

> "Simplificando la gestión del tiempo para creadores y profesionales."