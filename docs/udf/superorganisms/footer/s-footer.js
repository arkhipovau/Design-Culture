(() => {
  const META_DISCLAIMER =
    '* Meta Platforms Inc. признана экстремистской организацией, деятельность которой запрещена на территории РФ.';

  function enhanceExternalLinks() {
    document.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      if (anchor.target === '_blank') return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
    });
  }

  function ensureMetaDisclaimer(footer) {
    if (footer.querySelector('.s-footer__disclaimer')) return;

    const note = document.createElement('p');
    note.className = 's-footer__disclaimer';
    note.textContent = META_DISCLAIMER;
    footer.appendChild(note);
  }

  function enhanceFooter() {
    document.querySelectorAll('.s-footer').forEach((footer) => {
      const grid = footer.querySelector('.s-footer__grid');
      if (!grid) return;

      if (!grid.querySelector('.s-footer__up')) {
        const up = document.createElement('div');
        up.className = 's-footer__up';
        grid.appendChild(up);
      }

      grid.querySelectorAll('.s-footer__up').forEach((up) => {
        if (up.querySelector('.a-arrow-button--up')) return;
        up.innerHTML =
          '<button class="a-arrow-button a-arrow-button--up" type="button" aria-label="Наверх"></button>';
      });

      ensureMetaDisclaimer(footer);
    });

    document.querySelectorAll('.s-footer .s-footer__up .a-arrow-button--up').forEach((btn) => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      enhanceExternalLinks();
      enhanceFooter();
    });
  } else {
    enhanceExternalLinks();
    enhanceFooter();
  }
})();
