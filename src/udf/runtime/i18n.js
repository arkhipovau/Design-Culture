(function () {
  var isEn = /^\/en(\/|$)/.test(window.location.pathname);
  var lang = isEn ? 'en' : 'ru';

  function prefixHref(href) {
    if (!isEn) return href;
    if (/^https?:\/\//.test(href) || /^mailto:/.test(href)) return href;
    if (href.charAt(0) === '#') return href;
    if (/^\/en(\/|$)/.test(href)) return href;
    return '/en' + (href.charAt(0) === '/' ? '' : '/') + href;
  }

  function altHref() {
    var path = window.location.pathname;
    if (isEn) return path.replace(/^\/en(\/|$)/, '/');
    return '/en' + path;
  }

  var t = {
    ru: {
      search: 'Поиск',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      siteMenu: 'Меню сайта',
      searchSite: 'Поиск по сайту',
      closeSearch: 'Закрыть поиск',
      nothingFound: 'Ничего не найдено',
      results: 'Результаты поиска',
      journal: 'Журнал',
      gallery: 'Галерея',
      about: 'О проекте',
      printIssue: 'Печатный выпуск',
      newsletter: 'Рассылка',
      support: 'Поддержка',
      youRead: 'Вы читаете',
      browse: 'Смотрите',
      learnMore: 'Узнайте больше',
      subscribe: 'Подписывайтесь',
      otherMedia: 'Другие медиумы',
      projectBy: 'Реализация проекта',
      privacy: 'Политика конфиденциальности',
      curator: 'Куратор – Захар День',
      up: 'Наверх',
      page: 'Страница',
      section: 'Раздел',
      article: 'Статья',
      switchLang: 'EN',
      switchLangLabel: 'Switch to English'
    },
    en: {
      search: 'Search',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      siteMenu: 'Site menu',
      searchSite: 'Search this site',
      closeSearch: 'Close search',
      nothingFound: 'Nothing found',
      results: 'Search results',
      journal: 'Journal',
      gallery: 'Gallery',
      about: 'About',
      printIssue: 'Print Issue',
      newsletter: 'Newsletter',
      support: 'Support',
      youRead: 'You are reading',
      browse: 'Browse',
      learnMore: 'Learn more',
      subscribe: 'Subscribe',
      otherMedia: 'Other channels',
      projectBy: 'Made by',
      privacy: 'Privacy Policy',
      curator: 'Curator — Zakhar Den',
      up: 'Back to top',
      page: 'Page',
      section: 'Section',
      article: 'Article',
      switchLang: 'RU',
      switchLangLabel: 'Переключить на русский'
    }
  };

  window.DefindingsI18n = {
    lang: lang,
    isEn: isEn,
    t: t[lang],
    prefixHref: prefixHref,
    altHref: altHref
  };
})();
