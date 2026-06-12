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

      {
        title: 'Артём Тарасов и Артём Тарадаш',
        subtitle: 'Мир постдизайна',
        kind: 'Статья',
        href: interview('togetherwithyou'),
        keywords: 'студия тбилиси анти дисциплина брендинг крафт ai',
        priority: 70
      },
      {
        title: 'Алексей Пьянков',
        subtitle: 'Белый лист',
        kind: 'Статья',
        href: interview('aleksey-pyankov'),
        keywords: 'екатеринбург pragmatica прагматика студия',
        priority: 70
      },
      {
        title: 'Полина Загуменова',
        subtitle: 'Флексибельные рамки',
        kind: 'Статья',
        href: interview('polina-zagumenova'),
        keywords: 'берлин фриланс щука ai',
        priority: 70
      },
      {
        title: 'Маша Черн',
        subtitle: 'Дизайн про коллаборации',
        kind: 'Статья',
        href: interview('masha-chern'),
        keywords: 'копенгаген дания ton tone verle продукт',
        priority: 70
      },
      {
        title: 'Юля Кондратьева',
        subtitle: 'Уместный дизайн',
        kind: 'Статья',
        href: interview('yulya-kondratyeva'),
        keywords: 'тбилиси werkstatt гроза holystick школа',
        priority: 70
      },
      {
        title: 'Ян Зарецкий',
        subtitle: 'Генотип бренда',
        kind: 'Статья',
        href: interview('yan-zaretsky'),
        keywords: 'санкт-петербург питер munk мастерская продукт студия',
        priority: 70
      },
      {
        title: 'Сергей Бреус',
        subtitle: 'Недели на мудборде',
        kind: 'Статья',
        href: interview('sergey-breus'),
        keywords: 'москва ony oni f61 студия',
        priority: 70
      },
      {
        title: 'Сергей Кудинов',
        subtitle: 'Симулятор культуры',
        kind: 'Статья',
        href: interview('sergey-kudinov'),
        keywords: 'москва яндекс 360 продукт',
        priority: 70
      },
      {
        title: 'Аня Голубь',
        subtitle: 'Санитар леса',
        kind: 'Статья',
        href: interview('anya-golub'),
        keywords: 'бали призма prizma студия',
        priority: 70
      },
      {
        title: 'Даша Макурина',
        subtitle: 'Метафора продукта',
        kind: 'Статья',
        href: interview('dasha-makurina'),
        keywords: 'москва rarible pont design продукт 3d cgi',
        priority: 70
      },
      {
        title: 'Саша Барабонова',
        subtitle: 'Эмпатичный дизайн',
        kind: 'Статья',
        href: interview('sasha-barabonova'),
        keywords: 'ереван phygital t-банк vk yandex pragmatica lalalai продукт',
        priority: 70
      },
      {
        title: 'Стефан Лашко',
        subtitle: 'Порядок из хаоса',
        kind: 'Статья',
        href: interview('stefan-lashko'),
        keywords: 'москва esh студия преподаватель',
        priority: 70
      },
      {
        title: 'Оля Бажанова',
        subtitle: 'Душа в сувенирке',
        kind: 'Статья',
        href: interview('olya-bazanova'),
        keywords: 'калининград подписные додо издательство',
        priority: 70
      },
      {
        title: 'Анастасия Сычева',
        subtitle: 'AI как краска',
        kind: 'Статья',
        href: interview('anastasia-sycheva'),
        keywords: 'белград студия y combinator брендинг',
        priority: 70
      },
      {
        title: 'Артём Герц',
        subtitle: 'Язык с нуля',
        kind: 'Статья',
        href: interview('artem-gerts'),
        keywords: 'москва redis студия айдентика',
        priority: 70
      },
      {
        title: 'Гаврил Перов',
        subtitle: 'Good enough',
        kind: 'Статья',
        href: interview('gavril-perov'),
        keywords: 'париж франция drinkit продукт',
        priority: 70
      },
      {
        title: 'Елена Чинакова',
        subtitle: 'Зоркий взгляд',
        kind: 'Статья',
        href: interview('elena-chinakova'),
        keywords: 'лондон великобритания сообщество zorky avito',
        priority: 70
      },
      {
        title: 'Андрей Максименков',
        subtitle: 'Ночные идеи',
        kind: 'Статья',
        href: interview('andrey-maksimenkov'),
        keywords: 'ростов spros диджитал интервью проект',
        priority: 70
      },
      {
        title: 'Сергей Мекрюков',
        subtitle: 'Гемба в ресторанах',
        kind: 'Статья',
        href: interview('sergey-mekryukov'),
        keywords: 'москва dodo brands додо продукт ux сервисы',
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
        title: 'Никита Петров',
        subtitle: 'Портфолио как продукт',
        kind: 'Статья',
        href: interview('nikita-petrov'),
        keywords: 'москва nikipetrov продукт проект foliobin savi medium portfolio',
        priority: 70
      },
      {
        title: 'Максим Аксенов',
        subtitle: 'Интервью готовится',
        kind: 'Статья',
        href: interview('maxim-aksenov'),
        keywords: 'москва фриланс дизайн',
        priority: 70
      }
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
      '<div class="site-menu" role="dialog" aria-modal="true" aria-label="Меню сайта">' +
      '  <div class="site-menu__panel">' +
      '    <div class="site-menu__main">' +
      '      <a class="site-menu__card" href="' +
      links.journal +
      '">' +
      '        <span class="site-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/img_journal.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="site-menu__card-title">Журнал</span>' +
      '      </a>' +
      '      <a class="site-menu__card" href="' +
      links.gallery +
      '">' +
      '        <span class="site-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/img_gallery.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="site-menu__card-title">Галерея</span>' +
      '      </a>' +
      '      <a class="site-menu__card site-menu__card--about" href="' +
      links.about +
      '">' +
      '        <span class="site-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/Q_MenuImage_about.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="site-menu__card-title">О проекте</span>' +
      '      </a>' +
      '      <a class="site-menu__card site-menu__card--issue" href="' +
      links.issue +
      '">' +
      '        <span class="site-menu__card-thumb">' +
      '          <img src="' +
      prefix +
      'images/Q_MenuImage_print.png" alt="" loading="lazy" />' +
      '        </span>' +
      '        <span class="site-menu__card-title">Печатный выпуск</span>' +
      '      </a>' +
      '    </div>' +
      '    <div class="site-menu__links">' +
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
      '<div class="site-search" role="dialog" aria-modal="true" aria-label="Поиск по сайту">' +
      '  <form class="site-search__form" role="search" autocomplete="off">' +
      '    <input class="site-search__input" type="search" name="q" placeholder="Поиск по сайту" aria-label="Поиск по сайту" />' +
      '    <button class="site-search__close" type="button" aria-label="Закрыть поиск">' +
      '      <img class="site-search__icon" src="' +
      prefix +
      'udf/quarks/icons/q-icon-close-16-black.svg" alt="" aria-hidden="true" />' +
      '    </button>' +
      '  </form>' +
      '  <div class="site-search__results" role="listbox" aria-label="Результаты поиска"></div>' +
      '</div>'
    );
  }

  function initMenuOverlay() {
    var topbar = document.querySelector('.topbar');
    if (!topbar || topbar.dataset.menuReady === '1') return;
    topbar.classList.add('topbar--menu');

    var prefix = getPrefix();
    var searchIcon = prefix + 'udf/quarks/icons/q-icon-magnifying-glass-16-black.svg';
    var burgerIcon = prefix + 'udf/quarks/icons/q-icon-burger-16-black.svg';
    var closeIcon = prefix + 'udf/quarks/icons/q-icon-close-16-black.svg';

    var menuSearch = document.createElement('button');
    menuSearch.type = 'button';
    menuSearch.className = 'menu-search';
    menuSearch.setAttribute('aria-label', 'Поиск');
    menuSearch.setAttribute('aria-expanded', 'false');
    menuSearch.innerHTML =
      '<img class="menu-icon" src="' +
      searchIcon +
      '" alt="" aria-hidden="true" />';

    var menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Открыть меню');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML =
      '<img class="menu-icon" src="' +
      burgerIcon +
      '" alt="" aria-hidden="true" />';

    topbar.insertBefore(menuSearch, topbar.firstChild);
    topbar.appendChild(menuToggle);
    topbar.dataset.menuReady = '1';

    var layer = document.createElement('div');
    layer.className = 'site-menu-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = buildMenuMarkup(prefix);
    document.body.appendChild(layer);

    var searchLayer = document.createElement('div');
    searchLayer.className = 'site-search-layer';
    searchLayer.setAttribute('aria-hidden', 'true');
    searchLayer.innerHTML = buildSearchMarkup(prefix);
    document.body.appendChild(searchLayer);

    var searchForm = searchLayer.querySelector('.site-search__form');
    var searchInput = searchLayer.querySelector('.site-search__input');
    var searchClose = searchLayer.querySelector('.site-search__close');
    var searchResults = searchLayer.querySelector('.site-search__results');
    var searchIndex = buildSearchIndex(prefix);
    var latestResults = [];

    function renderSearchResults(query) {
      latestResults = findSearchResults(searchIndex, query);
      searchResults.innerHTML = '';

      if (!latestResults.length) {
        var empty = document.createElement('div');
        empty.className = 'site-search__empty';
        empty.textContent = 'Ничего не найдено';
        searchResults.appendChild(empty);
        return;
      }

      latestResults.forEach(function (item) {
        var link = document.createElement('a');
        link.className = 'site-search__item';
        link.href = item.href;

        var content = document.createElement('span');
        content.className = 'site-search__content';

        var title = document.createElement('span');
        title.className = 'site-search__title';
        title.textContent = item.title;

        var subtitle = document.createElement('span');
        subtitle.className = 'site-search__subtitle';
        subtitle.textContent = item.subtitle;

        var kind = document.createElement('span');
        kind.className = 'site-search__kind';
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
