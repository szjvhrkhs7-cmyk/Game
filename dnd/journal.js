const data = {
  days: [
    {
      id: 1,
      dayLabel: 'Игровой день 1',
      title: 'Дорога через перевал',
      shortDate: '12 окт. 2024',
      fullDate: '12 октября 2024',
      image: './assets/scene-0.jpg',
      hero: './assets/scene-1.jpg',
      quote: '«В каждом тумане скрывается новая дорога»',
      body: [
        'Мы покинули Сторожевую и взяли курс на северный перевал. Дорога оказалась труднее, чем мы ожидали: снег, камни и странные следы, уходящие в туман.',
        'К вечеру нашли старый лагерь, но в нём уже давно никто не жил. У кострища лежали осколки амулета с незнакомым клеймом.',
        'Казл сказал, что следы слишком крупные для волка. Значит, нас мог сопровождать кто-то гораздо опаснее.',
        'Перед следующей игрой нужно вернуться к этой метке и проверить, связано ли клеймо с Орденом Пепельной Звезды.'
      ],
      note: ['Следы были слишком крупные.', 'Волк? Или что-то другое?'],
      footer: 'Здесь начинается настоящая история.'
    },
    {
      id: 2,
      dayLabel: 'Игровой день 2',
      title: 'Таверна у моста',
      shortDate: '19 окт. 2024',
      fullDate: '19 октября 2024',
      image: './assets/scene-2.jpg',
      hero: './assets/scene-2.jpg',
      quote: '«Лучшие слухи живут там, где пахнет дымом и элем»',
      body: [
        'Добрались до старой таверны у каменного моста. Хозяин узнал знак на осколке и сразу стал заметно осторожнее.',
        'За столом у окна услышали разговор о пропавшем караване и о некой Чёрной Гавани, куда якобы ведут все контрабандные тропы.',
        'Лираэль заметила на балке над сценой вырезанный символ луны. Похоже, он совпадает с рисунком на карте из первого дня.',
        'На следующей сессии стоит расспросить барда и проверить комнаты наверху.'
      ],
      note: ['Запомнить имя хозяина: Марвен.', 'Проверить чердак и дальний сарай.'],
      footer: 'Не всякая остановка бывает безопасной.'
    },
    {
      id: 3,
      dayLabel: 'Игровой день 3',
      title: 'Руины сторожевой башни',
      shortDate: '2 нояб. 2024',
      fullDate: '2 ноября 2024',
      image: './assets/scene-3.jpg',
      hero: './assets/scene-3.jpg',
      quote: '«Камни молчат дольше людей, но помнят лучше»',
      body: [
        'Поднялись к развалинам сторожевой башни. Внизу под плитами обнаружили скрытую комнату с железным сундуком и старой картой побережья.',
        'Вром нашёл механизм, открывающий потайной ход, а Серафина услышала за стеной глухой скрежет, будто кто-то двигался в глубине.',
        'Внутри нашли фрагмент журнала командира крепости. В нём упоминается груз, отправленный морем в Чёрную Гавань.',
        'Пока неясно, как башня связана с орденом, но направление пути стало очевиднее.'
      ],
      note: ['Сделать копию карты.', 'Найти, кто такой командир Эйрин.'],
      footer: 'Руины любят хранить то, что мир хотел забыть.'
    },
    {
      id: 4,
      dayLabel: 'Игровой день 4',
      title: 'Тени в лесу',
      shortDate: '16 нояб. 2024',
      fullDate: '16 ноября 2024',
      image: './assets/scene-4.jpg',
      hero: './assets/scene-4.jpg',
      quote: '«Когда темнеет лес, шёпот слышно лучше шагов»',
      body: [
        'Путь через лес занял почти весь день. Несколько раз нам казалось, что в чащобе кто-то идёт параллельно отряду.',
        'Морг заметил надломленные ветки и следы когтей на коре. Лираэль уверена, что это метки не зверя, а разумного существа.',
        'Ночью лагерь окружили огни болотных духов. Конфликт удалось избежать только благодаря амулету, найденному ещё в первом лагере.',
        'Следующая игра должна начаться с разговора с лесным проводником.'
      ],
      note: ['Не жечь яркий костёр.', 'Амулет реагирует на духов.'],
      footer: 'Лес запоминает каждого, кто входит в него ночью.'
    },
    {
      id: 5,
      dayLabel: 'Игровой день 5',
      title: 'Забытая обитель',
      shortDate: '30 нояб. 2024',
      fullDate: '30 ноября 2024',
      image: './assets/scene-5.jpg',
      hero: './assets/scene-5.jpg',
      quote: '«В тишине храмов эхо отвечает первым»',
      body: [
        'Нашли полуразрушенную обитель на склоне. Внутри сохранились фрески с изображением компаса и трёх лучей.',
        'Серафина почувствовала, что место когда-то было святилищем защиты, но его осквернили. Под алтарём обнаружили ключ из чёрного металла.',
        'Казл считает, что ключ открывает морской склад в гавани. На одной из плит есть такой же знак, как на печати контрабандистов.',
        'Перед следующей игрой нужно решить, идти ли напрямую к морю или завершить поиски в монастырской библиотеке.'
      ],
      note: ['Ключ не реагирует на обычную магию.', 'Проверить библиотеку перед уходом.'],
      footer: 'Иногда путь вперёд лежит через забытые святыни.'
    },
    {
      id: 6,
      dayLabel: 'Игровой день 6',
      title: 'Сердце тумана',
      shortDate: '14 дек. 2024',
      fullDate: '14 декабря 2024',
      image: './assets/scene-6.jpg',
      hero: './assets/scene-6.jpg',
      quote: '«Туман всегда что-то скрывает. Иногда — правду»',
      body: [
        'На рассвете вышли к краю соляной низины, где туман не рассеивался даже под солнцем. В центре стоял древний каменный круг.',
        'Когда мы подошли ближе, компас Лираэль начал вращаться сам по себе. Из тумана послышались голоса, называвшие имена тех, кого мы потеряли.',
        'Вром силой разбил один из камней, и на мгновение открылся проход к дороге, ведущей на побережье. Похоже, гавань совсем близко.',
        'Следующая запись должна стать началом новой главы кампании.'
      ],
      note: ['Каменный круг открывается на рассвете.', 'Гавань уже рядом.'],
      footer: 'Иногда туман не прячет путь, а показывает его.'
    }
  ],
  characters: [
    {
      id: 'kazl',
      name: 'Казл',
      meta: 'Человек · Следопыт',
      portrait: './assets/scene-2.jpg',
      note: 'Знает северные тропы лучше любого проводника. Говорит мало, но замечает детали, которые остальные пропускают. Впервые встретили его у старого каменного моста.',
      hook: 'Не забыть спросить о знаке на его плаще.'
    },
    {
      id: 'lirazel',
      name: 'Лиразэль',
      meta: 'Эльф · Маг',
      portrait: './assets/scene-0.jpg',
      note: 'Спокойная и внимательная. Собирает фрагменты древних историй и умеет связывать события, которые для других выглядят случайными.',
      hook: 'Заметила сходство между символом на карте и знаком луны.'
    },
    {
      id: 'vrom',
      name: 'Вром',
      meta: 'Дварф · Воин',
      portrait: './assets/scene-3.jpg',
      note: 'Надёжен в бою и упрям до невозможности. Именно он нашёл скрытый механизм в сторожевой башне.',
      hook: 'Если рядом дверь, Вром точно попробует её открыть.'
    },
    {
      id: 'serafina',
      name: 'Серафина',
      meta: 'Человек · Жрица',
      portrait: './assets/scene-4.jpg',
      note: 'Чутко чувствует следы старой магии и умеет удерживать отряд от лишнего риска. Лучше всех ведёт разговоры с духами и жрецами.',
      hook: 'Хочет вернуться в обитель и очистить алтарь.'
    },
    {
      id: 'morg',
      name: 'Морг',
      meta: 'Полуорк · Плут',
      portrait: './assets/scene-5.jpg',
      note: 'Ироничен, быстр и всё время делает вид, что ему всё равно. На деле именно он первым замечает слежку и чужие уловки.',
      hook: 'Кажется, он знает о Чёрной Гавани больше, чем говорит.'
    }
  ],
  atlas: [
    {
      id: 'black-harbor',
      title: 'Чёрная Гавань',
      subtitle: 'Место · Город · Прибрежные земли',
      image: './assets/scene-7.jpg',
      description: 'Крупный торговый порт на западе Вельмора. Известен свободной гаванью, пёстрым народом и тёмными слухами. Почти все найденные нами следы рано или поздно указывают именно сюда.',
      tags: ['торговля', 'фракции', 'опасности'],
      links: ['Игровой день 2: Таверна у моста', 'Орден Пепельной Звезды', 'Казл']
    },
    {
      id: 'order',
      title: 'Орден Пепельной Звезды',
      subtitle: 'Организация · Тайное братство',
      image: './assets/scene-3.jpg',
      description: 'Следы ордена встречаются слишком часто, чтобы быть совпадением. Их знак появляется в башне, на печатях и на осколке амулета.',
      tags: ['тайны', 'ритуалы', 'история'],
      links: ['Игровой день 1: Дорога через перевал', 'Забытая обитель']
    },
    {
      id: 'compass',
      title: 'Серебряный компас',
      subtitle: 'Предмет · Артефакт',
      image: './assets/scene-6.jpg',
      description: 'Реагирует на искажения тумана и, похоже, не показывает обычный север. Может быть ключом к входу в гавань.',
      tags: ['артефакт', 'магия'],
      links: ['Сердце тумана', 'Лиразэль']
    },
    {
      id: 'beast',
      title: 'Туманный зверь',
      subtitle: 'Существо · Легенда',
      image: './assets/scene-4.jpg',
      description: 'Пока никто не видел его целиком, но следы слишком крупные, а ночные звуки слишком осмысленны для обычного зверя.',
      tags: ['легенда', 'следы'],
      links: ['Тени в лесу', 'Дорога через перевал']
    }
  ]
};


