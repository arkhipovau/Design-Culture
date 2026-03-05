(() => {
  const NBSP = '\u00A0';
  const NON_BREAKING_ONE = /(^|[\s\u00A0(«"„“])([вксуоаяи])\s+(?=\S)/giu;
  const NON_BREAKING_TWO =
    /(^|[\s\u00A0(«"„“])(во|не|ни|на|но|по|за|из|от|до|об|со|ко|под|над|при|для|без|про|или|как|же|ли|бы)\s+(?=\S)/giu;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);

  function fixWidows(text) {
    if (!text || !text.includes(' ')) return text;
    return text
      .replace(NON_BREAKING_TWO, (_match, before, word) => `${before}${word}${NBSP}`)
      .replace(NON_BREAKING_ONE, (_match, before, word) => `${before}${word}${NBSP}`);
  }

  function shouldSkipNode(node) {
    let el = node.parentElement;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      el = el.parentElement;
    }
    return false;
  }

  function applyWidowControl(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (shouldSkipNode(node)) continue;
      const current = node.nodeValue;
      const next = fixWidows(current);
      if (next !== current) node.nodeValue = next;
    }
  }

  function setupWidowControl() {
    applyWidowControl(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((added) => {
          if (added.nodeType === Node.ELEMENT_NODE) applyWidowControl(added);
          if (added.nodeType === Node.TEXT_NODE && added.parentElement) applyWidowControl(added.parentElement);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setupWidowControl();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealSelectors = [
    'main section',
    '.card',
    '.split-card',
    '.highlight',
    '.gallery-item',
    '.gallery-slide',
    '.qa-row',
    '.media-item',
    '.media-wide-item',
    '.quote-block',
    '.article-info > div',
    '.footer-grid > div',
    '.footer-bottom',
    '.newsletter-inner',
    '.view-switch',
    '.filters',
    '.share-pill'
  ];

  const revealNodes = Array.from(document.querySelectorAll(revealSelectors.join(',')));
  if (!revealNodes.length) return;

  const markReveal = (el, mode = 'default') => {
    if (!el || el.dataset.revealReady === '1') return;
    el.dataset.revealReady = '1';
    el.dataset.reveal = mode;
    el.classList.add('reveal-ready');
  };

  revealNodes.forEach((el) => {
    if (el.matches('.footer-grid > div, .footer-bottom, .meta, .filters, .view-switch')) {
      markReveal(el, 'soft');
    } else if (el.matches('.gallery-item, .gallery-slide')) {
      markReveal(el, 'scale');
    } else {
      markReveal(el);
    }
  });

  const applyStagger = (containerSelector, childSelector, step = 70, max = 420) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      const items = container.querySelectorAll(childSelector);
      items.forEach((item, idx) => {
        const delay = Math.min(idx * step, max);
        item.style.setProperty('--reveal-delay', `${delay}ms`);
      });
    });
  };

  applyStagger('.cards-grid', '.card', 70, 420);
  applyStagger('.highlight-row', '.highlight', 100, 280);
  applyStagger('.gallery-strip', 'img', 45, 260);
  applyStagger('.gallery-grid', '.gallery-item', 45, 340);
  applyStagger('.footer-grid', 'div', 70, 300);
  applyStagger('.qa-list', '.qa-row', 60, 280);

  const heroIntro = document.querySelector('.hero-intro');
  if (heroIntro) {
    const updateHeroTextProgress = () => {
      const rect = heroIntro.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const start = viewportHeight * 0.92;
      const end = viewportHeight * 0.28;
      const raw = (start - rect.top) / (start - end);
      const clamped = Math.max(0, Math.min(1, raw));
      const eased = clamped * clamped * (3 - 2 * clamped);
      heroIntro.style.setProperty('--hero-text-progress', eased.toFixed(4));
    };

    if (reduced) {
      heroIntro.style.setProperty('--hero-text-progress', '1');
    } else {
      let heroTicking = false;
      const onHeroScroll = () => {
        if (heroTicking) return;
        heroTicking = true;
        requestAnimationFrame(() => {
          updateHeroTextProgress();
          heroTicking = false;
        });
      };

      updateHeroTextProgress();
      window.addEventListener('scroll', onHeroScroll, { passive: true });
      window.addEventListener('resize', onHeroScroll);
      window.addEventListener('orientationchange', onHeroScroll);
    }
  }

  if (reduced) {
    document.querySelectorAll('.reveal-ready').forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  document.querySelectorAll('.reveal-ready').forEach((el) => observer.observe(el));

  const floats = Array.from(document.querySelectorAll('.hero-float'));
  if (floats.length) {
    const speeds = [0.035, -0.02, 0.028];
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      floats.forEach((el, idx) => {
        const dy = y * (speeds[idx % speeds.length]);
        el.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
