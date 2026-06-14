(() => {
  function markMenuNodes() {
    document.querySelectorAll('.s-menu__layer, .s-menu__search-layer').forEach((el) => {
      el.classList.add('s-menu');
    });
  }

  function boot() {
    markMenuNodes();
    const observer = new MutationObserver(markMenuNodes);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
