(() => {
  'use strict';
  const DATA = window.PAYDIGEST_DATA;
  const allowed = new Set(Object.keys(DATA));
  const saved = new Set(JSON.parse(localStorage.getItem('paydigest-saved') || '[]'));
  let section = allowed.has(location.hash.slice(1)) ? location.hash.slice(1) : 'payments';
  let filter = 'Все';
  let query = '';

  const $ = selector => document.querySelector(selector);
  const grid = $('#cardGrid');
  const filters = $('#filters');
  const search = $('#searchInput');
  const normalize = value => String(value || '').toLocaleLowerCase('ru-RU');
  const itemId = item => btoa(unescape(encodeURIComponent(item.url))).replaceAll('=','');

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('paydigest-theme', theme);
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#151613' : '#f4f2ed';
  }

  function renderFilters() {
    filters.innerHTML = DATA[section].filters.map(name => `<button class="filter-button ${filter === name ? 'is-active' : ''}" type="button" data-filter="${name}">${name}</button>`).join('');
  }

  function visibleItems() {
    return DATA[section].items.filter(item => {
      const matchesFilter = filter === 'Все' || item.tags.includes(filter);
      const haystack = normalize([item.title,item.summary,item.impact,item.source,...item.tags].join(' '));
      return matchesFilter && (!query || haystack.includes(normalize(query)));
    });
  }

  function card(item, index) {
    const id = itemId(item);
    return `<article class="story-card ${item.featured && index === 0 ? 'featured' : ''}">
      <div class="card-top"><div class="card-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div><button class="bookmark ${saved.has(id) ? 'is-saved' : ''}" type="button" data-save="${id}" aria-label="${saved.has(id) ? 'Удалить из сохраненных' : 'Сохранить материал'}">${saved.has(id) ? '★' : '☆'}</button></div>
      <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} — открыть источник">${item.title} <span class="title-arrow" aria-hidden="true">↗</span></a></h3>
      <p class="summary">${item.summary}</p>
      <a class="impact" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Аналитика к материалу «${item.title}» — открыть источник"><b>Почему это важно · аналитика</b><span>${item.impact}</span><strong>Открыть источник ↗</strong></a>
      <div class="card-footer"><span>${item.date}</span><a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Открыть источник: ${item.source}">${item.source} · Источник ↗</a></div>
    </article>`;
  }

  function render() {
    const current = DATA[section];
    const items = visibleItems();
    $('#sectionEyebrow').textContent = current.eyebrow;
    $('#feedTitle').textContent = current.title;
    $('#resultCount').textContent = `${items.length} из ${current.items.length}`;
    $('#materialCount').textContent = Object.values(DATA).reduce((sum, value) => sum + value.items.length, 0);
    grid.innerHTML = items.map(card).join('');
    $('#emptyState').hidden = items.length !== 0;
    document.querySelectorAll('.nav-link').forEach(button => button.classList.toggle('is-active', button.dataset.section === section));
    renderFilters();
  }

  function switchSection(next, updateHash = true) {
    if (!allowed.has(next)) return;
    section = next; filter = 'Все'; query = ''; search.value = '';
    if (updateHash) history.replaceState(null, '', `#${next}`);
    render();
  }

  document.querySelector('.primary-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-section]');
    if (button) switchSection(button.dataset.section);
  });
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) { filter = button.dataset.filter; render(); }
  });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-save]');
    if (!button) return;
    const id = button.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    localStorage.setItem('paydigest-saved', JSON.stringify([...saved]));
    render();
  });
  search.addEventListener('input', () => { query = search.value.trim(); render(); });
  $('#clearFilters').addEventListener('click', () => { filter = 'Все'; query = ''; search.value = ''; render(); });
  $('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  window.addEventListener('hashchange', () => switchSection(location.hash.slice(1), false));
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; query = ''; search.blur(); render(); }
  });

  const preferred = localStorage.getItem('paydigest-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(preferred);
  render();
})();
