(function () {
  function setupLikeButton(btn) {
    if (!btn || btn.dataset.likeBound === '1') return;
    btn.dataset.likeBound = '1';

    const countEl = btn.querySelector('.a-like-button__count');
    const parsed = Number.parseInt(btn.dataset.count || (countEl ? countEl.textContent : '0'), 10);
    const baseCount = Number.isFinite(parsed) ? parsed : 0;

    function render() {
      const liked = btn.classList.contains('is-liked') || btn.getAttribute('aria-pressed') === 'true';
      btn.classList.toggle('is-liked', liked);
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      if (countEl) {
        countEl.textContent = String(baseCount + (liked ? 1 : 0));
      }
    }

    render();

    btn.addEventListener('click', function () {
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
      const liked = btn.classList.contains('is-liked');
      btn.classList.toggle('is-liked', !liked);
      render();
    });
  }

  document.querySelectorAll('.a-like-button').forEach(setupLikeButton);

  window.setupLikeButton = setupLikeButton;
})();
