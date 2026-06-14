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
    'main section:not(.o-journal-listing):not(.m-page-hero):not(.o-interview-hero):not(.o-hero-intro):not(:has(.o-gallery-listing__grid))',
    '.o-home-history',

    '.m-qa-row',
    '.m-quote-block',
    '.m-article-info__col',
    '.s-footer__grid > div:not(.s-footer__up)',
    '.o-newsletter-block__inner',
    '.o-journal-page .m-journal-card',
    '.o-gallery-page .m-gallery-card'
  ];

  const revealNodes = Array.from(document.querySelectorAll(revealSelectors.join(',')));

  const setupHeroIntro = () => {
    const heroIntro = document.querySelector('.o-hero-intro');
    if (!heroIntro) return;

    const overLayer = heroIntro.querySelector('.o-hero-intro__over');
    const isAboutHero = heroIntro.classList.contains('o-hero-intro--about');
    const pillsLayer = isAboutHero
      ? heroIntro.querySelector('.o-hero-intro__pills')
      : null;

    const syncVisiblePillProgress = (token, value) => {
      if (!pillsLayer || !token.classList.contains('o-hero-intro__pill')) return;
      const variant = [...token.classList].find((cls) => /^o-hero-intro__pill--[a-z]$/.test(cls));
      if (!variant) return;
      const visiblePill = pillsLayer.querySelector(`.o-hero-intro__pill.${variant}`);
      if (visiblePill) visiblePill.style.setProperty('--p', value);
    };

    const setAllVisiblePillProgress = (value) => {
      if (!pillsLayer) return;
      pillsLayer.querySelectorAll('.o-hero-intro__pill').forEach((pill) => {
        pill.style.setProperty('--p', value);
      });
    };

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
        ? Array.from(overLayer.querySelectorAll('.o-hero-intro__word, .o-hero-intro__pill')).filter(isHeroTokenVisible)
        : []
    );

    let tokens = getHeroTokens();
    let N = Math.max(tokens.length, 1);
    let waveWidth = 0.8 / N + 0.04;

    const applyHeroWave = (globalP) => {
      for (let i = 0; i < N; i += 1) {
        const itemStart = (i / N) * 0.8;
        const local = (globalP - itemStart) / waveWidth;
        const p = local < 0 ? 0 : local > 1 ? 1 : local;
        const eased = p * p * (3 - 2 * p);
        const pValue = eased.toFixed(3);
        tokens[i].style.setProperty('--p', pValue);
        syncVisiblePillProgress(tokens[i], pValue);
      }
    };

    const updateHeroReveal = () => {
      const rect = heroIntro.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 1;

      const start = vh * 0.7;
      const end = vh * 0.15;
      const span = start - end;
      const rawG = (start - rect.top) / span;
      const globalP = rawG < 0 ? 0 : rawG > 1 ? 1 : rawG;

      applyHeroWave(globalP);
    };

    const refreshHeroTokens = () => {
      tokens = getHeroTokens();
      N = Math.max(tokens.length, 1);
      waveWidth = 0.8 / N + 0.04;
    };

    if (reduced) {
      tokens.forEach((el) => el.style.setProperty('--p', '1'));
      setAllVisiblePillProgress('1');
    } else if (isAboutHero) {
      const WAVE_DURATION_MS = 5600;
      let waveStart = null;
      let waveProgress = 0;
      let waveRaf = 0;

      const runAboutHeroWave = (now) => {
        if (!waveStart) waveStart = now;
        waveProgress = Math.min((now - waveStart) / WAVE_DURATION_MS, 1);
        applyHeroWave(waveProgress);
        if (waveProgress < 1) {
          waveRaf = requestAnimationFrame(runAboutHeroWave);
        }
      };

      refreshHeroTokens();
      tokens.forEach((el) => el.style.setProperty('--p', '0'));
      setAllVisiblePillProgress('0');
      waveRaf = requestAnimationFrame(runAboutHeroWave);

      window.addEventListener('resize', () => {
        refreshHeroTokens();
        applyHeroWave(waveProgress);
      });
      window.addEventListener('orientationchange', () => {
        refreshHeroTokens();
        applyHeroWave(waveProgress);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && waveRaf) {
          cancelAnimationFrame(waveRaf);
          waveRaf = 0;
        } else if (document.visibilityState === 'visible' && waveProgress < 1 && !waveRaf) {
          waveStart = performance.now() - waveProgress * WAVE_DURATION_MS;
          waveRaf = requestAnimationFrame(runAboutHeroWave);
        }
      });
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
      updateHeroReveal();
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
  };

  setupHeroIntro();

  const CARD_SELECTOR = '.m-journal-card, .m-gallery-card';
  const IMAGE_SELECTOR =
    '.a-image-journal-link img, .m-gallery-card__media img, .m-photo-slot__image img, .m-photo-slot__image video, .m-interview-portrait img';
  const PARENT_SELECTOR =
    '.a-image-journal-link, .m-gallery-card__media, .m-photo-slot__image, .m-interview-portrait';

  const getImageParent = (img) => {
    const parent = img.closest(PARENT_SELECTOR);
    if (!parent) return null;
    if (parent.closest('.m-photo-slot--placeholder, .m-interview-portrait--placeholder')) return null;
    return parent;
  };

  const markCardLoaded = (card) => {
    if (!card || card.classList.contains('is-loaded')) return;
    if (reduced) {
      card.classList.add('is-loaded');
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add('is-loaded');
      });
    });
  };

  const markImageLoaded = (card, parent) => {
    if (parent) {
      parent.classList.remove('is-image-loading');
      parent.classList.add('is-image-loaded');
    }
    markCardLoaded(card);
  };

  const startImageLoading = (parent) => {
    if (!parent || parent.classList.contains('is-image-loaded')) return;
    parent.classList.add('is-image-loading');
    parent.classList.remove('is-image-loaded');
  };

  const whenImageReady = (media, done) => {
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      done();
    };

    if (media.tagName === 'VIDEO') {
      if (media.readyState >= 2) {
        finish();
        return;
      }
      media.addEventListener('loadeddata', finish, { once: true });
      media.addEventListener('error', finish, { once: true });
      return;
    }

    if (typeof media.decode === 'function') {
      media.decode().then(finish).catch(finish);
      return;
    }

    if (media.complete && media.naturalWidth > 0) {
      finish();
      return;
    }

    media.addEventListener('load', finish, { once: true });
    media.addEventListener('error', finish, { once: true });
  };

  const watchImage = (img) => {
    if (!img || img.dataset.imageLoadWatched === '1') return;
    img.dataset.imageLoadWatched = '1';

    const parent = getImageParent(img);
    const card = img.closest(CARD_SELECTOR);

    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

    if (!parent) {
      markCardLoaded(card);
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      markImageLoaded(card, parent);
      return;
    }

    startImageLoading(parent);
    whenImageReady(img, () => markImageLoaded(card, parent));
  };

  const scanImages = (root) => {
    if (!root) return;
    let nodes = [];
    if (root.matches && root.matches('img, video')) {
      nodes = [root];
    } else if (root.querySelectorAll) {
      nodes = Array.from(root.querySelectorAll(IMAGE_SELECTOR));
    }
    nodes.forEach(watchImage);
  };

  scanImages(document);
  const imageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) scanImages(node);
      });
    });
  });
  imageObserver.observe(document.body, { childList: true, subtree: true });

  if (!revealNodes.length) return;

  const markReveal = (el, mode = 'default') => {
    if (!el || el.dataset.revealReady === '1') return;
    el.dataset.revealReady = '1';
    el.dataset.reveal = mode;
    el.classList.add('reveal-ready');
  };

  revealNodes.forEach((el) => {
    if (el.matches('.s-footer__grid > div:not(.s-footer__up), .m-article-info__col')) {
      markReveal(el, 'soft');
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

  applyStagger('.o-journal-listing__grid', '.m-journal-card', 70, 420);
  applyStagger('.o-gallery-listing__grid', '.m-gallery-card', 45, 340);
  applyStagger('.s-footer__grid', 'div:not(.s-footer__up)', 70, 300);
  applyStagger('.m-interview-section__body', '.m-qa-row', 60, 280);

  document.querySelectorAll('.o-hero-sphere__frame').forEach((iframe) => {
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
