// API pública compatible con REST Countries v3.1. No requiere clave.
const API_URL = 'https://restcountries.conventus.de/v3.1/all?fields=name,population,flags,capital,region,cca2,translations';
const grid = document.querySelector('#country-grid');
const statusBox = document.querySelector('#status');
const searchInput = document.querySelector('#search-input');
const regionFilter = document.querySelector('#region-filter');
const resultCount = document.querySelector('#results-count');
const clearButton = document.querySelector('#clear-filters');
const themeButton = document.querySelector('#theme-toggle');
const languageButton = document.querySelector('#language-toggle');
let countries = [];
let language = 'es';
let state = 'loading';
const messages = {
  es: { search: 'Buscar un país…', searchLabel: 'Buscar por nombre de país', regionFilter: 'Filtrar por región', all: 'Todas las regiones', population: 'Población', region: 'Región', capital: 'Capital', unknown: 'No disponible', dark: 'Modo oscuro', light: 'Modo claro', clear: 'Limpiar filtros', loading: 'Cargando países…', error: 'No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo.', retry: 'Reintentar', empty: 'No encontramos ese país.', hint: 'Prueba otro nombre o cambia la región.', result: 'países encontrados', one: 'país encontrado', footer: 'Explora el mundo · Hecho por Johan', data: 'Datos y población: ', language: 'Switch to English', regions: { Africa: 'África', Americas: 'América', Asia: 'Asia', Europe: 'Europa', Oceania: 'Oceanía', Antarctic: 'Antártida' } },
  en: { search: 'Search for a country…', searchLabel: 'Search by country name', regionFilter: 'Filter by region', all: 'All regions', population: 'Population', region: 'Region', capital: 'Capital', unknown: 'Not available', dark: 'Dark mode', light: 'Light mode', clear: 'Clear filters', loading: 'Loading countries…', error: 'Could not load the data. Check your connection and try again.', retry: 'Try again', empty: 'No countries found.', hint: 'Try another name or change the region.', result: 'countries found', one: 'country found', footer: 'Explore the world · Made by Johan', data: 'Country and population data: ', language: 'Cambiar a español', regions: { Africa: 'Africa', Americas: 'Americas', Asia: 'Asia', Europe: 'Europe', Oceania: 'Oceania', Antarctic: 'Antarctica' } }
};
const t = () => messages[language];
const countryName = (c) => language === 'es' ? c.translations?.spa?.common || c.name.common : c.name.common;
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
function updateLabels() {
  document.documentElement.lang = language;
  searchInput.placeholder = t().search;
  document.querySelector('#search-label').textContent = t().searchLabel;
  document.querySelector('#region-label').textContent = t().regionFilter;
  for (const option of regionFilter.options) option.textContent = option.value ? t().regions[option.value] : t().all;
  clearButton.textContent = t().clear;
  document.querySelector('#theme-label').textContent = document.body.classList.contains('dark') ? t().light : t().dark;
  languageButton.textContent = language === 'es' ? 'ES / EN' : 'EN / ES';
  languageButton.setAttribute('aria-label', t().language);
  document.querySelector('#footer-credit').textContent = t().footer;
  document.querySelector('#data-label').textContent = t().data;
}
function createCountryCard(country, index) {
  const card = document.createElement('article'); card.className = 'country-card';
  const flagWrap = document.createElement('div'); flagWrap.className = 'flag-wrap';
  const flag = document.createElement('img');
  // Imágenes reales: no dependen de los emojis del sistema operativo.
  flag.src = `https://flagcdn.com/w640/${country.cca2.toLowerCase()}.png`;
  flag.alt = `${language === 'es' ? 'Bandera de' : 'Flag of'} ${countryName(country)}`;
  flag.width = 640; flag.height = 384;
  flag.loading = index < 4 ? 'eager' : 'lazy'; flag.decoding = 'async';
  flag.addEventListener('error', () => { flag.hidden = true; flagWrap.textContent = flag.alt; flagWrap.classList.add('flag-unavailable'); }, { once: true });
  flagWrap.append(flag);
  const content = document.createElement('div'); content.className = 'card-content';
  const title = document.createElement('h2'); title.textContent = countryName(country);
  const data = document.createElement('dl'); data.className = 'country-data';
  const population = Number.isFinite(country.population) ? new Intl.NumberFormat(language).format(country.population) : t().unknown;
  for (const [label, value] of [[t().population, population], [t().region, t().regions[country.region] || country.region || t().unknown], [t().capital, country.capital?.join(', ') || t().unknown]]) {
    const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd');
    term.textContent = `${label}:`; detail.textContent = value; row.append(term, detail); data.append(row);
  }
  content.append(title, data); card.append(flagWrap, content); return card;
}
function showStatus() {
  statusBox.hidden = false; statusBox.replaceChildren();
  const text = document.createElement('span'); text.textContent = state === 'loading' ? t().loading : t().error;
  statusBox.append(text); resultCount.textContent = '';
  if (state === 'error') {
    const retry = document.createElement('button'); retry.className = 'clear-button'; retry.textContent = t().retry;
    retry.addEventListener('click', loadCountries, { once: true }); statusBox.append(retry);
  }
}
function renderCountries() {
  if (state !== 'ready') { showStatus(); return; }
  const query = normalize(searchInput.value.trim()); const region = regionFilter.value;
  const filtered = countries.filter((c) => [c.name.common, c.translations?.spa?.common || ''].some((name) => normalize(name).includes(query)) && (!region || c.region === region));
  grid.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement('div'); empty.className = 'empty-state'; const title = document.createElement('strong');
    title.textContent = t().empty; empty.append(title, document.createTextNode(t().hint)); grid.append(empty);
  } else {
    const fragment = document.createDocumentFragment();
    [...filtered].sort((a, b) => countryName(a).localeCompare(countryName(b), language)).forEach((c, i) => fragment.append(createCountryCard(c, i)));
    grid.append(fragment);
  }
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? t().one : t().result}`;
  clearButton.hidden = !query && !region; statusBox.hidden = true;
}
async function loadCountries() {
  state = 'loading'; grid.replaceChildren(); showStatus();
  try {
    const response = await fetch(API_URL);
    // fetch no rechaza automáticamente respuestas HTTP 404 o 500.
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload) || !payload.length) throw new Error('Formato inesperado');
    countries = payload.filter((c) => c.name?.common && /^[A-Z]{2}$/.test(c.cca2));
    if (!countries.length) throw new Error('No hay países válidos');
    state = 'ready'; renderCountries();
  } catch (error) { console.error('Countries API:', error); state = 'error'; showStatus(); }
}
searchInput.addEventListener('input', renderCountries);
regionFilter.addEventListener('change', renderCountries);
clearButton.addEventListener('click', () => { searchInput.value = ''; regionFilter.value = ''; renderCountries(); searchInput.focus(); });
themeButton.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark'); themeButton.setAttribute('aria-pressed', String(dark));
  document.querySelector('.theme-icon').textContent = dark ? '☀' : '☾'; updateLabels();
});
languageButton.addEventListener('click', () => { language = language === 'es' ? 'en' : 'es'; updateLabels(); renderCountries(); });
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); } });
updateLabels(); loadCountries();
