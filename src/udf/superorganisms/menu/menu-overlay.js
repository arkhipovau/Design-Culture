(function () {
  function getPrefix() {
    var path = window.location.pathname;

    if (/\/pages\/interviews\//.test(path)) return '../../';
    if (/\/pages\//.test(path)) return '../';
    return './';
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9\s-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildSearchIndex(prefix) {
    var links = {
      home: prefix + 'index.html#top',
      journal: prefix + 'pages/journal.html',
      gallery: prefix + 'pages/gallery.html',
      newsletter: prefix + 'pages/newsletter.html',
      about: prefix + 'pages/about.html',
      issue: prefix + 'index.html#issue'
    };

    function interview(pageName) {
      return prefix + 'pages/interviews/' + pageName + '.html';
    }

    var items = [
      {
        title: 'Главная',
        subtitle: 'Медиа о дизайн-культуре deFindings',
        kind: 'Страница',
        href: links.home,
        keywords: 'home index медиа дизайн культура интервью',
        priority: 100
      },
      {
        title: 'Журнал',
        subtitle: 'Интервью и практики дизайнеров',
        kind: 'Раздел',
        href: links.journal,
        keywords: 'journal интервью статьи авторы',
        priority: 95
      },
      {
        title: 'Галерея',
        subtitle: 'Избранные работы из статей',
        kind: 'Раздел',
        href: links.gallery,
        keywords: 'gallery изображения проекты визуал',
        priority: 95
      },
      {
        title: 'Рассылка',
        subtitle: 'Подписка на новости deFindings',
        kind: 'Страница',
        href: links.newsletter,
        keywords: 'newsletter подписка email',
        priority: 90
      },
      {
        title: 'О проекте',
        subtitle: 'О проекте deFindings и редакции',
        kind: 'Страница',
        href: links.about,
        keywords: 'about о нас о проекте автор редакция диплом',
        priority: 88
      },
      {
        title: 'Печатный выпуск',
        subtitle: 'Выпуск deFindings №1',
        kind: 'Раздел',
        href: links.issue,
        keywords: 'issue выпуск печатный calameo',
        priority: 85
      },

      // SEARCH_INTERVIEWS_START
      {
        title: 'Артём Тарасов и Артём Тарадаш',
        subtitle: 'Антидисциплинарный подход, мир постдизайна и крафт в эпоху AI',
        kind: 'Статья',
        href: interview('togetherwithyou'),
        keywords: 'студия тбилиси анти дисциплина брендинг крафт ai',
        priority: 70
      },
      {
        title: 'Алексей Пьянков',
        subtitle: 'Как в Pragmatica живёт дизайн-ДНК: белый лист на школьном сборе и треугольник результата',
        kind: 'Статья',
        href: interview('aleksey-pyankov'),
        keywords: 'екатеринбург pragmatica прагматика студия',
        priority: 70
      },
      {
        title: 'Полина Загуменова',
        subtitle: 'Гибкие рамки в Берлине, неожиданные заказы и скепсис к AI-картинкам',
        kind: 'Статья',
        href: interview('polina-zagumenova'),
        keywords: 'берлин фриланс щука ai',
        priority: 70
      },
      {
        title: 'Маша Черн',
        subtitle: 'От «сделаю всё сама» к коллаборациям, ребрендинг TON и границы с генеративными картинками',
        kind: 'Статья',
        href: interview('masha-chern'),
        keywords: 'копенгаген дания ton tone verle продукт',
        priority: 70
      },
      {
        title: 'Юля Кондратьева',
        subtitle: 'Уместный дизайн, «Типомания», Werkstatt и границы слова «дизайн-культура»',
        kind: 'Статья',
        href: interview('yulya-kondratyeva'),
        keywords: 'тбилиси werkstatt гроза holystick школа',
        priority: 70
      },
      {
        title: 'Ян Зарецкий',
        subtitle: 'Генотип и фенотип бренда, цельность как критерий и «Мастерская» в Петербурге',
        kind: 'Статья',
        href: interview('yan-zaretsky'),
        keywords: 'санкт-петербург питер munk мастерская продукт студия',
        priority: 70
      },
      {
        title: 'Сергей Бреус',
        subtitle: 'Недели на мудборде, ремесло с пользой и страх однотипного AI-контента',
        kind: 'Статья',
        href: interview('sergey-breus'),
        keywords: 'москва ony oni f61 студия',
        priority: 70
      },
      {
        title: 'Сергей Кудинов',
        subtitle: 'Культура против симулятора в продуктовом дизайне и ценность ручного труда',
        kind: 'Статья',
        href: interview('sergey-kudinov'),
        keywords: 'москва яндекс 360 продукт',
        priority: 70
      },
      {
        title: 'Аня Голубь',
        subtitle: 'Культура как уважение, «санитар леса» и зона комфорта, без которой дизайн не держится',
        kind: 'Статья',
        href: interview('anya-golub'),
        keywords: 'бали призма prizma студия',
        priority: 70
      },
      {
        title: 'Даша Макурина',
        subtitle: 'CGI, метафоры продукта и инклюзивный визуал в pont.design и Rarible',
        kind: 'Статья',
        href: interview('dasha-makurina'),
        keywords: 'москва rarible pont design продукт 3d cgi',
        priority: 70
      },
      {
        title: 'Саша Барабонова',
        subtitle: 'Случайный путь в дизайн, эмпатия как основа профессии и примирение с AI',
        kind: 'Статья',
        href: interview('sasha-barabonova'),
        keywords: 'ереван phygital t-банк vk yandex pragmatica lalalai продукт',
        priority: 70
      },
      {
        title: 'Стефан Лашко',
        subtitle: 'Порядок из хаоса, метафора в знаке и отказ от клиентов без ценностей',
        kind: 'Статья',
        href: interview('stefan-lashko'),
        keywords: 'москва esh студия преподаватель',
        priority: 70
      },
      {
        title: 'Оля Бажанова',
        subtitle: 'Когда лучше не сделать, игра «Хвостики» и душа в сувенирном производстве',
        kind: 'Статья',
        href: interview('olya-bazanova'),
        keywords: 'калининград подписные додо издательство',
        priority: 70
      },
      {
        title: 'Анастасия Сычева',
        subtitle: 'Бизнес-контекст, кор-идея бренда и AI как краска в палитре, а не замена руки',
        kind: 'Статья',
        href: interview('anastasia-sycheva'),
        keywords: 'белград студия y combinator брендинг',
        priority: 70
      },
      {
        title: 'Артём Герц',
        subtitle: 'Язык с нуля в айдентике: Redis, Nil Foundation и честность в решениях',
        kind: 'Статья',
        href: interview('artem-gerts'),
        keywords: 'москва redis студия айдентика',
        priority: 70
      },
      {
        title: 'Сергей Мекрюков',
        subtitle: 'Гемба в ресторанах, метрики Dodo Brands и честные UX-ревью',
        kind: 'Статья',
        href: interview('sergey-mekryukov'),
        keywords: 'москва dodo brands додо продукт ux сервисы',
        priority: 70
      },
      {
        title: 'Гаврил Перов',
        subtitle: 'Архитектура, город и графический язык',
        kind: 'Статья',
        href: interview('gavril-perov'),
        keywords: 'париж франция drinkit продукт архитектура город графический',
        priority: 70
      },
      {
        title: 'Елена Чинакова',
        subtitle: 'Zorky в Лондоне, роль дизайнера в Avito и взросление в профессии',
        kind: 'Статья',
        href: interview('elena-chinakova'),
        keywords: 'лондон великобритания сообщество zorky avito',
        priority: 70
      },
      {
        title: 'Даша Чертанова',
        subtitle: 'Смыслы, контекст и люди, меняющие профессию',
        kind: 'Статья',
        href: interview('dariia-chertanova'),
        keywords: 'москва the blueprint blueprint bang bang education werkstatt продукт смыслы контекст кодинг',
        priority: 70
      },
      {
        title: 'Андрей Максименков',
        subtitle: 'spros, пять принципов мышления и ночные идеи, которые нельзя терять',
        kind: 'Статья',
        href: interview('andrey-maksimenkov'),
        keywords: 'ростов spros диджитал интервью проект',
        priority: 70
      },
      {
        title: 'Никита Петров',
        subtitle: 'Портфолио как продукт, data-driven подход и собственные проекты',
        kind: 'Статья',
        href: interview('nikita-petrov'),
        keywords: 'москва nikipetrov продукт проект foliobin savi medium portfolio',
        priority: 70
      },
      {
        title: 'Максим Аксенов',
        subtitle: 'Архитектурный бэкграунд, дизайн как система и дисциплина мышления',
        kind: 'Статья',
        href: interview('maxim-aksenov'),
        keywords: 'москва фриланс дизайн архитектура система lash',
        priority: 70
      },
      // SEARCH_INTERVIEWS_END
    ];

    return items.map(function (item, index) {
      var titleNorm = normalizeText(item.title);
      var subtitleNorm = normalizeText(item.subtitle);
      var keywordsNorm = normalizeText(item.keywords);
      return {
        title: item.title,
        subtitle: item.subtitle,
        kind: item.kind,
        href: item.href,
        order: index,
        priority: item.priority || 0,
        titleNorm: titleNorm,
        subtitleNorm: subtitleNorm,
        haystack: [titleNorm, subtitleNorm, keywordsNorm].join(' ').trim()
      };
    });
  }

  function findSearchResults(index, query) {
    var normalized = normalizeText(query);
    if (!normalized) {
      return index.slice(0, 8);
    }

    var tokens = normalized.split(' ').filter(Boolean);
    return index
      .map(function (item) {
        var allTokensFound = tokens.every(function (token) {
          return item.haystack.indexOf(token) !== -1;
        });
        if (!allTokensFound) return null;

        var score = item.priority;
        if (item.titleNorm.indexOf(normalized) === 0) score += 120;
        else if (item.titleNorm.indexOf(normalized) !== -1) score += 85;
        if (item.subtitleNorm.indexOf(normalized) !== -1) score += 45;
        tokens.forEach(function (token) {
          if (item.titleNorm.indexOf(token) !== -1) score += 20;
          else if (item.subtitleNorm.indexOf(token) !== -1) score += 8;
          else score += 2;
        });
        return { item: item, score: score };
      })
      .filter(Boolean)
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.order - b.item.order;
      })
      .slice(0, 10)
      .map(function (entry) {
        return entry.item;
      });
  }

  function buildMenuMarkup(prefix) {
    var links = {
      home: prefix + 'index.html#top',
      journal: prefix + 'pages/journal.html',
      gallery: prefix + 'pages/gallery.html',
      newsletter: prefix + 'pages/newsletter.html',
      about: prefix + 'pages/about.html',
      issue: prefix + 'index.html#issue'
    };

    return (
      '<div class="s-menu__drawer" role="dialog" aria-modal="true" aria-label="Меню сайта">' +
      '  <div class="s-menu__panel">' +
      '    <div class="s-menu__main">' +
      '      <a class="s-menu__card" href="' +
      links.journal +
      '">' +
      '        <span class="s-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/img_journal.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="s-menu__card-title">Журнал</span>' +
      '      </a>' +
      '      <a class="s-menu__card" href="' +
      links.gallery +
      '">' +
      '        <span class="s-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/img_gallery.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="s-menu__card-title">Галерея</span>' +
      '      </a>' +
      '      <a class="s-menu__card s-menu__card--about" href="' +
      links.about +
      '">' +
      '        <span class="s-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/Q_MenuImage_about.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="s-menu__card-title">О проекте</span>' +
      '      </a>' +
      '      <a class="s-menu__card s-menu__card--issue" href="' +
      links.issue +
      '">' +
      '        <span class="s-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/Q_MenuImage_print.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="s-menu__card-title">Печатный выпуск</span>' +
      '      </a>' +
      '    </div>' +
      '    <div class="s-menu__links">' +
      '      <a href="' +
      links.newsletter +
      '">Рассылка</a>' +
      '      <a href="https://t.me/arkhipoovau">Поддержка</a>' +
      '      <a href="https://t.me/defindings">Telegram</a>' +
      '      <a href="https://www.linkedin.com/in/arkhipovau/">LinkedIn</a>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  function buildSearchMarkup(prefix) {
    return (
      '<div class="s-menu__search-panel" role="dialog" aria-modal="true" aria-label="Поиск по сайту">' +
      '  <form class="s-menu__search-form" role="search" autocomplete="off">' +
      '    <input class="s-menu__search-input" type="search" name="q" placeholder="Поиск по сайту" aria-label="Поиск по сайту" />' +
      '    <button class="s-menu__search-close" type="button" aria-label="Закрыть поиск">' +
      '      <img class="s-menu__search-icon" src="' +
      prefix +
      'udf/quarks/icons/q-icon-close-16-black.svg" alt="" aria-hidden="true" />' +
      '    </button>' +
      '  </form>' +
      '  <div class="s-menu__search-results" role="listbox" aria-label="Результаты поиска"></div>' +
      '</div>'
    );
  }

  function ensureMenuButton(btn, iconSrc, ariaLabel) {
    if (!btn) return null;
    btn.setAttribute('aria-label', ariaLabel);
    var img = btn.querySelector('.s-menu__icon');
    if (!img) {
      img = document.createElement('img');
      img.className = 's-menu__icon';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      btn.appendChild(img);
    }
    img.src = iconSrc;
    return btn;
  }

  function initMenuOverlay() {
    var menuHeader = document.querySelector('header.s-menu');
    if (!menuHeader || menuHeader.dataset.menuReady === '1') return;
    menuHeader.classList.add('s-menu--ready');

    var prefix = getPrefix();
    var searchIcon = prefix + 'udf/quarks/icons/q-icon-magnifying-glass-16-black.svg';
    var burgerIcon = prefix + 'udf/quarks/icons/q-icon-burger-16-black.svg';
    var closeIcon = prefix + 'udf/quarks/icons/q-icon-close-16-black.svg';

    var menuSearch = menuHeader.querySelector('.s-menu__search');
    if (!menuSearch) {
      menuSearch = document.createElement('button');
      menuSearch.type = 'button';
      menuSearch.className = 's-menu__search';
      menuSearch.setAttribute('aria-expanded', 'false');
      menuHeader.insertBefore(menuSearch, menuHeader.firstChild);
    }
    ensureMenuButton(menuSearch, searchIcon, 'Поиск');

    var menuToggle = menuHeader.querySelector('.s-menu__toggle');
    if (!menuToggle) {
      menuToggle = document.createElement('button');
      menuToggle.type = 'button';
      menuToggle.className = 's-menu__toggle';
      menuToggle.setAttribute('aria-expanded', 'false');
      menuHeader.appendChild(menuToggle);
    }
    ensureMenuButton(menuToggle, burgerIcon, 'Открыть меню');
    menuHeader.dataset.menuReady = '1';

    var layer = document.createElement('div');
    layer.className = 's-menu__layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = buildMenuMarkup(prefix);
    document.body.appendChild(layer);

    var searchLayer = document.createElement('div');
    searchLayer.className = 's-menu__search-layer';
    searchLayer.setAttribute('aria-hidden', 'true');
    searchLayer.innerHTML = buildSearchMarkup(prefix);
    document.body.appendChild(searchLayer);

    var searchForm = searchLayer.querySelector('.s-menu__search-form');
    var searchInput = searchLayer.querySelector('.s-menu__search-input');
    var searchClose = searchLayer.querySelector('.s-menu__search-close');
    var searchResults = searchLayer.querySelector('.s-menu__search-results');
    var searchIndex = buildSearchIndex(prefix);
    var latestResults = [];

    function renderSearchResults(query) {
      latestResults = findSearchResults(searchIndex, query);
      searchResults.innerHTML = '';

      if (!latestResults.length) {
        var empty = document.createElement('div');
        empty.className = 's-menu__search-empty';
        empty.textContent = 'Ничего не найдено';
        searchResults.appendChild(empty);
        return;
      }

      latestResults.forEach(function (item) {
        var link = document.createElement('a');
        link.className = 's-menu__search-item';
        link.href = item.href;

        var content = document.createElement('span');
        content.className = 's-menu__search-content';

        var title = document.createElement('span');
        title.className = 's-menu__search-title';
        title.textContent = item.title;

        var subtitle = document.createElement('span');
        subtitle.className = 's-menu__search-subtitle';
        subtitle.textContent = item.subtitle;

        var kind = document.createElement('span');
        kind.className = 's-menu__search-kind';
        kind.textContent = item.kind;

        content.appendChild(title);
        content.appendChild(subtitle);
        link.appendChild(content);
        link.appendChild(kind);
        searchResults.appendChild(link);
      });
    }

    function setMenuOpen(isOpen) {
      document.body.classList.toggle('menu-open', isOpen);
      layer.classList.toggle('is-open', isOpen);
      layer.setAttribute('aria-hidden', String(!isOpen));
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      var icon = menuToggle.querySelector('img');
      if (icon) icon.src = isOpen ? closeIcon : burgerIcon;
    }

    function setSearchOpen(isOpen) {
      document.body.classList.toggle('search-open', isOpen);
      searchLayer.classList.toggle('is-open', isOpen);
      searchLayer.setAttribute('aria-hidden', String(!isOpen));
      menuSearch.setAttribute('aria-expanded', String(isOpen));
      menuSearch.setAttribute('aria-label', 'Поиск');

      var icon = menuSearch.querySelector('img');
      if (icon) icon.src = searchIcon;

      if (isOpen) {
        renderSearchResults(searchInput.value || '');
        window.requestAnimationFrame(function () {
          searchInput.focus();
          searchInput.select();
        });
      } else {
        menuSearch.blur();
      }
    }

    menuToggle.addEventListener('click', function () {
      var isOpen = layer.classList.contains('is-open');
      if (!isOpen) setSearchOpen(false);
      setMenuOpen(!isOpen);
    });

    menuSearch.addEventListener('click', function () {
      var isOpen = searchLayer.classList.contains('is-open');
      if (!isOpen) setMenuOpen(false);
      setSearchOpen(!isOpen);
    });

    layer.addEventListener('click', function (event) {
      if (event.target === layer) {
        setMenuOpen(false);
      }
    });

    searchLayer.addEventListener('click', function (event) {
      if (event.target === searchLayer) {
        setSearchOpen(false);
      }
    });

    layer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    searchResults.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setSearchOpen(false);
      }
    });

    searchInput.addEventListener('input', function () {
      renderSearchResults(searchInput.value || '');
    });

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!latestResults.length) return;
      window.location.href = latestResults[0].href;
    });

    searchClose.addEventListener('click', function () {
      setSearchOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
        return;
      }

      var target = event.target;
      var tagName = target && target.tagName ? target.tagName.toLowerCase() : '';
      var editable = tagName === 'input' || tagName === 'textarea' || (target && target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
        return;
      }

      if (event.key === '/' && !editable) {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('menu') === 'open') {
      setMenuOpen(true);
    }
    if (params.get('search') === 'open') {
      setSearchOpen(true);
    }
    if (params.get('q')) {
      searchInput.value = params.get('q');
      setMenuOpen(false);
      setSearchOpen(true);
      renderSearchResults(searchInput.value);
    }
  }

  document.addEventListener('DOMContentLoaded', initMenuOverlay);
})();
