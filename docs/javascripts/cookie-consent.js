(function () {
  var STORAGE_KEY = 'defindings-cookie-consent';
  var NBSP = '\u00A0';
  var NON_BREAKING_ONE = /(^|[\s\u00A0(«"„“])([вксуоаяи])\s+(?=\S)/giu;
  var NON_BREAKING_TWO =
    /(^|[\s\u00A0(«"„“])(во|не|ни|на|но|по|за|из|от|до|об|со|ко|под|над|при|для|без|про|или|как|же|ли|бы)\s+(?=\S)/giu;

  function fixWidows(text) {
    if (!text || text.indexOf(' ') === -1) return text;
    return text
      .replace(NON_BREAKING_TWO, function (_match, before, word) {
        return before + word + NBSP;
      })
      .replace(NON_BREAKING_ONE, function (_match, before, word) {
        return before + word + NBSP;
      });
  }

  function applyWidowControl(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var next = fixWidows(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function scriptsBase() {
    var script = document.currentScript;
    if (script && script.src) {
      return script.src.replace(/\/cookie-consent\.js.*$/, '/');
    }
    return 'javascripts/';
  }

  function isEmbed() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  function privacyHref() {
    var path = window.location.pathname || '';
    if (path.indexOf('/interviews/') !== -1) return '../privacy.html';
    if (path.indexOf('/pages/') !== -1) return './privacy.html';
    return './pages/privacy.html';
  }

  function loadAnalytics() {
    var base = scriptsBase();
    if (document.querySelector('script[src*="analytics.js"]')) return;

    var script = document.createElement('script');
    script.src = base + 'analytics.js';
    script.async = true;
    document.head.appendChild(script);
  }

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch (e) {
      /* ignore */
    }
    loadAnalytics();
    document.querySelectorAll('.m-cookie-consent').forEach(function (banner) {
      banner.classList.remove('is-visible');
      window.setTimeout(function () {
        banner.classList.add('is-hidden');
        banner.remove();
      }, 300);
    });
  }

  function renderBanner() {
    if (document.querySelector('.m-cookie-consent')) return;

    var banner = document.createElement('div');
    banner.className = 'm-cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Согласие на cookie');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML =
      '<div class="m-cookie-consent__panel">' +
      '<span class="m-cookie-consent__dot" aria-hidden="true"></span>' +
      '<p class="m-cookie-consent__text">' +
      'Мы используем cookie для аналитики посещений. Продолжая пользоваться сайтом, вы соглашаетесь с' +
      NBSP +
      '<a href="' +
      privacyHref() +
      '">политикой' +
      NBSP +
      'конфиденциальности</a>.' +
      '</p>' +
      '<button class="m-cookie-consent__accept a-button a-button--s a-button--black" type="button">Принять</button>' +
      '</div>';

    document.body.appendChild(banner);
    applyWidowControl(banner.querySelector('.m-cookie-consent__text'));

    banner.querySelector('.m-cookie-consent__accept').addEventListener('click', accept);

    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  function init() {
    if (isEmbed()) return;

    var accepted = false;
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch (e) {
      /* ignore */
    }

    if (accepted) {
      loadAnalytics();
      return;
    }

    renderBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
