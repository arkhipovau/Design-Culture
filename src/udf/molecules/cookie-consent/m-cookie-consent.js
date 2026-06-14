(() => {
  const STORAGE_KEY = 'defindings-cookie-consent';
  const NBSP = '\u00A0';
  const NON_BREAKING_ONE = /(^|[\s\u00A0(«"„“])([вксуоаяи])\s+(?=\S)/giu;
  const NON_BREAKING_TWO =
    /(^|[\s\u00A0(«"„“])(во|не|ни|на|но|по|за|из|от|до|об|со|ко|под|над|при|для|без|про|или|как|же|ли|бы)\s+(?=\S)/giu;

  function fixWidows(text) {
    if (!text || text.indexOf(' ') === -1) return text;
    return text
      .replace(NON_BREAKING_TWO, (_match, before, word) => before + word + NBSP)
      .replace(NON_BREAKING_ONE, (_match, before, word) => before + word + NBSP);
  }

  function applyWidowControl(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const next = fixWidows(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
      node = walker.nextNode();
    }
  }

  function isEmbed() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  function privacyHref() {
    const path = window.location.pathname || '';
    if (path.includes('/interviews/')) return '../privacy.html';
    if (path.includes('/pages/')) return './privacy.html';
    return './pages/privacy.html';
  }

  function analyticsSrc() {
    const path = window.location.pathname || '';
    if (path.includes('/interviews/')) return '../../udf/molecules/cookie-consent/analytics.js';
    if (path.includes('/pages/')) return '../udf/molecules/cookie-consent/analytics.js';
    return './udf/molecules/cookie-consent/analytics.js';
  }

  function loadAnalytics() {
    const src = analyticsSrc();
    if (document.querySelector(`script[src="${src}"]`) || document.querySelector('script[src*="analytics.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {}

    loadAnalytics();

    document.querySelectorAll('.m-cookie-consent').forEach((banner) => {
      banner.classList.remove('is-visible');
      window.setTimeout(() => {
        banner.classList.add('is-hidden');
        banner.remove();
      }, 300);
    });
  }

  function renderBanner() {
    if (document.querySelector('.m-cookie-consent')) return;

    const banner = document.createElement('div');
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

    window.requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });
  }

  function init() {
    if (isEmbed()) return;

    let accepted = false;
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch {}

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
