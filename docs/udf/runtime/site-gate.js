(function () {
  'use strict';

  var CONFIG = {
    enabled: true,
    password: '1977',
    storageKey: 'defindings-site-unlock-v2',
    bypass: [/^\/sphere-embed\/?$/i, /^\/sphere-test\/?$/i]
  };

  function isBypass() {
    var path = window.location.pathname || '';
    return CONFIG.bypass.some(function (pattern) {
      return pattern.test(path);
    });
  }

  function isUnlocked() {
    if (!CONFIG.enabled) return true;
    try {
      return window.sessionStorage.getItem(CONFIG.storageKey) === '1';
    } catch (_) {
      return false;
    }
  }

  function isHomePage() {
    var path = window.location.pathname || '/';
    return path === '/' || path === '/index.html';
  }

  function addRobotsNoIndex() {
    if (document.querySelector('meta[name="robots"][content*="noindex"]')) return;
    var robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
  }

  function ensureLockStyle() {
    if (document.getElementById('site-gate-lock-style')) return;
    var style = document.createElement('style');
    style.id = 'site-gate-lock-style';
    style.textContent =
      'html.is-site-gated body{visibility:hidden}' +
      'html.is-site-gated.is-site-gate-home .o-hero-sphere,html.is-site-gated .o-site-gate{visibility:visible}';
    document.head.appendChild(style);
  }

  function blockNavigation() {
    document.addEventListener(
      'click',
      function (event) {
        if (!document.documentElement.classList.contains('is-site-gated')) return;
        var link = event.target.closest('a[href], button[type="submit"]:not(.o-site-gate__submit)');
        if (!link || link.closest('.o-site-gate')) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );
  }

  function mountGateUi() {
    if (document.getElementById('site-gate-root')) return;

    var root = document.createElement('div');
    root.className = 'o-site-gate';
    root.id = 'site-gate-root';
    root.innerHTML =
      '<div class="o-site-gate__panel" role="dialog" aria-labelledby="site-gate-title" aria-describedby="site-gate-text">' +
      '<div class="o-site-gate__head">' +
      '<p class="o-site-gate__title" id="site-gate-title">Сайт строится</p>' +
      '<p class="o-site-gate__text" id="site-gate-text">Мы готовим первую версию deFindings. Скоро вернёмся.</p>' +
      '</div>' +
      '<form class="o-site-gate__form" autocomplete="off">' +
      '<div class="o-site-gate__field">' +
      '<input class="o-site-gate__input" type="password" inputmode="numeric" autocomplete="current-password" aria-label="Пароль доступа" placeholder="Пароль" />' +
      '</div>' +
      '<button class="a-button a-button--s a-button--black o-site-gate__submit" type="submit">Войти</button>' +
      '<p class="o-site-gate__error" hidden>Неверный пароль</p>' +
      '</form>' +
      '</div>';

    document.body.appendChild(root);

    var form = root.querySelector('.o-site-gate__form');
    var input = root.querySelector('.o-site-gate__input');
    var error = root.querySelector('.o-site-gate__error');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (input.value === CONFIG.password) {
        try {
          window.sessionStorage.setItem(CONFIG.storageKey, '1');
        } catch (_) {}
        window.location.reload();
        return;
      }
      error.hidden = false;
      input.select();
    });
  }

  function activateGate() {
    ensureLockStyle();
    document.documentElement.classList.add('is-site-gated');
    if (isHomePage()) {
      document.documentElement.classList.add('is-site-gate-home');
    }
    addRobotsNoIndex();
    blockNavigation();

    if (document.body) {
      mountGateUi();
      return;
    }

    document.addEventListener('DOMContentLoaded', mountGateUi, { once: true });
  }

  if (!CONFIG.enabled || isUnlocked() || isBypass()) return;

  if (!isHomePage()) {
    ensureLockStyle();
    document.documentElement.classList.add('is-site-gated');
    addRobotsNoIndex();
    window.location.replace('/');
    return;
  }

  activateGate();
})();
