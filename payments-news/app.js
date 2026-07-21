(() => {
  'use strict';

  const REQUIRED_SECTIONS = ['payments', 'ai'];
  let DATA = window.PAYDIGEST_DATA;
  if (!isValidData(DATA)) return;

  const SECTION_UI = {
    payments: {
      hero: 'Сигналы, которые<br><em>двигают рынок.</em>',
      copy: 'Проверенные новости платежного рынка за последние пять дней — с 17 по 21 июля 2026 года.',
      period: 'новости за 5 дней',
      analytics: 'рыночный вывод в каждом материале',
      lead: 'Платежная инфраструктура, карты, кошельки, мгновенные переводы и антифрод. Факты публикации отделены от редакционного вывода.',
      impactLabel: 'Почему это важно · аналитика рынка',
      resultNoun: 'материалов',
      search: 'Поиск по платежам',
      note: 'Выпуск сформирован по публикациям за 17–21 июля 2026 года. При открытии приложение проверяет актуальную версию файла данных.'
    },
    ai: {
      hero: 'ИИ, который<br><em>меняет финансы.</em>',
      copy: 'Новости применения искусственного интеллекта в банках и платежах за последние пять дней — с 17 по 21 июля 2026 года.',
      period: 'новости за 5 дней',
      analytics: 'практический вывод в каждом материале',
      lead: 'Агентные платежи, банковские операции, антифрод, управление моделями и измеримый экономический эффект.',
      impactLabel: 'Почему это важно · аналитика ИИ',
      resultNoun: 'материалов',
      search: 'Поиск по ИИ',
      note: 'Выпуск сформирован по публикациям за 17–21 июля 2026 года. При открытии приложение проверяет актуальную версию файла данных.'
    }
  };

  const PULSE_UI = {
    payments: {
      title: 'Пульс платежного рынка',
      subtitle: 'Два вывода по материалам текущего пятидневного выпуска. Не являются инвестиционной рекомендацией.',
      cards: [
        {
          tone: 'pulse-payments',
          label: 'Платежи',
          badge: 'Инфраструктура',
          title: 'Национальные мгновенные платежи становятся стратегическим активом',
          copy: 'История Pix показывает: дешевые государственные рельсы меняют конкуренцию с карточными системами и выходят на уровень международной торговой политики.'
        },
        {
          tone: 'pulse-ai',
          label: 'Платежи',
          badge: 'Интерфейс',
          title: 'Кошелек превращается в основную точку продажи финансовых услуг',
          copy: 'Samsung, Mastercard и другие платформы связывают карту, бесконтактную оплату и управление продуктом в одном мобильном интерфейсе.'
        }
      ]
    },
    ai: {
      title: 'Пульс ИИ в финансах',
      subtitle: 'Два вывода по материалам текущего пятидневного выпуска. Не являются инвестиционной рекомендацией.',
      cards: [
        {
          tone: 'pulse-ai',
          label: 'ИИ',
          badge: 'Масштабирование',
          title: 'Банки переходят от пилотов к перестройке операционной модели',
          copy: 'Назначение профильных руководителей, сотни сценариев и измеримый финансовый эффект показывают, что ИИ становится постоянной частью банковской инфраструктуры.'
        },
        {
          tone: 'pulse-payments',
          label: 'ИИ',
          badge: 'Агентные платежи',
          title: 'Главный дефицит — не модель, а доверительная рамка для действий агента',
          copy: 'Для платежей от имени клиента рынку нужны идентификация агента, границы полномочий, правила ответственности и новые антифрод-модели.'
        }
      ]
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const normalize = (value) => String(value || '').toLocaleLowerCase('ru-RU');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (symbol) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[symbol]));

  function isValidData(data) {
    return Boolean(data)
      && Object.keys(data).length === REQUIRED_SECTIONS.length
      && REQUIRED_SECTIONS.every((name) => {
        const current = data[name];
        return current
          && Array.isArray(current.filters)
          && Array.isArray(current.items)
          && current.items.length > 0
          && current.items.length <= 15
          && current.items.every((item) => {
            try {
              const url = new URL(String(item.url || ''));
              return url.protocol === 'https:'
                && typeof item.title === 'string'
                && typeof item.summary === 'string'
                && typeof item.impact === 'string'
                && typeof item.source === 'string'
                && Array.isArray(item.tags);
            } catch {
              return false;
            }
          });
      });
  }

  const safeUrl = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' ? escapeHtml(url.href) : '#';
    } catch {
      return '#';
    }
  };

  function storageGet(key, fallback = '') {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* интерфейс работает без хранилища */ }
  }

  function loadSaved() {
    try {
      const value = JSON.parse(storageGet('paydigest-saved', '[]'));
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

  const allowed = new Set(REQUIRED_SECTIONS);
  const saved = loadSaved();
  let section = allowed.has(location.hash.slice(1)) ? location.hash.slice(1) : 'payments';
  let filter = 'Все';
  let query = '';
  let refreshing = false;
  let lastRefreshAttempt = 0;

  const grid = $('#cardGrid');
  const filters = $('#filters');
  const search = $('#searchInput');
  const itemId = (item) => btoa(unescape(encodeURIComponent(item.url))).replaceAll('=', '');

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    storageSet('paydigest-theme', theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#151613' : '#f4f2ed';
    $('#themeToggle')?.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  function renderFilters() {
    const configured = DATA[section].filters.filter((name) => name !== 'Все');
    const used = DATA[section].items.flatMap((item) => Array.isArray(item.tags) ? item.tags : []);
    const names = ['Все', ...new Set([...configured, ...used])];
    filters.innerHTML = names.map((name) => {
      const active = filter === name;
      return `<button class="filter-button ${active ? 'is-active' : ''}" type="button" data-filter="${escapeHtml(name)}" aria-pressed="${active}">${escapeHtml(name)}</button>`;
    }).join('');
  }

  function visibleItems() {
    return DATA[section].items.filter((item) => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const matchesFilter = filter === 'Все' || tags.includes(filter);
      const haystack = normalize([item.title, item.summary, item.impact, item.source, ...tags].join(' '));
      return matchesFilter && (!query || haystack.includes(normalize(query)));
    });
  }

  function card(item, index) {
    const id = itemId(item);
    const isSaved = saved.has(id);
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const featured = item.featured && index === 0 ? ' featured' : '';
    const title = escapeHtml(item.title);
    const source = escapeHtml(item.source);
    const url = safeUrl(item.url);

    return `<article class="story-card${featured}">
      <div class="card-top">
        <div class="card-tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <button class="bookmark ${isSaved ? 'is-saved' : ''}" type="button" data-save="${id}" aria-label="${isSaved ? 'Удалить из сохранённых' : 'Сохранить материал'}">${isSaved ? '★' : '☆'}</button>
      </div>
      <h3><a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${title} — открыть первоисточник">${title} <span class="title-arrow" aria-hidden="true">↗</span></a></h3>
      <p class="summary">${escapeHtml(item.summary)}</p>
      <a class="impact" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(SECTION_UI[section].impactLabel)} — открыть первоисточник">
        <b>${escapeHtml(SECTION_UI[section].impactLabel)}</b>
        <span>${escapeHtml(item.impact)}</span>
        <strong>Открыть первоисточник ↗</strong>
      </a>
      <div class="card-footer"><span>${escapeHtml(item.date)}</span><a href="${url}" target="_blank" rel="noopener noreferrer">${source} · Первоисточник ↗</a></div>
    </article>`;
  }

  function renderSectionContext(current) {
    const ui = SECTION_UI[section];
    document.documentElement.dataset.section = section;
    $('#pageTitle').innerHTML = ui.hero;
    $('#heroCopy').textContent = ui.copy;
    $('#periodChip').textContent = ui.period;
    $('#analyticsChip').textContent = ui.analytics;
    $('#updateNote').textContent = ui.note;
    $('#sectionLead').textContent = ui.lead;
    search.placeholder = ui.search;
    $('#materialCount').textContent = current.items.length;

    document.querySelectorAll('.nav-link').forEach((button) => {
      const active = button.dataset.section === section;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current');
    });
  }

  function renderPulse(current) {
    const pulse = PULSE_UI[section];
    $('#pulseTitle').textContent = pulse.title;
    $('#pulseSubtitle').textContent = pulse.subtitle;
    document.querySelectorAll('.pulse-card').forEach((element, index) => {
      const cardData = pulse.cards[index];
      const sourceItems = current.items.slice(index * 3, index * 3 + 3);
      element.className = `pulse-card ${cardData.tone}`;
      element.innerHTML = `<div class="pulse-top"><span>${escapeHtml(cardData.label)}</span><b>${escapeHtml(cardData.badge)}</b></div>
        <p class="pulse-value">${escapeHtml(cardData.title)}</p>
        <p>${escapeHtml(cardData.copy)}</p>
        <div class="pulse-sources"><span>Источники анализа</span>${sourceItems.map((item) => `<a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)} ↗</a>`).join('')}</div>`;
    });
  }

  function render() {
    const current = DATA[section];
    const items = visibleItems();
    renderSectionContext(current);
    renderPulse(current);
    $('#sectionEyebrow').textContent = current.eyebrow;
    $('#feedTitle').textContent = current.title;
    $('#resultCount').textContent = `${items.length} из ${current.items.length} ${SECTION_UI[section].resultNoun}`;
    grid.innerHTML = items.map(card).join('');
    $('#emptyState').hidden = items.length !== 0;
    renderFilters();
  }

  function setRefreshStatus(message, state = '') {
    const status = $('#refreshStatus');
    const badge = status?.closest('.freshness-badge');
    if (status) status.textContent = message;
    if (badge) badge.dataset.state = state;
  }

  function refreshData({ force = false } = {}) {
    const now = Date.now();
    if (refreshing || (!force && now - lastRefreshAttempt < 60_000)) return;
    refreshing = true;
    lastRefreshAttempt = now;
    setRefreshStatus('Проверяем свежий выпуск…', 'loading');

    const script = document.createElement('script');
    script.src = `data.js?fresh=${now}`;
    script.async = true;
    script.onload = () => {
      const fresh = window.PAYDIGEST_DATA;
      if (isValidData(fresh)) {
        DATA = fresh;
        render();
        setRefreshStatus('Актуальный выпуск загружен', 'ready');
      } else {
        window.PAYDIGEST_DATA = DATA;
        setRefreshStatus('Показана последняя сохранённая версия', 'offline');
      }
      refreshing = false;
      script.remove();
    };
    script.onerror = () => {
      window.PAYDIGEST_DATA = DATA;
      refreshing = false;
      script.remove();
      setRefreshStatus('Показана последняя сохранённая версия', 'offline');
    };
    document.head.append(script);
  }

  function switchSection(next, updateHash = true) {
    if (!allowed.has(next) || next === section) return;
    section = next;
    filter = 'Все';
    query = '';
    search.value = '';
    if (updateHash) history.replaceState(null, '', `#${next}`);
    render();
  }

  document.querySelector('.primary-nav')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-section]');
    if (button) switchSection(button.dataset.section);
  });

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    render();
  });

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-save]');
    if (!button) return;
    const id = button.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    storageSet('paydigest-saved', JSON.stringify([...saved]));
    button.classList.toggle('is-saved', saved.has(id));
    button.textContent = saved.has(id) ? '★' : '☆';
    button.setAttribute('aria-label', saved.has(id) ? 'Удалить из сохранённых' : 'Сохранить материал');
  });

  search.addEventListener('input', () => {
    query = search.value.trim();
    render();
  });

  $('#clearFilters')?.addEventListener('click', () => {
    filter = 'Все';
    query = '';
    search.value = '';
    render();
  });

  $('#themeToggle')?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  window.addEventListener('hashchange', () => {
    const next = location.hash.slice(1);
    if (allowed.has(next) && next !== section) switchSection(next, false);
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) refreshData({ force: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshData();
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) {
      search.value = '';
      query = '';
      search.blur();
      render();
    }
  });

  const preferred = storageGet('paydigest-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(preferred);
  render();
  refreshData({ force: true });
})();
