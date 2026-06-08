(function () {
  var STORAGE_KEY = 'defindings-cookie-consent';

  function scriptsBase() {
    var script = document.currentScript;
    if (script && script.src) {
      return script.src.replace(/\/cookie-consent\.js.*$/, '/');
    }
    return 'javascripts/';
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
    var banner = document.querySelector('.m-cookie-consent');
    if (banner) {
      banner.classList.remove('is-visible');
      window.setTimeout(function () {
        banner.classList.add('is-hidden');
        banner.remove();
      }, 300);
    }
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
      'Мы используем cookie для аналитики посещений. Продолжая пользоваться сайтом, вы соглашаетесь с ' +
      '<a href="' +
      privacyHref() +
      '">политикой конфиденциальности</a>.' +
      '</p>' +
      '<button class="m-cookie-consent__accept a-button a-button--s a-button--black" type="button">Принять</button>' +
      '</div>';

    document.body.appendChild(banner);

    banner.querySelector('.m-cookie-consent__accept').addEventListener('click', accept);

    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  function init() {
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
