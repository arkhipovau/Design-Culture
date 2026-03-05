(function () {
  function buildSlider(el, total, activeIndex) {
    if (!el) return;
    const steps = Math.max(1, total || 9);
    const active = Math.min(steps - 1, Math.max(0, activeIndex || 4));

    el.innerHTML = '';
    for (let i = 0; i < steps; i += 1) {
      const n = document.createElement('span');
      n.className = i === active ? 'a-slider__active' : 'a-slider__dot';
      n.setAttribute('aria-hidden', 'true');
      el.appendChild(n);
    }
  }

  document.querySelectorAll('.a-slider[data-auto]').forEach((el) => {
    const total = Number.parseInt(el.getAttribute('data-total') || '9', 10);
    const active = Number.parseInt(el.getAttribute('data-active') || '4', 10);
    buildSlider(el, total, active);
  });

  window.ASlider = { buildSlider };
})();