const params = new URLSearchParams(window.location.search);

const state = {
  section: params.get('section') || 'chronicles',
  selectedDayId: Number(params.get('day') || 1),
  selectedCharacterId: params.get('character') || 'kazl',
  selectedAtlasId: params.get('atlas') || 'black-harbor',
  mobileDetail: params.get('detail') === '1',
  activeTool: 'text',
  showMarginNote: true,
  newDayOpen: false,
};

const toolbarActions = [
  { id: 'spark', label: 'Идея' },
  { id: 'plus', label: 'Новый блок' },
  { id: 'text', label: 'Текст' },
  { id: 'mic', label: 'Голос' },
  { id: 'image', label: 'Изображение' },
  { id: 'swap', label: 'Вариант' },
  { id: 'undo', label: 'Отменить' },
  { id: 'smile', label: 'Тон' },
  { id: 'comment', label: 'Примечание' },
  { id: 'keyboard', label: 'Режим ввода' },
];

const tabs = [
  { id: 'chronicles', label: 'Хроники' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'atlas', label: 'Атлас' },
];

const app = document.querySelector('#app');

const STORAGE_KEY = 'traveler-journal-days-v1';

function restoreDays() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length) {
      data.days.splice(0, data.days.length, ...saved);
    }
  } catch (error) {
    console.warn('Не удалось восстановить записи дневника', error);
  }
}

function persistDays() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.days));
  } catch (error) {
    console.warn('Не удалось сохранить записи дневника', error);
  }
}

function formatDayDate(value) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  return {
    short: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date).replace(' г.', ''),
    full: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date).replace(' г.', ''),
  };
}

function setSaveStatus(text) {
  const status = document.querySelector('[data-save-status]');
  if (status) status.textContent = text;
}

restoreDays();

function icon(name, className = '') {
  const icons = {
    compass: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="21"/><path d="M38.5 23 33 34.5 22 40l5.6-11.1 10.9-5.9Z"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5c0-.8.7-1.5 1.5-1.5h7c.8 0 1.5.7 1.5 1.5V21l-5-3.5L7 21V4.5Z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    feather: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M52 7c-17 4-30 14-36 28-3 8-4 14-4 22 6-9 12-15 18-20 8-7 15-13 22-30Z"/><path d="M12 57c8-11 18-20 30-29"/></svg>`,
    spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/></svg>`,
    text: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7v10M14 7v10M7 17h10"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3"/><path d="M6.5 11.5A5.5 5.5 0 0 0 12 17a5.5 5.5 0 0 0 5.5-5.5M12 17v3M9 20h6"/></svg>`,
    image: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m7 17 4-4 3 3 3-4 2 5"/></svg>`,
    swap: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3M18 7l-3-3M6 17l3 3"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4v5"/><path d="M4 12c1.8-4 5.4-6 9.2-6C18 6 21 9 21 13s-3 7-7 7"/></svg>`,
    smile: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.4 2.1 2 3.5 2s2.5-.6 3.5-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 4 20V7.5A2.5 2.5 0 0 1 6.5 5H17.5A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H6Z"/></svg>`,
    keyboard: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h1M10 9h1M13 9h1M16 9h1M6 12h1M9 12h1M12 12h1M15 12h1M18 12h1M7 15h10"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></svg>`
  };

  return `<span class="icon ${className}">${icons[name] ?? ''}</span>`;
}

const spritePositions = {
  'day-1.jpg': ['0%', '0%'],
  'day-2.jpg': ['33.333%', '0%'],
  'day-3.jpg': ['66.667%', '0%'],
  'day-4.jpg': ['100%', '0%'],
  'day-5.jpg': ['0%', '100%'],
  'day-6.jpg': ['33.333%', '100%'],
  'mountain-pass.jpg': ['66.667%', '100%'],
  'atlas-harbor.jpg': ['100%', '100%'],
};

