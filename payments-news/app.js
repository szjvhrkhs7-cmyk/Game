(() => {
  'use strict';

  let DATA = window.PAYDIGEST_DATA;
  if (!DATA) return;

  const SECTION_UI = {
    payments: {
      hero: 'Сигналы, которые<br><em>двигают рынок.</em>',
      copy: 'Русскоязычные новости платёжного рынка только за последние две недели. В приоритете редакционные и аналитические издания.',
      period: 'новости за 14 дней',
      analytics: 'рыночный вывод в каждом материале',
      lead: 'События платёжного рынка, инфраструктуры и финтеха. В карточке отделены факты публикации от редакционного вывода.',
      impactLabel: 'Почему это важно · аналитика рынка',
      resultNoun: 'новостей',
      search: 'Поиск по платежам',
      note: 'Свежая версия загружается при каждом открытии. Редакционная сборка выполняется автоматически каждые 30 минут.',
    },
    law: {
      hero: 'Право без<br><em>новостного шума.</em>',
      copy: 'Отдельная библиотека правовых статей и действующих материалов о регулировании платёжных услуг, цифровых активов и ИИ.',
      period: 'действующие нормы и позиции',
      analytics: 'правовой вывод в каждом материале',
      lead: 'Это не повтор новостей: здесь собраны нормативные документы, профессиональные разборы и практические правовые последствия для банков и технологических компаний.',
      impactLabel: 'Правовой вывод · применение и риски',
      resultNoun: 'правовых материалов',
      search: 'Поиск по правовой библиотеке',
      note: 'Автообновление работает для новостей. Правовая библиотека сохраняется отдельно, чтобы нормативные материалы не заменялись новостными дублями.',
    },
    ai: {
      hero: 'ИИ, который<br><em>меняет рынок.</em>',
      copy: 'Русскоязычные новости и аналитика рынка искусственного интеллекта только за последние две недели.',
      period: 'новости за 14 дней',
      analytics: 'рыночный вывод в каждом материале',
      lead: 'Продукты, капитал, инфраструктура и регулирование ИИ — с кратким разбором влияния на рынок и бизнес-модели.',
      impactLabel: 'Почему это важно · аналитика рынка ИИ',
      resultNoun: 'новостей',
      search: 'Поиск по ИИ',
      note: 'Свежая версия загружается при каждом открытии. Редакционная сборка выполняется автоматически каждые 30 минут.',
    },
  };

  const PULSE_UI = {
    payments: {
      title: 'Пульс платёжного рынка',
      subtitle: 'Два редакционных вывода по материалам текущего выпуска. Не являются инвестиционной рекомендацией.',
      cards: [
        { tone: 'pulse-payments', label: 'Платежи', badge: 'Инфраструктура', title: 'Контроль платёжного маршрута становится главным активом', copy: 'Банки, процессинговые платформы и цифровой рубль сближаются на уровне API. Конкуренция смещается от отдельного продукта к устойчивости и совместимости всей инфраструктуры.' },
        { tone: 'pulse-ai', label: 'Платежи', badge: 'Антифрод', title: 'Защита клиента становится частью экономики продукта', copy: 'Компенсации, блокировки и новые обязанности банков превращают антифрод из технической функции в фактор стоимости сервиса, доверия и клиентского опыта.' },
      ],
    },
    law: {
      title: 'Правовой фокус',
      subtitle: 'Практические последствия норм и профессиональных правовых разборов. Не является юридической консультацией.',
      cards: [
        { tone: 'pulse-law', label: 'Право', badge: 'Платёжные услуги', title: 'Регулирование переходит от принципов к операционным обязанностям', copy: 'Сроки подключения, правила возмещения и требования к инфраструктуре должны превращаться в конкретные изменения договоров, контролей и клиентских сценариев.' },
        { tone: 'pulse-law-alt', label: 'Право', badge: 'ИИ и данные', title: 'Ответственность смещается к данным, лицензиям и контролю модели', copy: 'Для ИИ-проектов ключевыми становятся происхождение данных, условия лицензий, документирование решений и доказуемый человеческий контроль.' },
      ],
    },
    ai: {
      title: 'Пульс рынка ИИ',
      subtitle: 'Два редакционных вывода по материалам текущего выпуска. Не являются инвестиционной рекомендацией.',
      cards: [
        { tone: 'pulse-ai', label: 'ИИ', badge: 'Внедрение', title: 'Ценность перемещается из модели в рабочий процесс', copy: 'Побеждают решения, которые встроены в данные, права доступа и измеримый бизнес-процесс, а не просто демонстрируют качество ответа в отдельном чате.' },
        { tone: 'pulse-payments', label: 'ИИ', badge: 'Экономика', title: 'Рынок требует доказуемой эффективности и контроля рисков', copy: 'Инвестиции и корпоративный спрос концентрируются там, где можно измерить результат, защитить данные и объяснить ответственность за решение модели.' },
      ],
    },
  };

  const allowed = new Set(Object.keys(DATA));
  const $ = (selector) => document.querySelector(selector);
  const normalize = (value) => String(value || '').toLocaleLowerCase('ru-RU');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (symbol) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[symbol]));
  const safeUrl = (value) => /^https?:\/\//i.test(String(value || '')) ? escapeHtml(value) : '#';

  function loadSaved() {
    try {
      const value = JSON.parse(localStorage.getItem('paydigest-saved') || '[]');
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

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
    localStorage.setItem('paydigest-theme', theme);
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#151613' : '#f4f2ed';
    $('#themeToggle').setAttribute('aria-pressed', String(theme === 'dark'));
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
    const kind = section === 'law' ? ' law-card' : '';
    const featured = item.featured && index === 0 ? ' featured' : '';
    const title = escapeHtml(item.title);
    const source = escapeHtml(item.source);
    const url = safeUrl(item.url);

    return `<article class="story-card${kind}${featured}">
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
      if (fresh && fresh.payments && fresh.law && fresh.ai) {
        DATA = fresh;
        render();
        setRefreshStatus('Свежий выпуск загружен', 'ready');
      } else {
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

  document.querySelector('.primary-nav').addEventListener('click', (event) => {
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
    localStorage.setItem('paydigest-saved', JSON.stringify([...saved]));
    button.classList.toggle('is-saved', saved.has(id));
    button.textContent = saved.has(id) ? '★' : '☆';
    button.setAttribute('aria-label', saved.has(id) ? 'Удалить из сохранённых' : 'Сохранить материал');
  });

  search.addEventListener('input', () => {
    query = search.value.trim();
    render();
  });

  $('#clearFilters').addEventListener('click', () => {
    filter = 'Все';
    query = '';
    search.value = '';
    render();
  });

  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  window.addEventListener('hashchange', () => {
    const next = location.hash.slice(1);
    if (allowed.has(next) && next !== section) {
      section = next;
      filter = 'Все';
      query = '';
      search.value = '';
      render();
    }
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

  const preferred = localStorage.getItem('paydigest-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(preferred);
  render();
  refreshData({ force: true });
})();
