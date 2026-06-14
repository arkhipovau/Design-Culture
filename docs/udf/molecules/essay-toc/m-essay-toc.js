/* TOC for History essays.
 *
 * Highlight logic: the active item is the section whose top edge is closest
 * to a "target line" near the top of the viewport (≈ 20% from the top), but
 * still above it. Walking sections in DOM order, we pick the last one whose
 * top has already crossed the target line — i.e. the section the reader is
 * actually inside, not whichever section happens to be intersecting.
 *
 * Anchor click sets the highlight immediately and *suspends* scroll-driven
 * updates for ~1.2s so the smooth-scroll the browser is performing cannot
 * steal the highlight to a neighbouring section as it slides past.
 */

(() => {
  const tocs = document.querySelectorAll('.m-essay-toc');
  if (!tocs.length) return;

  tocs.forEach((toc) => {
    const items = Array.from(toc.querySelectorAll('.m-essay-toc__item'));
    if (!items.length) return;

    const sectionList = []; // ordered: { section, item }
    const idMap = new Map();

    items.forEach((item) => {
      const link = item.querySelector('.m-essay-toc__link');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : '';
      if (!id) return;
      const section = document.getElementById(id);
      if (section) {
        sectionList.push({ section, item });
        idMap.set(id, item);
      }
    });

    if (!sectionList.length) return;

    const setActive = (item) => {
      if (!item) return;
      items.forEach((i) => i.classList.toggle('is-active', i === item));
    };

    let suspendUntil = 0;

    const updateFromScroll = () => {
      if (performance.now() < suspendUntil) return;
      const targetY = (window.innerHeight || 1) * 0.2;
      let activeItem = sectionList[0].item; // fallback for top of page
      for (const { section, item } of sectionList) {
        const top = section.getBoundingClientRect().top;
        if (top - targetY <= 1) {
          activeItem = item;
        } else {
          break; // sections are in DOM order — once we cross target, stop.
        }
      }
      setActive(activeItem);
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateFromScroll();
        rafId = 0;
      });
    };

    // Click on a TOC link: immediate highlight, suspend scroll tracking
    // long enough for smooth-scroll to settle.
    items.forEach((item) => {
      const link = item.querySelector('.m-essay-toc__link');
      if (!link) return;
      link.addEventListener('click', () => {
        setActive(item);
        suspendUntil = performance.now() + 1200;
      });
    });

    // Browser-driven hash changes (back/forward, deep link).
    const onHash = () => {
      const id = (window.location.hash || '').replace('#', '');
      if (!id) return;
      const item = idMap.get(id);
      if (item) {
        setActive(item);
        suspendUntil = performance.now() + 1200;
      }
    };
    window.addEventListener('hashchange', onHash);

    // Initial state.
    if (window.location.hash) {
      onHash();
    } else {
      updateFromScroll();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  });
})();