function spriteImage(path, className, label = '') {
  if ((path.startsWith('data:image/') || path.startsWith('./assets/scene-'))) return `<span class="sprite-image ${className}" style="background-image:url('${path}');background-size:cover;background-position:center" aria-hidden="true"></span>`;
  const key = path.split('/').pop();
  const [x, y] = spritePositions[key] ?? ['0%', '0%'];
  const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<span class="sprite-image ${className}" ${aria} style="--sprite-x:${x};--sprite-y:${y}"></span>`;
}

function getCurrentDay() {
  return data.days.find((item) => item.id === state.selectedDayId) ?? data.days[0];
}

function getCurrentCharacter() {
  return data.characters.find((item) => item.id === state.selectedCharacterId) ?? data.characters[0];
}

function getCurrentAtlas() {
  return data.atlas.find((item) => item.id === state.selectedAtlasId) ?? data.atlas[0];
}

function tabsMarkup() {
  return `
    <nav class="bookmark-tabs" aria-label="Разделы дневника">
      ${tabs.map((tab) => `
        <button class="bookmark-tab bookmark-tab--${tab.id} ${state.section === tab.id ? 'is-active' : ''}" data-section="${tab.id}" type="button">
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function campaignList() {
  return `
    <section class="campaign-page" aria-label="Игровые дни">
      
      <div class="campaign-heading">
        <div>
          <p class="kicker">Путевой журнал</p>
          <h1>Туманы Вельмора</h1>
          <p class="campaign-meta">Кампания · ${data.days.length} записей</p>
        </div>
        <div class="mountain-mark" aria-hidden="true">
          <svg viewBox="0 0 190 62"><path d="M5 55 40 27l17 13 25-31 24 33 15-18 29 31M19 55h153M42 28l8 27M82 9 91 55M118 25l10 30"/></svg>
        </div>
      </div>

      <div class="day-list">
        ${data.days.map((day) => `
          <button class="day-row ${day.id === state.selectedDayId ? 'is-current' : ''}" data-day="${day.id}" type="button">
            ${spriteImage(day.image, 'day-thumb')}
            <span class="day-copy">
              <span class="day-number">${day.dayLabel}</span>
              <strong>${day.title}</strong>
              <small>${day.shortDate}</small>
            </span>
            ${icon('arrow', 'day-arrow')}
          </button>
        `).join('')}
      </div>

      <button class="add-day" type="button" data-action="new-day" aria-label="Добавить игровой день">
        ${icon('plus')}
        <span>Добавить игровой день</span>
      </button>

      <div class="left-page-footer" aria-hidden="true">
        <span>✦</span><span>✦</span><span>✦</span>
      </div>
    </section>
  `;
}

function chronicleEntry() {
  const day = getCurrentDay();

  return `
    <article class="entry-page ${state.showMarginNote ? '' : 'is-note-hidden'}" aria-label="Запись игрового дня">
      
      

      <button class="entry-back-inline" type="button" data-mobile-back aria-label="Назад к игровым дням">
        ${icon('back')} <span>Игровые дни</span>
      </button>

      <header class="entry-header">
        <div class="entry-title-block">
          <p class="day-label">${day.dayLabel}</p>
          <h2 class="editable-title" contenteditable="true" spellcheck="true" data-edit-title>${day.title}</h2>
          <p class="entry-date">${day.fullDate}</p>
        </div>
      </header>

      <figure class="entry-hero">
        ${spriteImage(day.hero, 'entry-hero-image', day.title)}
        <figcaption>${day.quote}</figcaption>
      </figure>

      <div class="story-toolbar-wrap" id="story-toolbar-anchor">
        <div class="section-title-row">
          <span class="section-title">История</span>
          <span class="section-subtitle" data-save-status>Сохранено</span>
        </div>

        <div class="writing-toolbar" aria-label="Панель редактора">
          ${toolbarActions.map((tool) => `
            <button type="button" data-tool="${tool.id}" class="${state.activeTool === tool.id ? 'is-active' : ''}" aria-label="${tool.label}" aria-pressed="${state.activeTool === tool.id}">${icon(tool.id)}</button>
          `).join('')}
        </div>
      </div>

      <div class="entry-body ${state.showMarginNote ? '' : 'entry-body--compact'}">
        <div class="entry-copy" contenteditable="true" spellcheck="true" data-editable-body aria-label="Текст записи. Нажмите и редактируйте.">
          ${day.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}
        </div>

        ${state.showMarginNote ? `
          <aside class="margin-note">
            ${day.note.map((line) => `<p>${line}</p>`).join('')}
            <svg viewBox="0 0 120 68" aria-hidden="true"><path d="M6 61 30 39l14 10 21-28 15 22 14-12 20 30M19 62h93M72 42l7-22 10 25M29 38l6 23"/></svg>
          </aside>
        ` : ''}
      </div>

      <div class="ink-sketch" aria-hidden="true">
        <svg viewBox="0 0 610 165">
          <path d="M5 149h600M35 149l68-66 37 33 63-94 80 105 40-54 62 76M92 83l25 66M201 22l29 127M320 73l27 76M395 149c18-28 33-34 48-29 12 4 22 19 36 12 13-7 15-29 32-27 19 1 26 27 42 44M432 120l8-44 7 44M455 124l4-31 9 28M502 112l5-40 9 41"/>
          <path d="M122 149c30-12 55-17 80-15M262 148c18-7 38-9 61-7M477 149c25-7 50-5 83-1"/>
        </svg>
        <p>${day.footer}</p>
      </div>
      ${pageNavigation()}
    </article>
  `;
}

function charactersView() {
  return `
    <section class="placeholder-page character-index" aria-label="Список персонажей">
      
      <header class="placeholder-header">
        <p class="kicker">Люди и спутники</p>
        <h1>Персонажи</h1>
        <p>Карточки тех, кого встретил путешественник.</p>
      </header>
      <div class="search-strip">
        ${icon('search')}
        <span>Поиск персонажей...</span>
        <button type="button" aria-label="Добавить персонажа">+</button>
      </div>
      <div class="character-list">
        ${data.characters.map((character) => `
          <button class="character-row ${character.id === state.selectedCharacterId ? 'is-current' : ''}" type="button" data-character="${character.id}">
            ${spriteImage(character.portrait, 'character-thumb')}
            <span>
              <strong>${character.name}</strong>
              <small>${character.meta}</small>
            </span>
            ${icon('arrow')}
          </button>
        `).join('')}
      </div>
      <div class="placeholder-ornament">${icon('feather')}</div>
    </section>
  `;
}

function characterDetail() {
  const character = getCurrentCharacter();

  return `
    <article class="placeholder-page character-card" aria-label="Карточка персонажа">
      
      <p class="kicker">Запись о персонаже</p>
      <h2>${character.name}</h2>
      <p class="entry-date">${character.meta}</p>
      <div class="portrait-frame">${spriteImage(character.portrait, 'portrait-image', character.name)}</div>
      <div class="character-seal">${character.name[0]}</div>
      <h3>Заметки путешественника</h3>
      <p>${character.note}</p>
      <div class="rule-with-mark"><span></span>✦<span></span></div>
      <p class="handwritten">${character.hook}</p>
      ${pageNavigation()}
    </article>
  `;
}

function atlasView() {
  return `
    <section class="placeholder-page atlas-index" aria-label="Список записей атласа">
      
      <header class="placeholder-header">
        <p class="kicker">Места, находки, легенды</p>
        <h1>Атлас</h1>
        <p>Личная энциклопедия мира, собранная по пути.</p>
      </header>
      <div class="atlas-grid">
        ${data.atlas.map((entry) => `
          <button class="atlas-tile ${entry.id === state.selectedAtlasId ? 'is-current' : ''}" type="button" data-atlas="${entry.id}">
            ${spriteImage(entry.image, 'atlas-tile-image')}
            <span class="atlas-type">${entry.subtitle.split('·')[0].trim()}</span>
            <strong>${entry.title}</strong>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function atlasDetail() {
  const entry = getCurrentAtlas();
  return `
    <article class="placeholder-page atlas-card" aria-label="Запись атласа">
      
      <p class="kicker">Запись атласа</p>
      <h2>${entry.title}</h2>
      <p class="entry-date">${entry.subtitle}</p>
      <figure class="atlas-hero">${spriteImage(entry.image, 'atlas-hero-image', entry.title)}</figure>
      <p>${entry.description}</p>
      <div class="tag-row">${entry.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <h3>Связанные записи</h3>
      <div class="linked-notes">${entry.links.map((link) => `<div class="linked-note">${link}</div>`).join('')}</div>
      <p class="handwritten atlas-script">Здесь заканчивается дорога, но начинается другое.</p>
      ${pageNavigation()}
    </article>
  `;
}

function spreadPages() {
  if (state.section === 'characters') {
    return `${charactersView()}${characterDetail()}`;
  }
  if (state.section === 'atlas') {
    return `${atlasView()}${atlasDetail()}`;
  }
  return `${campaignList()}${chronicleEntry()}`;
}

function newDayDialog() {
  if (!state.newDayOpen) return '';
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="new-day-overlay" data-action="close-new-day" role="presentation">
      <form class="new-day-sheet" data-new-day-form>
        <p class="kicker">Новая запись</p>
        <h3>Добавить игровой день</h3>
        <label>
          <span>Название</span>
          <input name="title" type="text" maxlength="90" required placeholder="Например: Дорога к старой крепости" autocomplete="off" />
        </label>
        <label>
          <span>Дата</span>
          <input name="date" type="date" value="${today}" required />
        </label>
        <div class="new-day-actions">
          <button class="sheet-button sheet-button--ghost" type="button" data-action="close-new-day">Отмена</button>
          <button class="sheet-button sheet-button--primary" type="submit">Создать</button>
        </div>
      </form>
    </div>
  `;
}

function render() {
  app.innerHTML = `
    <main class="scene">
      <div class="ambient ambient--left"></div>
      <div class="ambient ambient--right"></div>

      <header class="brand-plaque" aria-label="Путевой дневник">
        ${icon('compass')}
        <div><strong>Путевой дневник</strong><span>Миры. Люди. Истории.</span></div>
      </header>

      <section class="book-shell ${state.mobileDetail ? 'show-detail' : ''}" aria-label="Путевой дневник">
        <div class="book-cover"></div>
        <div class="book-spine" aria-hidden="true"><span></span><span></span><span></span></div>
        ${tabsMarkup()}
        <div class="paper-stack paper-stack--left"></div>
        <div class="paper-stack paper-stack--right"></div>
        <div class="book-spread">
          ${spreadPages()}
          <div class="gutter" aria-hidden="true"></div>
        </div>
      </section>

      ${newDayDialog()}

      <footer class="scene-caption">
        <span class="device-marks">▱ ▯</span>
        <span><strong>Один мир. Везде с тобой.</strong><small>Настольные истории в цифровом дневнике</small></span>
      </footer>
    </main>
  `;

  document.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => {
      state.section = button.dataset.section;
      state.mobileDetail = false;
      render();
    });
  });

  document.querySelectorAll('[data-day]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDayId = Number(button.dataset.day);
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      render();
    });
  });

  document.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCharacterId = button.dataset.character;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      render();
    });
  });

  document.querySelectorAll('[data-atlas]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedAtlasId = button.dataset.atlas;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      render();
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const action = button.dataset.action;
      if (action === 'close-new-day') {
        if (button.classList.contains('new-day-overlay') && event.target !== button) return;
        state.newDayOpen = false;
        render();
      }
    });
  });

  document.querySelector('[data-new-day-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const rawDate = String(formData.get('date') || '');
    if (!title || !rawDate) return;

    const formatted = formatDayDate(rawDate);
    const nextId = data.days.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const newDay = {
      id: nextId,
      dayLabel: `Игровой день ${data.days.length + 1}`,
      title,
      shortDate: formatted.short,
      fullDate: formatted.full,
      image: './assets/scene-0.jpg',
      hero: './assets/scene-1.jpg',
      quote: '«Новая дорога начинается с первой записи»',
      body: ['Начните писать историю этого игрового дня...'],
      note: ['Заметка на полях'],
      footer: 'Продолжение следует.'
    };
    data.days.push(newDay);
    persistDays();
    state.selectedDayId = nextId;
    state.newDayOpen = false;
    state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
    render();
  });

  document.querySelector('[data-edit-title]')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  });

  document.querySelector('[data-edit-title]')?.addEventListener('input', (event) => {
    const day = getCurrentDay();
    const title = event.currentTarget.textContent.replace(/\s+/g, ' ').trimStart();
    if (title) day.title = title.slice(0, 90);
    setSaveStatus('Сохранение...');
    window.clearTimeout(window.__journalSaveTimer);
    window.__journalSaveTimer = window.setTimeout(() => {
      persistDays();
      setSaveStatus('Сохранено');
    }, 450);
  });

  document.querySelector('[data-editable-body]')?.addEventListener('input', (event) => {
    const day = getCurrentDay();
    const paragraphs = [...event.currentTarget.querySelectorAll('p')]
      .map((node) => node.textContent.trim())
      .filter(Boolean);
    const plainText = event.currentTarget.innerText.trim();
    day.body = paragraphs.length ? paragraphs : (plainText ? plainText.split(/\n+/).filter(Boolean) : ['']);
    setSaveStatus('Сохранение...');
    window.clearTimeout(window.__journalSaveTimer);
    window.__journalSaveTimer = window.setTimeout(() => {
      persistDays();
      setSaveStatus('Сохранено');
    }, 450);
  });

  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      state.activeTool = tool;
      const editor = document.querySelector('[data-editable-body]');
      if (tool === 'plus' && editor) {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        editor.append(paragraph);
        paragraph.focus();
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (tool === 'undo') {
        document.execCommand('undo');
      } else if (tool === 'comment') {
        state.showMarginNote = !state.showMarginNote;
        render();
      } else if (editor) {
        editor.focus();
      }
    });
  });

  document.querySelector('[data-mobile-back]')?.addEventListener('click', () => {
    state.mobileDetail = false;
    render();
  });
}

render();


