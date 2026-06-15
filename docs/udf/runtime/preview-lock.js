(function () {
  var params = new URLSearchParams(window.location.search);
  if (!params.has('preview')) return;

  var root = document.documentElement;
  root.classList.add('is-preview-lock');

  var robots = document.createElement('meta');
  robots.name = 'robots';
  robots.content = 'noindex, nofollow';
  document.head.appendChild(robots);

  var banner = document.createElement('div');
  banner.className = 'm-preview-lock-banner';
  banner.setAttribute('role', 'status');
  banner.textContent = 'Режим проверки: переходы на другие страницы сайта отключены';
  document.body.prepend(banner);

  function isInternalLeave(href) {
    if (!href || href === '#') return false;
    if (href.charAt(0) === '#') return false;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (_) {
      return true;
    }

    if (url.origin !== window.location.origin) return false;
    return url.pathname !== window.location.pathname;
  }

  function markBlockedLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.toggle('is-preview-blocked', isInternalLeave(href));
    });
  }

  document.addEventListener(
    'click',
    function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!isInternalLeave(href)) return;

      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  markBlockedLinks();

  var observer = new MutationObserver(markBlockedLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();
