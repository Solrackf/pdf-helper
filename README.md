# PDF Helper

Una aplicación web simple para recortar y comprimir archivos PDF, diseñada especialmente para estudiantes que necesitan trabajar con documentos extensos.

## Características

- **Selección de páginas**: Permite extraer páginas específicas mediante rangos (ej. "1-5, 8, 11-13")
- **Procesamiento por lotes**: Procesa múltiples archivos PDF a la vez
- **Compresión ajustable**: Diferentes niveles de compresión según tus necesidades
- **Interfaz intuitiva**: Arrastra y suelta tus archivos PDF
- **Privacidad garantizada**: Procesamiento 100% local (no se suben archivos a ningún servidor)

## Tecnologías utilizadas

- HTML5, CSS3 y JavaScript
- Tailwind CSS para el diseño responsivo
- PDF.js para la extracción de información de PDFs
- PDF-lib.js para la manipulación de documentos PDF

## Cómo usar

1. Arrastra tus archivos PDF o haz clic para seleccionarlos
2. Para cada archivo, especifica qué páginas deseas conservar
3. Selecciona el nivel de compresión deseado
4. Haz clic en "Procesar y Descargar"
5. Los archivos procesados se descargarán automáticamente

## Despliegue local

Si deseas ejecutar esta aplicación localmente:

1. Clona este repositorio
2. Abre `index.html` en tu navegador favorito

## Compatibilidad

Funciona mejor en navegadores modernos:
- Chrome
- Firefox
- Edge
- Safari

## Limitaciones

- El procesamiento de archivos muy grandes puede ser lento dependiendo del dispositivo
- La compresión de imágenes y gráficos complejos puede afectar la calidad visual

## Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar esta herramienta, no dudes en crear un pull request.

## Licencia

MIT