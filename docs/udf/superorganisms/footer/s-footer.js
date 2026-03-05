(() => {
  function enhanceFooter() {
    document.querySelectorAll('.footer').forEach((footer) => {
      footer.classList.add('s-footer');

      const grid = footer.querySelector('.footer-grid');
      if (!grid) return;

      if (!grid.querySelector('.footer-up')) {
        const up = document.createElement('div');
        up.className = 'footer-up';
        up.innerHTML = '<button class="a-arrow-button a-arrow-button--up" type="button" aria-label="Наверх"></button>';
        grid.appendChild(up);
      }

      const tg = grid.querySelector('.footer-link-icon');
      if (tg) {
        tg.classList.remove('footer-link-icon');
        tg.innerHTML = 'Telegram';
      }
    });

    document.querySelectorAll('.footer .footer-up .a-arrow-button--up').forEach((btn) => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceFooter);
  } else {
    enhanceFooter();
  }
})();