(() => {
  const storageKey = 'traveler-journal-days-v3';
  const legacyStorageKeys = ['traveler-journal-days-v2'];
  let saveTimer = null;

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data.days));
    } catch (error) {
      console.warn('Не удалось сохранить дневник', error);
    }
  }

  function restore() {
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw) {
        for (const key of legacyStorageKeys) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      const saved = JSON.parse(raw || 'null');
      if (Array.isArray(saved) && saved.length) {
        data.days.splice(0, data.days.length, ...saved);
      }
    } catch (error) {
      console.warn('Не удалось восстановить дневник', error);
    }
  }

  function saveSoon() {
    const status = document.querySelector('.section-subtitle');
    if (status) status.textContent = 'Сохранение...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      persist();
      const current = document.querySelector('.section-subtitle');
      if (current) current.textContent = 'Сохранено';
    }, 400);
  }

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return {
      short: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date).replace(' г.', ''),
      full: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date).replace(' г.', ''),
    };
  }

  function dateToInput() {
    const day = currentDay();
    if (day.dateISO) return day.dateISO;
    const match = String(day.fullDate || '').match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
    const months = { января:0, февраля:1, марта:2, апреля:3, мая:4, июня:5, июля:6, августа:7, сентября:8, октября:9, ноября:10, декабря:11 };
    if (match && months[match[2].toLowerCase()] !== undefined) {
      return new Date(Number(match[3]), months[match[2].toLowerCase()], Number(match[1]), 12).toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  }

  function currentDay() {
    return data.days.find((item) => Number(item.id) === Number(state.selectedDayId)) || data.days[0];
  }


  function sanitizeRichHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'UL', 'OL', 'LI']);

    const cleanNode = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed.has(child.tagName)) {
            const fragment = document.createDocumentFragment();
            while (child.firstChild) fragment.append(child.firstChild);
            child.replaceWith(fragment);
            cleanNode(node);
            return;
          }
          [...child.attributes].forEach((attribute) => child.removeAttribute(attribute.name));
          cleanNode(child);
        }
      });
    };

    cleanNode(template.content);
    return template.innerHTML;
  }

  function storeEditorContent(editor) {
    const day = currentDay();
    day.bodyHtml = sanitizeRichHtml(editor.innerHTML);
    const plainParagraphs = [...editor.querySelectorAll(':scope > p')]
      .map((node) => node.textContent.trim())
      .filter(Boolean);
    if (plainParagraphs.length) day.body = plainParagraphs;
    saveSoon();
  }

  function applyEditorCommand(editor, command) {
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, null);
    storeEditorContent(editor);
  }

  function toolbarMarkup() {
    return `
      <button type="button" data-stage2-tool="plus" aria-label="Новый абзац" title="Новый абзац">${icon('plus')}</button>
      <button type="button" data-stage2-tool="bold" aria-label="Жирный" title="Жирный"><span class="stage2-tool-glyph stage2-tool-glyph--bold">B</span></button>
      <button type="button" data-stage2-tool="dash-list" aria-label="Список с тире" title="Список с тире"><span class="stage2-list-glyph"><i>—</i><i>—</i><i>—</i></span></button>
      <button type="button" data-stage2-tool="number-list" aria-label="Нумерованный список" title="Нумерованный список"><span class="stage2-number-glyph"><i>1.</i><i>2.</i><i>3.</i></span></button>
      <button type="button" data-stage2-tool="image" aria-label="Обои игрового дня" title="Обои игрового дня">${icon('image')}</button>
      <button type="button" data-stage2-tool="undo" aria-label="Отменить" title="Отменить">${icon('undo')}</button>
      <button type="button" data-stage2-tool="comment" aria-label="Заметка на полях" title="Заметка на полях">${icon('comment')}</button>
    `;
  }

  function createDialogShell(innerHTML) {
    document.querySelector('.stage2-new-day-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'stage2-new-day-overlay';
    overlay.innerHTML = innerHTML;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) overlay.remove();
    });
    overlay.querySelector('[data-cancel]')?.addEventListener('click', () => overlay.remove());
    return overlay;
  }

  function openNewDayDialog() {
    const today = new Date().toISOString().slice(0, 10);
    const overlay = createDialogShell(`
      <form class="stage2-new-day-sheet">
        <p class="kicker">Новая запись</p>
        <h3>Добавить игровой день</h3>
        <label><span>Название</span><input name="title" required maxlength="90" autocomplete="off" placeholder="Например: Дорога к старой крепости"></label>
        <label><span>Дата</span><input name="date" type="date" required value="${today}"></label>
        <div class="stage2-sheet-actions">
          <button type="button" class="stage2-sheet-button stage2-sheet-button--ghost" data-cancel>Отмена</button>
          <button type="submit" class="stage2-sheet-button stage2-sheet-button--primary">Создать</button>
        </div>
      </form>`);

    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const dateValue = String(formData.get('date') || '');
      if (!title || !dateValue) return;
      const formatted = formatDate(dateValue);
      const nextId = data.days.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      data.days.push({
        id: nextId,
        dayLabel: `Игровой день ${data.days.length + 1}`,
        title,
        shortDate: formatted.short,
        fullDate: formatted.full,
        dateISO: dateValue,
        image: './assets/scene-0.jpg',
        hero: './assets/scene-1.jpg',
        quote: '«Новая дорога начинается с первой записи»',
        body: ['Начните писать историю этого игрового дня...'],
        note: ['Заметка на полях'],
        footer: 'Продолжение следует.'
      });
      persist();
      state.selectedDayId = nextId;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      overlay.remove();
      render();
    });
    requestAnimationFrame(() => overlay.querySelector('input[name="title"]')?.focus());
  }

  function openEditDayDialog() {
    const day = currentDay();
    const overlay = createDialogShell(`
      <form class="stage2-new-day-sheet stage2-edit-day-sheet">
        <p class="kicker">Игровой день</p>
        <h3>Настройки записи</h3>
        <label><span>Название</span><input name="title" required maxlength="90" autocomplete="off" value="${escapeAttribute(day.title)}"></label>
        <label><span>Дата</span><input name="date" type="date" required value="${dateToInput()}"></label>
        <div class="stage2-danger-zone">
          <button type="button" class="stage2-delete-day" data-delete-day>Удалить игровой день</button>
        </div>
        <div class="stage2-sheet-actions">
          <button type="button" class="stage2-sheet-button stage2-sheet-button--ghost" data-cancel>Отмена</button>
          <button type="submit" class="stage2-sheet-button stage2-sheet-button--primary">Сохранить</button>
        </div>
      </form>`);

    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const dateValue = String(formData.get('date') || '');
      if (!title || !dateValue) return;
      const formatted = formatDate(dateValue);
      day.title = title;
      day.shortDate = formatted.short;
      day.fullDate = formatted.full;
      day.dateISO = dateValue;
      persist();
      overlay.remove();
      render();
    });

    overlay.querySelector('[data-delete-day]').addEventListener('click', () => {
      if (data.days.length <= 1) {
        alert('В журнале должен остаться хотя бы один игровой день.');
        return;
      }
      if (!confirm(`Удалить «${day.title}»? Это действие нельзя отменить.`)) return;
      const index = data.days.findIndex((item) => Number(item.id) === Number(day.id));
      data.days.splice(index, 1);
      data.days.forEach((item, itemIndex) => { item.dayLabel = `Игровой день ${itemIndex + 1}`; });
      const fallback = data.days[Math.max(0, Math.min(index, data.days.length - 1))];
      state.selectedDayId = fallback.id;
      state.mobileDetail = false;
      persist();
      overlay.remove();
      render();
    });
  }

  function escapeAttribute(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  async function compressImage(file) {
    const source = await fileToDataUrl(file);
    const image = await loadImage(source);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function chooseWallpaper() {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/*';
    picker.hidden = true;
    document.body.append(picker);
    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];
      if (!file) {
        picker.remove();
        return;
      }
      try {
        const wallpaper = await compressImage(file);
        currentDay().wallpaperDataUrl = wallpaper;
        persist();
        render();
      } catch (error) {
        console.warn('Не удалось установить изображение', error);
        alert('Не удалось обработать изображение. Попробуйте другой файл.');
      } finally {
        picker.remove();
      }
    }, { once: true });
    picker.click();
  }

  function applyCustomWallpapers() {
    data.days.forEach((day) => {
      if (!day.wallpaperDataUrl) return;
      const row = document.querySelector(`[data-day="${day.id}"] .day-thumb`);
      if (row) {
        row.style.backgroundImage = `url("${day.wallpaperDataUrl}")`;
        row.style.backgroundSize = 'cover';
        row.style.backgroundPosition = 'center';
      }
    });
    const hero = document.querySelector('.entry-hero-image');
    const day = currentDay();
    if (hero && day.wallpaperDataUrl) {
      hero.style.backgroundImage = `url("${day.wallpaperDataUrl}")`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    }
  }

  function enhanceChronicle() {
    document.querySelector('.entry-actions')?.remove();
    document.querySelector('.entry-menu')?.remove();
    document.querySelector('.mobile-back')?.remove();

    const entry = document.querySelector('.entry-page');
    if (!entry) {
      applyCustomWallpapers();
      return;
    }

    const header = entry.querySelector('.entry-header');
    if (state.mobileDetail && header && !entry.querySelector('.stage2-inline-back')) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'stage2-inline-back';
      back.innerHTML = '<span aria-hidden="true">‹</span><span>Игровые дни</span>';
      back.addEventListener('click', () => {
        state.mobileDetail = false;
        render();
      });
      entry.insertBefore(back, header);
    }

    if (header && !header.querySelector('.stage2-edit-day')) {
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'stage2-edit-day';
      edit.textContent = 'Править';
      edit.addEventListener('click', openEditDayDialog);
      header.append(edit);
    }

    const title = entry.querySelector('.entry-header h2');
    if (title && !title.dataset.stage2Editable) {
      title.dataset.stage2Editable = '1';
      title.contentEditable = 'true';
      title.spellcheck = true;
      title.classList.add('stage2-editable-title');
      title.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          title.blur();
        }
      });
      title.addEventListener('input', () => {
        const value = title.textContent.replace(/\s+/g, ' ').trimStart();
        if (value) currentDay().title = value.slice(0, 90);
        saveSoon();
      });
    }

    const editor = entry.querySelector('.entry-copy');
    if (editor && !editor.dataset.stage2Editable) {
      editor.dataset.stage2Editable = '1';
      const day = currentDay();
      if (day.bodyHtml) editor.innerHTML = sanitizeRichHtml(day.bodyHtml);
      editor.contentEditable = 'true';
      editor.spellcheck = true;
      editor.setAttribute('aria-label', 'Редактируемый текст игрового дня');
      editor.addEventListener('input', () => storeEditorContent(editor));
      editor.addEventListener('paste', () => requestAnimationFrame(() => {
        editor.innerHTML = sanitizeRichHtml(editor.innerHTML);
        storeEditorContent(editor);
      }));
    }

    const note = entry.querySelector('.margin-note');
    if (note && !note.dataset.stage2Editable) {
      note.dataset.stage2Editable = '1';
      note.contentEditable = 'true';
      note.spellcheck = true;
      note.setAttribute('aria-label', 'Редактируемая заметка на полях');
      note.addEventListener('input', () => {
        const lines = [...note.querySelectorAll('p')].map((node) => node.textContent.trim()).filter(Boolean);
        if (lines.length) currentDay().note = lines;
        saveSoon();
      });
    }

    const toolbar = entry.querySelector('.writing-toolbar');
    if (toolbar && !toolbar.dataset.stage2Toolbar) {
      toolbar.dataset.stage2Toolbar = '1';
      toolbar.innerHTML = toolbarMarkup();

      toolbar.querySelectorAll('[data-stage2-tool]').forEach((button) => {
        button.addEventListener('click', () => {
          const tool = button.dataset.stage2Tool;
          const editArea = entry.querySelector('.entry-copy');

          if (tool === 'plus' && editArea) {
            editArea.focus();
            document.execCommand('insertParagraph', false, null);
            storeEditorContent(editArea);
          } else if (tool === 'bold') {
            applyEditorCommand(editArea, 'bold');
          } else if (tool === 'dash-list') {
            applyEditorCommand(editArea, 'insertUnorderedList');
          } else if (tool === 'number-list') {
            applyEditorCommand(editArea, 'insertOrderedList');
          } else if (tool === 'undo') {
            applyEditorCommand(editArea, 'undo');
          } else if (tool === 'comment') {
            const marginNote = entry.querySelector('.margin-note');
            if (marginNote) {
              marginNote.hidden = !marginNote.hidden;
              if (!marginNote.hidden) marginNote.focus();
            }
          } else if (tool === 'image') {
            chooseWallpaper();
          }
        });
      });
    }

    applyCustomWallpapers();
  }

  function enhanceList() {
    const addButton = document.querySelector('.add-day');
    if (addButton && !addButton.dataset.stage2Bound) {
      addButton.dataset.stage2Bound = '1';
      addButton.addEventListener('click', openNewDayDialog);
    }
    applyCustomWallpapers();
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      enhanceChronicle();
      enhanceList();
    });
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList: true });
  restore();
  render();
  enhance();
})();


(() => {
  const STORAGE_KEY = 'traveler-journal-characters-v1';
  let saveTimer = null;

  function persistCharacters() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.characters));
    } catch (error) {
      console.warn('Не удалось сохранить персонажей', error);
    }
  }

  function restoreCharacters() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        data.characters.splice(0, data.characters.length, ...saved);
      }
    } catch (error) {
      console.warn('Не удалось восстановить персонажей', error);
    }
  }

  function currentCharacter() {
    return data.characters.find((item) => item.id === state.selectedCharacterId) || data.characters[0];
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistCharacters, 350);
  }

  function closeDialog() {
    document.querySelector('.stage3-character-overlay')?.remove();
  }

  function characterForm(character = null) {
    const isEdit = Boolean(character);
    const metaParts = character?.meta?.split('·').map((item) => item.trim()) || [];
    const race = metaParts[0] || '';
    const role = metaParts.slice(1).join(' · ') || '';

    const overlay = document.createElement('div');
    overlay.className = 'stage3-character-overlay';
    overlay.innerHTML = `
      <form class="stage3-character-sheet">
        <p class="kicker">${isEdit ? 'Карточка персонажа' : 'Новая запись'}</p>
        <h3>${isEdit ? 'Редактировать персонажа' : 'Добавить персонажа'}</h3>
        <label><span>Имя</span><input name="name" required maxlength="70" autocomplete="off" value="${escapeHtml(character?.name || '')}" placeholder="Например: Эдрик"></label>
        <div class="stage3-character-fields">
          <label><span>Раса</span><input name="race" maxlength="50" value="${escapeHtml(race)}" placeholder="Человек"></label>
          <label><span>Класс / роль</span><input name="role" maxlength="60" value="${escapeHtml(role)}" placeholder="Следопыт"></label>
        </div>
        <label><span>Заметка</span><textarea name="note" rows="4" maxlength="1200" placeholder="Кто это и почему его стоит запомнить">${escapeHtml(character?.note || '')}</textarea></label>
        <label><span>Короткая пометка</span><input name="hook" maxlength="180" value="${escapeHtml(character?.hook || '')}" placeholder="Что спросить при следующей встрече"></label>
        ${isEdit ? '<div class="stage3-danger-zone"><button type="button" class="stage3-delete-character" data-delete-character>Удалить персонажа</button></div>' : ''}
        <div class="stage3-sheet-actions">
          <button type="button" class="stage3-sheet-button stage3-sheet-button--ghost" data-cancel-character>Отмена</button>
          <button type="submit" class="stage3-sheet-button stage3-sheet-button--primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
        </div>
      </form>`;

    document.body.append(overlay);
    overlay.querySelector('[data-cancel-character]').addEventListener('click', closeDialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeDialog();
    });

    overlay.querySelector('[data-delete-character]')?.addEventListener('click', () => {
      if (data.characters.length <= 1) {
        alert('Нельзя удалить последнего персонажа. Сначала создайте другого.');
        return;
      }
      if (!confirm(`Удалить персонажа «${character.name}»?`)) return;
      const index = data.characters.findIndex((item) => item.id === character.id);
      if (index >= 0) data.characters.splice(index, 1);
      state.selectedCharacterId = data.characters[0].id;
      state.mobileDetail = false;
      persistCharacters();
      closeDialog();
      render();
    });

    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get('name') || '').trim();
      const raceValue = String(formData.get('race') || '').trim();
      const roleValue = String(formData.get('role') || '').trim();
      const noteValue = String(formData.get('note') || '').trim();
      const hookValue = String(formData.get('hook') || '').trim();
      if (!name) return;

      const meta = [raceValue, roleValue].filter(Boolean).join(' · ') || 'Без описания';

      if (character) {
        character.name = name;
        character.meta = meta;
        character.note = noteValue || 'Добавьте заметки путешественника.';
        character.hook = hookValue || 'Добавьте короткую пометку.';
      } else {
        const created = {
          id: `character-${Date.now()}`,
          name,
          meta,
          portrait: './assets/scene-2.jpg',
          note: noteValue || 'Добавьте заметки путешественника.',
          hook: hookValue || 'Добавьте короткую пометку.'
        };
        data.characters.push(created);
        state.selectedCharacterId = created.id;
        state.section = 'characters';
        state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      }

      persistCharacters();
      closeDialog();
      render();
    });

    requestAnimationFrame(() => overlay.querySelector('input[name="name"]')?.focus());
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function enhanceCharacterList() {
    if (state.section !== 'characters') return;
    const addButton = document.querySelector('.character-index .search-strip button');
    if (addButton && !addButton.dataset.stage3Bound) {
      addButton.dataset.stage3Bound = '1';
      addButton.title = 'Добавить персонажа';
      addButton.addEventListener('click', () => characterForm());
    }
  }

  function enhanceCharacterDetail() {
    if (state.section !== 'characters') return;
    const card = document.querySelector('.character-card');
    if (!card) return;
    const character = currentCharacter();
    if (!character) return;

    if (!card.querySelector('.stage3-edit-character')) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'stage3-edit-character';
      editButton.textContent = 'Править';
      editButton.addEventListener('click', () => characterForm(character));
      card.append(editButton);
    }

    const noteHeading = [...card.querySelectorAll('h3')].find((node) => node.textContent.includes('Заметки'));
    const note = noteHeading?.nextElementSibling;
    if (note && !note.dataset.stage3Editable) {
      note.dataset.stage3Editable = '1';
      note.contentEditable = 'true';
      note.spellcheck = true;
      note.classList.add('stage3-editable-character-note');
      note.setAttribute('aria-label', 'Редактируемые заметки о персонаже');
      note.addEventListener('input', () => {
        character.note = note.innerText.trim();
        saveSoon();
      });
    }

    const hook = card.querySelector('.handwritten');
    if (hook && !hook.dataset.stage3Editable) {
      hook.dataset.stage3Editable = '1';
      hook.contentEditable = 'true';
      hook.spellcheck = true;
      hook.classList.add('stage3-editable-character-hook');
      hook.setAttribute('aria-label', 'Редактируемая короткая пометка');
      hook.addEventListener('input', () => {
        character.hook = hook.innerText.trim();
        saveSoon();
      });
    }
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      enhanceCharacterList();
      enhanceCharacterDetail();
    });
  }

  restoreCharacters();
  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList: true });
  render();
  enhance();
})();


(() => {
  const STORAGE_KEY = 'traveler-journal-atlas-v1';
  let saveTimer = null;

  function persistAtlas() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.atlas));
    } catch (error) {
      console.warn('Не удалось сохранить атлас', error);
    }
  }

  function restoreAtlas() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        data.atlas.splice(0, data.atlas.length, ...saved);
      }
    } catch (error) {
      console.warn('Не удалось восстановить атлас', error);
    }
  }

  function currentAtlas() {
    return data.atlas.find((item) => item.id === state.selectedAtlasId) || data.atlas[0];
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistAtlas, 350);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function closeDialog() {
    document.querySelector('.stage4-atlas-overlay')?.remove();
  }

  function atlasForm(entry = null) {
    const isEdit = Boolean(entry);
    const subtitleParts = String(entry?.subtitle || '').split('·').map((part) => part.trim()).filter(Boolean);
    const kind = subtitleParts[0] || 'Место';
    const context = subtitleParts.slice(1).join(' · ');
    const tags = Array.isArray(entry?.tags) ? entry.tags.join(', ') : '';

    const overlay = document.createElement('div');
    overlay.className = 'stage4-atlas-overlay';
    overlay.innerHTML = `
      <form class="stage4-atlas-sheet">
        <p class="kicker">${isEdit ? 'Страница атласа' : 'Новая запись'}</p>
        <h3>${isEdit ? 'Редактировать запись' : 'Добавить в атлас'}</h3>
        <label><span>Название</span><input name="title" required maxlength="80" value="${escapeHtml(entry?.title || '')}" placeholder="Например: Чёрная Гавань"></label>
        <div class="stage4-atlas-fields">
          <label><span>Тип</span>
            <select name="kind">
              ${['Место','Организация','Предмет','Существо','Легенда','Другое'].map((item) => `<option${item === kind ? ' selected' : ''}>${item}</option>`).join('')}
            </select>
          </label>
          <label><span>Уточнение</span><input name="context" maxlength="80" value="${escapeHtml(context)}" placeholder="Город, фракция, артефакт"></label>
        </div>
        <label><span>Описание</span><textarea name="description" rows="6" maxlength="2400" placeholder="Что путешественник знает об этом месте, предмете или существе">${escapeHtml(entry?.description || '')}</textarea></label>
        <label><span>Метки через запятую</span><input name="tags" maxlength="180" value="${escapeHtml(tags)}" placeholder="опасность, торговля, тайна"></label>
        ${isEdit ? '<div class="stage4-danger-zone"><button type="button" class="stage4-delete-atlas" data-delete-atlas>Удалить запись</button></div>' : ''}
        <div class="stage4-sheet-actions">
          <button type="button" class="stage4-sheet-button stage4-sheet-button--ghost" data-cancel-atlas>Отмена</button>
          <button type="submit" class="stage4-sheet-button stage4-sheet-button--primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
        </div>
      </form>`;

    document.body.append(overlay);
    overlay.querySelector('[data-cancel-atlas]').addEventListener('click', closeDialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeDialog();
    });

    overlay.querySelector('[data-delete-atlas]')?.addEventListener('click', () => {
      if (data.atlas.length <= 1) {
        alert('В атласе должна остаться хотя бы одна запись.');
        return;
      }
      if (!confirm(`Удалить «${entry.title}» из атласа?`)) return;
      const index = data.atlas.findIndex((item) => item.id === entry.id);
      if (index >= 0) data.atlas.splice(index, 1);
      const fallback = data.atlas[Math.max(0, Math.min(index, data.atlas.length - 1))] || data.atlas[0];
      state.selectedAtlasId = fallback.id;
      state.mobileDetail = false;
      persistAtlas();
      closeDialog();
      render();
    });

    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const kindValue = String(formData.get('kind') || 'Другое').trim();
      const contextValue = String(formData.get('context') || '').trim();
      const description = String(formData.get('description') || '').trim();
      const tagValues = String(formData.get('tags') || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8);
      if (!title) return;

      const subtitle = [kindValue, contextValue].filter(Boolean).join(' · ');
      if (entry) {
        entry.title = title;
        entry.subtitle = subtitle;
        entry.description = description || 'Добавьте описание этой записи.';
        entry.tags = tagValues;
      } else {
        const created = {
          id: `atlas-${Date.now()}`,
          title,
          subtitle,
          image: './assets/scene-7.jpg',
          description: description || 'Добавьте описание этой записи.',
          tags: tagValues,
          links: []
        };
        data.atlas.push(created);
        state.selectedAtlasId = created.id;
        state.section = 'atlas';
        state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      }

      persistAtlas();
      closeDialog();
      render();
    });

    requestAnimationFrame(() => overlay.querySelector('input[name="title"]')?.focus());
  }

  function enhanceAtlasIndex() {
    if (state.section !== 'atlas') return;
    const page = document.querySelector('.atlas-index');
    if (!page) return;

    if (!page.querySelector('.stage4-add-atlas')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stage4-add-atlas';
      button.innerHTML = '<span aria-hidden="true">+</span><span>Добавить запись</span>';
      button.addEventListener('click', () => atlasForm());
      const header = page.querySelector('.placeholder-header');
      header?.insertAdjacentElement('afterend', button);
    }
  }

  function enhanceAtlasDetail() {
    if (state.section !== 'atlas') return;
    const card = document.querySelector('.atlas-card');
    if (!card) return;
    const entry = currentAtlas();
    if (!entry) return;

    if (state.mobileDetail && !card.querySelector('.stage4-inline-back')) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'stage4-inline-back';
      back.innerHTML = '<span aria-hidden="true">‹</span><span>Атлас</span>';
      back.addEventListener('click', () => {
        state.mobileDetail = false;
        render();
      });
      card.insertBefore(back, card.firstElementChild?.nextElementSibling || card.firstChild);
    }

    if (!card.querySelector('.stage4-edit-atlas')) {
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'stage4-edit-atlas';
      edit.textContent = 'Править';
      edit.addEventListener('click', () => atlasForm(entry));
      card.append(edit);
    }

    const description = [...card.querySelectorAll('p')].find((node) => node.textContent.trim() === String(entry.description || '').trim());
    if (description && !description.dataset.stage4Editable) {
      description.dataset.stage4Editable = '1';
      description.contentEditable = 'true';
      description.spellcheck = true;
      description.classList.add('stage4-editable-atlas-description');
      description.setAttribute('aria-label', 'Редактируемое описание записи атласа');
      description.addEventListener('input', () => {
        entry.description = description.innerText.trim();
        saveSoon();
      });
    }
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      enhanceAtlasIndex();
      enhanceAtlasDetail();
    });
  }

  restoreAtlas();
  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList: true });
  render();
  enhance();
})();


(() => {
  const sketches = {
    compass: '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="28"/><path d="M60 20v14M60 86v14M20 60h14M86 60h14M72 48 64 64 48 72l8-16 16-8Z"/><path d="M60 8c21 0 40 18 40 40s-19 44-40 44-40-23-40-44S39 8 60 8Z"/></svg>',
    mountains: '<svg viewBox="0 0 180 90" aria-hidden="true"><path d="M8 74h164M20 74 50 34l18 22 23-38 24 32 16-18 27 42M54 39l9 35M92 18l11 56M132 34l7 40"/></svg>',
    tower: '<svg viewBox="0 0 120 140" aria-hidden="true"><path d="M28 124h64M38 124V56l22-18 22 18v68M47 56V28h26v28M52 83h16M52 98h16"/></svg>',
    ruins: '<svg viewBox="0 0 150 110" aria-hidden="true"><path d="M14 90h124M28 90V46l16-14v14l19-12v56M83 90V40l18 10 16-18v58M57 90l10-18M110 52l10-10"/></svg>',
    bridge: '<svg viewBox="0 0 180 95" aria-hidden="true"><path d="M14 68h152M30 68c10-18 28-27 58-27 31 0 49 9 62 27M48 68V52M67 68V46M89 68V43M111 68V46M132 68V54"/></svg>',
    tavern: '<svg viewBox="0 0 160 115" aria-hidden="true"><path d="M18 90h124M30 90V46l20-18 18 18v44M86 90V38h44v52M39 58h20M106 55h24M46 90V70M116 90V69"/></svg>',
    campfire: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M34 98 58 62l18 22c8-8 13-19 13-31 0-8-2-14-6-22-3 8-9 16-16 22 0-11-4-20-13-31-2 8-5 13-11 20-6 8-9 15-9 23 0 10 4 20 11 27"/><path d="M28 104 50 88M44 106l14-14M58 106l16-16M70 104l16-16"/></svg>',
    pines: '<svg viewBox="0 0 150 115" aria-hidden="true"><path d="M12 97h126M34 97V74M76 97V66M114 97V78M20 75l14-24 14 24M57 67l19-32 20 32M101 78l13-22 12 22"/></svg>',
    moon: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M70 16c-22 6-38 27-38 51 0 23 16 42 38 47-7 3-14 4-22 4-31 0-56-24-56-56S17 6 48 6c8 0 15 1 22 4Z"/><path d="M75 36h10M98 52h10M83 20h5M86 74h10"/></svg>',
    ship: '<svg viewBox="0 0 180 110" aria-hidden="true"><path d="M18 86h142M48 84 69 44h30l21 40M84 18v58M84 18c22 4 41 19 52 34-26-1-43-7-52-14M84 30c-16 7-27 18-38 31 14 0 26-5 38-12"/></svg>',
    sword: '<svg viewBox="0 0 120 140" aria-hidden="true"><path d="M60 18v72M49 30l11-12 11 12M43 98h34M50 98v11l10 8 10-8V98M56 117v14M64 117v14"/></svg>',
    potion: '<svg viewBox="0 0 100 130" aria-hidden="true"><path d="M38 12h24M44 12v18l-22 30a29 29 0 0 0 23 46h10a29 29 0 0 0 23-46L56 30V12"/><path d="M32 72c9 3 17 2 24-2 6-3 12-4 18-1"/></svg>',
    dragon: '<svg viewBox="0 0 170 120" aria-hidden="true"><path d="M18 90c10-27 26-43 50-47 12-2 22 1 30 8l9-15 20 4-11 13c13 6 22 18 28 35-11-4-20-4-31-1-10 2-17 7-24 14-6-13-17-20-34-21l-13 10-8-10c-8-1-16 2-26 10Z"/><path d="M88 52l12 12M102 31l10 5"/></svg>',
    route: '<svg viewBox="0 0 180 90" aria-hidden="true"><path d="M12 70c23-21 48-27 73-18 22 8 34-2 44-16 9-14 18-20 39-20"/><path d="M24 60c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7Zm120-52 18 1-6 16" stroke-dasharray="5 5"/></svg>',
    signpost: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M58 16v88M58 38h40l10-10-10-10H58M58 64H24l-10-10 10-10h34"/><path d="M49 104h18"/></svg>'
  };

  const chronicleThemes = [
    ['mountains', 'compass', 'route'],
    ['tavern', 'bridge', 'campfire'],
    ['tower', 'ruins', 'route'],
    ['pines', 'moon', 'dragon'],
    ['potion', 'sword', 'compass'],
    ['ship', 'route', 'moon']
  ];

  const characterMotifs = ['sword', 'compass', 'potion', 'moon', 'dragon'];
  const atlasMotifs = ['route', 'ship', 'compass', 'signpost'];

  function makeSketch(name, className) {
    const markup = sketches[name];
    if (!markup) return null;
    const item = document.createElement('span');
    item.className = `stage5-sketch ${className}`;
    item.innerHTML = markup;
    return item;
  }

  function ensureLayer(host) {
    if (!host) return null;
    let layer = host.querySelector(':scope > .stage5-sketch-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'stage5-sketch-layer';
      host.append(layer);
    }
    return layer;
  }

  function decorateCampaign() {
    const page = document.querySelector('.campaign-page');
    if (!page) return;
    const layer = ensureLayer(page);
    if (!layer || layer.dataset.stage5Campaign === '1') return;
    layer.dataset.stage5Campaign = '1';
    layer.append(
      makeSketch('compass', 'stage5-sketch--campaign-compass stage5-sketch--soft'),
      makeSketch('route', 'stage5-sketch--campaign-route stage5-sketch--soft'),
      makeSketch('moon', 'stage5-sketch--campaign-moon stage5-sketch--soft')
    );
  }

  function decorateChronicle() {
    const page = document.querySelector('.entry-page');
    if (!page) return;
    const layer = ensureLayer(page);
    if (!layer) return;
    const dayIndex = Math.max(0, (Number(state.selectedDayId) || 1) - 1) % chronicleThemes.length;
    const decorationKey = String(dayIndex);
    if (layer.dataset.stage5Chronicle === decorationKey) return;
    layer.dataset.stage5Chronicle = decorationKey;
    layer.innerHTML = '';
    const [hero, note, footer] = chronicleThemes[dayIndex];
    [
      makeSketch(hero, 'stage5-sketch--entry-hero stage5-sketch--soft'),
      makeSketch(note, 'stage5-sketch--entry-note stage5-sketch--soft'),
      makeSketch(footer, 'stage5-sketch--entry-footer stage5-sketch--strong')
    ].forEach((node) => node && layer.append(node));
  }

  function decorateCharacters() {
    const indexPage = document.querySelector('.character-index');
    const card = document.querySelector('.character-card');
    if (indexPage) {
      const layer = ensureLayer(indexPage);
      if (layer && !layer.dataset.stage5Index) {
        layer.dataset.stage5Index = '1';
        layer.append(makeSketch('signpost', 'stage5-sketch--characters-index stage5-sketch--soft'));
      }
    }
    if (!card) return;
    const layer = ensureLayer(card);
    if (!layer) return;
    const index = Math.max(0, data.characters.findIndex((item) => item.id === state.selectedCharacterId));
    const decorationKey = String(index);
    if (layer.dataset.stage5Character === decorationKey) return;
    layer.dataset.stage5Character = decorationKey;
    layer.innerHTML = '';
    layer.append(
      makeSketch(characterMotifs[index % characterMotifs.length], 'stage5-sketch--character-crest stage5-sketch--soft'),
      makeSketch('route', 'stage5-sketch--character-footer stage5-sketch--soft')
    );
  }

  function decorateAtlas() {
    const indexPage = document.querySelector('.atlas-index');
    const card = document.querySelector('.atlas-card');
    if (indexPage) {
      const layer = ensureLayer(indexPage);
      if (layer && !layer.dataset.stage5Index) {
        layer.dataset.stage5Index = '1';
        layer.append(makeSketch('compass', 'stage5-sketch--atlas-index stage5-sketch--soft'));
      }
    }
    if (!card) return;
    const layer = ensureLayer(card);
    if (!layer) return;
    const index = Math.max(0, data.atlas.findIndex((item) => item.id === state.selectedAtlasId));
    const decorationKey = String(index);
    if (layer.dataset.stage5Atlas === decorationKey) return;
    layer.dataset.stage5Atlas = decorationKey;
    layer.innerHTML = '';
    layer.append(
      makeSketch(atlasMotifs[index % atlasMotifs.length], 'stage5-sketch--atlas-map stage5-sketch--soft'),
      makeSketch('pines', 'stage5-sketch--atlas-footer stage5-sketch--soft')
    );
  }

  function enhance() {
    decorateCampaign();
    decorateChronicle();
    decorateCharacters();
    decorateAtlas();
  }

  const app = document.querySelector('#app');
  if (!app) return;
  const observer = new MutationObserver(() => queueMicrotask(enhance));
  observer.observe(app, { childList: true });
  enhance();
})();


(() => {
  const svgMarks = {
    compass: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="15"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8M39 25l-4 10-10 4 4-10 10-4Z"/><circle cx="32" cy="32" r="24"/></svg>',
    mountain: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 48h48M14 48 26 28l8 10 10-18 10 28"/></svg>',
    tavern: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 48h36M18 48V26l8-6 8 6v22M38 48V22h12v26"/></svg>',
    bridge: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 41h48M14 41c5-9 11-12 18-12 8 0 14 3 18 12M20 41V33M28 41V30M36 41V30M44 41V33"/></svg>',
    tower: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 48h24M24 48V24l8-6 8 6v24M27 24V12h10v12"/></svg>',
    pines: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50h48M18 50V37M32 50V30M46 50V39M12 37l6-10 6 10M24 30l8-14 8 14M40 39l6-10 6 10"/></svg>',
    sword: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 12v28M26 18l6-6 6 6M22 44h20M26 44v6l6 4 6-4v-6"/></svg>',
    potion: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 10h16M28 10v8l-10 14a18 18 0 0 0 14 28h0a18 18 0 0 0 14-28L36 18v-8"/><path d="M22 36c8 3 14 2 20-2"/></svg>',
    ship: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 45h44M18 44l8-16h12l8 16M32 14v21M32 14c10 2 18 8 23 14-11 0-18-2-23-6M32 20c-7 4-12 8-17 14 7 0 12-2 17-5"/></svg>',
    route: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 44c12-11 22-14 30-9 8 5 13 2 18-6" stroke-dasharray="4 4"/><circle cx="12" cy="42" r="3"/><path d="M48 22h8l-2 7"/></svg>',
    dragon: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 46c5-12 12-19 23-21 6-1 10 0 14 3l4-6 8 2-4 5c7 4 10 9 12 17-6-2-11-2-15 0-5 1-9 4-12 8-3-6-8-9-16-9l-6 4-4-3c-4 0-8 1-12 4Z"/></svg>',
    signpost: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M31 12v40M31 24h20l5-5-5-5H31M31 36H15l-5-5 5-5h16"/></svg>'
  };

  const dayMarks = ['mountain', 'tavern', 'tower', 'pines', 'potion', 'ship'];
  const characterMarks = ['sword', 'compass', 'potion', 'route', 'dragon'];
  const atlasMarks = ['ship', 'signpost', 'compass', 'dragon'];

  function injectMarks(selector, marks, className = '') {
    document.querySelectorAll(selector).forEach((node, index) => {
      const key = marks[index % marks.length];
      const existing = node.querySelector(':scope > .stage6-row-mark');
      if (existing?.dataset.mark === key) return;
      existing?.remove();
      const markup = svgMarks[key];
      if (!markup) return;
      const mark = document.createElement('span');
      mark.className = `stage6-row-mark ${className}`.trim();
      mark.dataset.mark = key;
      mark.innerHTML = markup;
      node.append(mark);
    });
  }

  function tuneCurrentSection() {
    const hero = document.querySelector('.entry-hero figcaption');
    if (hero) hero.classList.add('handwritten');

    document.querySelectorAll('.day-row .day-copy strong, .character-row strong, .atlas-tile strong').forEach((node) => {
      node.style.textWrap = 'balance';
    });

    injectMarks('.day-row', dayMarks);
    injectMarks('.character-row', characterMarks);
    injectMarks('.atlas-tile', atlasMarks, 'stage6-row-mark--atlas');
  }

  const host = document.querySelector('#app');
  if (!host) return;
  const observer = new MutationObserver(() => queueMicrotask(tuneCurrentSection));
  observer.observe(host, { childList: true });
  tuneCurrentSection();
})();


(() => {
  const footerLabels = {
    chronicles: 'journal',
    characters: 'ledger',
    atlas: 'atlas'
  };

  const captions = {
    chronicles: 'полевые заметки',
    entry: 'набросок в пути',
    character: 'личное досье',
    atlas: 'схема местности'
  };

  function ensureGuide(page) {
    if (!page || page.querySelector(':scope > .stage7-page-guides')) return;
    const guide = document.createElement('div');
    guide.className = 'stage7-page-guides';
    page.prepend(guide);
  }

  function ensureFooter(page, label) {
    if (!page || page.querySelector(':scope > .stage7-footer-ornament')) return;
    const ornament = document.createElement('div');
    ornament.className = 'stage7-footer-ornament';
    ornament.textContent = label;
    page.append(ornament);
  }

  function ensureFold(host) {
    if (!host || host.querySelector(':scope > .stage7-corner-fold')) return;
    const fold = document.createElement('span');
    fold.className = 'stage7-corner-fold';
    host.append(fold);
  }

  function ensureCaption(page, className, text) {
    if (!page) return;
    const existing = page.querySelector(`:scope > .${className}`);
    if (existing && existing.textContent === text) return;
    existing?.remove();
    const caption = document.createElement('span');
    caption.className = `stage7-sketch-caption ${className}`;
    caption.textContent = text;
    page.append(caption);
  }

  function decoratePages() {
    document.querySelectorAll('.book-spread > section, .book-spread > article').forEach((page, index) => {
      ensureGuide(page);
      const label = index === 0 ? footerLabels[state.section] || 'journal' : footerLabels[state.section] || 'notes';
      ensureFooter(page, label);
    });



    const campaign = document.querySelector('.campaign-page');
    const entry = document.querySelector('.entry-page');
    const character = document.querySelector('.character-card');
    const atlas = document.querySelector('.atlas-card');

    if (campaign) ensureCaption(campaign, 'stage7-sketch-caption--campaign', captions.chronicles);
    if (entry) ensureCaption(entry, 'stage7-sketch-caption--entry', captions.entry);
    if (character) ensureCaption(character, 'stage7-sketch-caption--character', captions.character);
    if (atlas) ensureCaption(atlas, 'stage7-sketch-caption--atlas', captions.atlas);
  }

  const host = document.querySelector('#app');
  if (!host) return;
  const observer = new MutationObserver(() => queueMicrotask(decoratePages));
  observer.observe(host, { childList: true });
  decoratePages();
})();


(() => {
  const portraits = [
    '<svg class="stage8-portrait-svg" viewBox="0 0 90 110" aria-hidden="true"><path d="M28 100c2-17 10-26 18-28 11-3 21 3 26 12 3 5 5 10 6 16M34 50c0-18 8-31 21-31s21 13 21 31c0 14-8 27-21 27S34 64 34 50Z"/><path d="M38 42c7-2 12-7 17-15 5 7 10 11 19 14M43 53c3 2 6 2 9 0M59 53c3 2 6 2 9 0M50 64c4 2 8 2 12 0M29 92l16-8M77 91l-15-8"/><path class="shade" d="M39 36l-5 13M43 32l-6 17M67 34l7 16M70 39l5 13M38 88l17 9M42 83l20 14M49 81l17 14"/></svg>',
    '<svg class="stage8-portrait-svg" viewBox="0 0 90 110" aria-hidden="true"><path d="M25 101c2-15 9-24 18-28 12-5 25-1 32 10 4 6 6 12 7 18M31 51c0-20 10-34 24-34 15 0 24 14 24 34 0 15-9 27-24 27-14 0-24-12-24-27Z"/><path d="M31 43c4-17 13-25 24-26 12 2 20 11 24 25M30 40c5 3 9 4 15 4M80 40c-5 3-10 4-16 4M41 55c3-2 6-2 9 0M61 55c3-2 6-2 9 0M50 66c3 2 7 2 11 0M36 81l17 14M72 81 57 95"/><path class="shade" d="M33 37l-5 10M37 30l-7 12M72 31l7 12M75 37l5 10M38 89l18 10M45 84l17 12"/></svg>',
    '<svg class="stage8-portrait-svg" viewBox="0 0 90 110" aria-hidden="true"><path d="M20 101c4-17 11-25 21-29 10-4 21-2 29 5 7 6 11 14 13 24M31 48c0-20 9-33 24-33 14 0 24 13 24 33 0 18-10 31-24 31-15 0-24-13-24-31Z"/><path d="M28 39c9-3 17-11 24-22 8 9 17 15 27 20M40 52c3-1 6-1 9 0M62 52c3-1 6-1 9 0M47 64c5 4 11 4 16 0M38 71c3 9 9 15 17 17 9-2 15-8 19-18M28 92l18-8M80 92l-18-8"/><path class="shade" d="M35 35l-6 14M39 30l-7 16M71 31l6 16M75 37l5 12M44 84l11 16M61 84l-6 16"/></svg>',
    '<svg class="stage8-portrait-svg" viewBox="0 0 90 110" aria-hidden="true"><path d="M22 101c3-16 10-25 20-29 11-4 24-1 31 8 5 6 8 13 9 21M30 51c0-21 10-35 25-35 15 0 25 14 25 35 0 16-10 29-25 29S30 67 30 51Z"/><path d="M29 40c5-13 14-21 26-24 13 3 21 11 25 24M39 53c3-2 6-2 9 0M62 53c3-2 6-2 9 0M49 66c4 3 9 3 13 0M28 92l18-8M81 92l-18-8M35 28l-8 8M75 27l8 9"/><path class="shade" d="M34 37l-5 12M38 31l-6 15M72 31l6 16M76 37l5 12M42 84l15 14M64 84l-8 14"/></svg>',
    '<svg class="stage8-portrait-svg" viewBox="0 0 90 110" aria-hidden="true"><path d="M19 102c3-18 12-28 23-31 13-4 27 1 34 12 4 6 6 12 7 19M31 49c0-20 9-34 24-34s24 14 24 34c0 18-9 31-24 31S31 67 31 49Z"/><path d="M28 42c6-15 15-24 27-27 12 3 21 12 27 27M39 53c3-2 6-2 9 0M62 53c3-2 6-2 9 0M48 64c5 4 11 4 16 0M38 69c2 13 9 20 17 21 8-1 15-8 18-21M30 92l18-7M79 92l-17-7"/><path class="shade" d="M32 34l-5 13M36 29l-6 15M74 31l6 14M78 36l5 12M43 84l12 16M63 84l-8 16"/></svg>'
  ];

  const atlasArt = {
    'black-harbor': '<svg class="stage8-atlas-svg" viewBox="0 0 240 140" aria-hidden="true"><path d="M8 113h224M16 100h208M34 100V64l24-18 22 18v36M91 100V53l29-25 29 25v47M162 100V65l21-15 22 15v35M20 78h48M94 69h50M169 78h31M34 116c18-8 35-8 53 0 18 8 38 8 60 0 19-7 41-7 65 0"/><path d="M120 28v-16M120 13l28 12M120 13l-19 17M184 50V32M184 33l18 9M184 33l-12 12"/></svg>',
    order: '<svg class="stage8-atlas-svg" viewBox="0 0 240 140" aria-hidden="true"><circle cx="120" cy="70" r="44"/><circle cx="120" cy="70" r="32"/><path d="m120 25 9 32 32-9-26 22 26 22-32-9-9 32-9-32-32 9 26-22-26-22 32 9 9-32Z"/><path d="M56 116h128M72 124h96"/></svg>',
    compass: '<svg class="stage8-atlas-svg" viewBox="0 0 240 140" aria-hidden="true"><circle cx="120" cy="70" r="45"/><circle cx="120" cy="70" r="31"/><path d="M120 12v21M120 107v21M62 70h21M157 70h21M137 53l-10 24-24 10 10-24 24-10Z"/><path d="M120 18c27 0 52 23 52 52s-25 52-52 52-52-23-52-52 25-52 52-52Z"/></svg>',
    beast: '<svg class="stage8-atlas-svg" viewBox="0 0 240 140" aria-hidden="true"><path d="M26 104c10-33 31-54 61-61 15-3 30 1 42 12l15-22 30 5-16 19c22 10 37 27 46 51-18-7-36-7-52-1-15 5-27 13-36 26-10-20-27-31-52-31l-19 14-12-12c-14-1-27 4-39 15Z"/><path d="M123 57l18 17M146 31l15 6M85 62l-13 13M78 49l-18 8"/></svg>'
  };

  function currentCharacterIndex() {
    const idx = data.characters.findIndex((item) => item.id === state.selectedCharacterId);
    return Math.max(0, idx);
  }

  function currentAtlasId() {
    return data.atlas.find((item) => item.id === state.selectedAtlasId)?.id || data.atlas[0]?.id;
  }

  function replacePortrait(host, index) {
    if (!host) return;
    if (host.dataset.stage8Portrait === String(index)) return;
    host.dataset.stage8Portrait = String(index);
    host.style.backgroundImage = 'none';
    host.innerHTML = `<span class="portrait-art" style="--portrait-position:${(index % 5) * 25}%" aria-hidden="true"></span>`;
  }

  function replaceAtlasArt(host, id) {
    if (!host) return;
    const key = atlasArt[id] ? id : 'compass';
    if (host.dataset.stage8AtlasArt === key) return;
    host.dataset.stage8AtlasArt = key;
    host.style.backgroundImage = 'none';
    host.innerHTML = key === 'black-harbor' ? '<img class="art-image" src="./assets/harbor.webp" alt="Карандашный рисунок Чёрной Гавани">' : atlasArt[key];
  }

  function enhanceCharacterSearch() {
    if (state.section !== 'characters') return;
    const strip = document.querySelector('.character-index .search-strip');
    if (!strip || strip.dataset.stage8Search === '1') return;
    strip.dataset.stage8Search = '1';
    strip.classList.add('stage8-character-search');
    const oldText = strip.querySelector('span:not(.icon)');
    if (oldText) {
      const input = document.createElement('input');
      input.type = 'search';
      input.placeholder = 'Поиск персонажей...';
      input.autocomplete = 'off';
      input.setAttribute('aria-label', 'Поиск персонажей');
      oldText.replaceWith(input);
      input.addEventListener('input', () => {
        const query = input.value.trim().toLocaleLowerCase('ru');
        let visible = 0;
        document.querySelectorAll('.character-row').forEach((row) => {
          const text = row.textContent.toLocaleLowerCase('ru');
          const show = !query || text.includes(query);
          row.hidden = !show;
          if (show) visible += 1;
        });
        let empty = document.querySelector('.stage8-empty-search');
        if (!visible && query) {
          if (!empty) {
            empty = document.createElement('div');
            empty.className = 'stage8-empty-search';
            empty.textContent = 'Никого не найдено';
            document.querySelector('.character-list')?.append(empty);
          }
        } else {
          empty?.remove();
        }
      });
    }
  }

  function enhanceCharacters() {
    if (state.section !== 'characters') return;
    document.querySelectorAll('.character-row').forEach((row, index) => {
      replacePortrait(row.querySelector('.character-thumb'), index);
    });
    replacePortrait(document.querySelector('.portrait-frame .portrait-image'), currentCharacterIndex());
  }

  function enhanceAtlas() {
    if (state.section !== 'atlas') return;
    document.querySelectorAll('.atlas-tile').forEach((tile, index) => {
      const entry = data.atlas[index];
      replaceAtlasArt(tile.querySelector('.atlas-tile-image'), entry?.id || 'compass');
    });
    replaceAtlasArt(document.querySelector('.atlas-hero-image'), currentAtlasId());
  }

  function enhance() {
    enhanceCharacterSearch();
    enhanceCharacters();
    enhanceAtlas();
  }

  const app = document.querySelector('#app');
  if (!app) return;
  const observer = new MutationObserver(() => queueMicrotask(enhance));
  observer.observe(app, { childList: true });
  enhance();
})();
