# Around_The_World_By_Johan

Aplicación web en HTML, CSS y JavaScript inspirada en [REST Countries API with color theme switcher de Frontend Mentor](https://www.frontendmentor.io/challenges/rest-countries-api-with-color-theme-switcher-5cacc469fec04111f7b848ca).

## Aplicación publicada

https://johanlpg.github.io/Around_The_World_By_Johan/

## Funciones

- Tarjetas con imagen de bandera, nombre, población, región y capital.
- Búsqueda en español e inglés, independiente de mayúsculas y acentos.
- Filtro por región, orden alfabético y tema claro/oscuro.
- Selector ES / EN para nombres, controles y datos.
- Diseño adaptable, carga, resultados vacíos y reintento ante errores.

## API y banderas

`https://restcountries.conventus.de/v3.1/all?fields=name,population,flags,capital,region,cca2,translations`

Se consulta esta instancia pública de REST Countries v3.1 con fetch() mediante GET y devuelve un arreglo JSON. La población es el dato proporcionado por la API; no es un contador en tiempo real. translations.spa.common proporciona el nombre en español. Las imágenes se sirven desde FlagCDN, usando el código ISO cca2 (ejemplo: https://flagcdn.com/w640/co.png). No se requieren claves ni dependencias.

## Despliegue

En GitHub: Settings > Pages > Deploy from a branch, rama main y carpeta / (root). Un cambio en main inicia la publicación automática. El repositorio se llama Around_The_World_By_Johan.

Para trabajar localmente, servir esta carpeta con un servidor HTTP estático y abrir index.html. Se requiere internet para consultar la API, las banderas y la fuente tipográfica.
