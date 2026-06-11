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
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  const revealSelectors = [
    'main section:not(.interviews-journal):not(.journal-hero):not(.gallery-hero):not(.interview-hero):not(.about-intro):not(:has(.gallery-grid))',
    '.card',
    '.highlight',

    '.gallery-slide',
    '.m-qa-row',
    '.m-quote-block',
    '.m-article-info > div',
    '.footer-grid > div',
    '.newsletter-inner',
    '.journal-page .m-journal-card',
    '.gallery-page .m-gallery-card'
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
    if (el.matches('.footer-grid > div, .meta')) {
      markReveal(el, 'soft');
    } else if (el.matches('.gallery-slide')) {
      markReveal(el, 'scale');
    } else {
      markReveal(el);
    }
  });

  const applyStagger = (containerSelector, childSelector, step = 70, max = 420) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      const items = container.querySelectorAll(childSelector);
      items.forEach((item, idx) => {
        const scaledStep = isMobile ? Math.max(20, Math.round(step * 0.45)) : step;
        const scaledMax = isMobile ? Math.max(80, Math.round(max * 0.4)) : max;
        const delay = Math.min(idx * scaledStep, scaledMax);
        item.style.setProperty('--reveal-delay', `${delay}ms`);
      });
    });
  };

  applyStagger('.cards-grid', '.card', 70, 420);
  applyStagger('.journal-grid', '.m-journal-card', 70, 420);
  applyStagger('.gallery-grid', '.m-gallery-card', 45, 340);
  applyStagger('.highlight-row', '.highlight', 100, 280);
  applyStagger('.gallery-strip', 'img', 45, 260);
  applyStagger('.footer-grid', 'div', 70, 300);
  applyStagger('.m-interview-section__body', '.m-qa-row', 60, 280);

  document.querySelectorAll('.sphere-frame').forEach((iframe) => {
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      iframe.classList.add('is-loaded');
    };

    window.addEventListener('message', (event) => {
      if (event.source !== iframe.contentWindow) return;
      if (event.data && event.data.type === 'sphere-ready') reveal();
    });

    iframe.addEventListener('load', () => {
      setTimeout(reveal, 4500);
    }, { once: true });

    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setTimeout(reveal, 4500);
    }
  });

  const heroIntro = document.querySelector('.hero-intro');
  if (heroIntro) {
    const overLayer = heroIntro.querySelector('.hero-over');

    const isHeroTokenVisible = (el) => {
      let node = el;
      while (node && node !== overLayer) {
        if (window.getComputedStyle(node).display === 'none') return false;
        node = node.parentElement;
      }
      return true;
    };

    const getHeroTokens = () => (
      overLayer
        ? Array.from(overLayer.querySelectorAll('.hero-word, .hero-pill')).filter(isHeroTokenVisible)
        : []
    );

    let tokens = getHeroTokens();
    let N = Math.max(tokens.length, 1);
    let waveWidth = 0.8 / N + 0.04;

    const updateHeroReveal = () => {
      const rect = heroIntro.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 1;

      const start = vh * 0.7;
      const end = vh * 0.15;
      const span = start - end;
      const rawG = (start - rect.top) / span;
      const globalP = rawG < 0 ? 0 : rawG > 1 ? 1 : rawG;

      for (let i = 0; i < N; i += 1) {

        const itemStart = (i / N) * 0.8;
        const local = (globalP - itemStart) / waveWidth;
        const p = local < 0 ? 0 : local > 1 ? 1 : local;
        const eased = p * p * (3 - 2 * p);
        tokens[i].style.setProperty('--p', eased.toFixed(3));
      }
    };

    const refreshHeroTokens = () => {
      tokens = getHeroTokens();
      N = Math.max(tokens.length, 1);
      waveWidth = 0.8 / N + 0.04;
      updateHeroReveal();
    };

    if (reduced) {
      tokens.forEach((el) => el.style.setProperty('--p', '1'));
    } else {
      let heroTicking = false;
      const onHeroScroll = () => {
        if (heroTicking) return;
        heroTicking = true;
        requestAnimationFrame(() => {
          updateHeroReveal();
          heroTicking = false;
        });
      };

      refreshHeroTokens();
      window.addEventListener('scroll', onHeroScroll, { passive: true });
      window.addEventListener('resize', () => {
        refreshHeroTokens();
        onHeroScroll();
      });
      window.addEventListener('orientationchange', () => {
        refreshHeroTokens();
        onHeroScroll();
      });
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
      threshold: isMobile ? 0.01 : 0.14,
      rootMargin: isMobile ? '0px 0px 18% 0px' : '0px 0px -8% 0px'
    }
  );

  document.querySelectorAll('.reveal-ready').forEach((el) => observer.observe(el));

})();
