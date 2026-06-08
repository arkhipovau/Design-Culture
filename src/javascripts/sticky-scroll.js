(function () {
  function normalize(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function truncate(value, max) {
    var text = normalize(value);
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 3)).trimEnd() + '...';
  }

  function getMaxLength() {
    return window.innerWidth <= 780 ? 26 : 44;
  }

  function getPageTitle() {
    var explicit = document.body.getAttribute('data-reading-page');
    if (explicit) return normalize(explicit);

    var h1 = document.querySelector('main h1, h1');
    var title = normalize(h1 ? h1.textContent : '');
    if (!title) {
      title = normalize(document.title.replace(/\s*[–-]\s*deFindings.*$/i, ''));
    }
    if (title && !/deFindings/i.test(title)) title += ' deFindings';
    return title || 'deFindings';
  }

  function ensureIndicator() {
    var indicator = document.querySelector('.a-sticky-scroll-wrap');
    if (indicator) return indicator;

    indicator = document.createElement('div');
    indicator.className = 'a-sticky-scroll-wrap';
    indicator.innerHTML =
      '<div class="a-sticky-scroll">' +
      '<span class="a-sticky-scroll__rec" aria-hidden="true"></span>' +
      '<span class="a-sticky-scroll__content">' +
      '<span class="a-sticky-scroll__dot" aria-hidden="true"></span>' +
      '<span class="a-sticky-scroll__text">' +
      '<span class="a-sticky-scroll__prefix">Вы читаете</span>' +
      '<span class="a-sticky-scroll__current"></span>' +
      '</span>' +
      '</span>' +
      '</div>';
    document.body.appendChild(indicator);
    return indicator;
  }

  function setupStickyReading() {
    var indicator = ensureIndicator();
    var current = indicator.querySelector('.a-sticky-scroll__current');
    var rec = indicator.querySelector('.a-sticky-scroll__rec');
    if (!current || !rec) return;

    current.classList.add('sticky-current');

    var rawTitle = getPageTitle();

    function renderTitle() {
      var max = getMaxLength();
      var value = truncate(rawTitle, max);
      current.textContent = '«' + value + '»';
      current.setAttribute('title', rawTitle);
    }

    var ticking = false;
    function renderProgress() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || window.pageYOffset || 0;
      var maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      var progress = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
      rec.style.width = (progress * 100).toFixed(2) + '%';
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(renderProgress);
    }

    renderTitle();
    renderProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      renderTitle();
      renderProgress();
    });
  }

  document.addEventListener('DOMContentLoaded', setupStickyReading);
})();
