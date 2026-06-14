(() => {
  document.querySelectorAll('.m-split-card').forEach((card) => {
    if (card.dataset.splitLinksBound === '1') return;
    card.dataset.splitLinksBound = '1';

    if (!card.querySelector('.a-button')) return;

    card.addEventListener('mouseenter', () => card.classList.add('is-hover'));
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-hover', 'is-pressed');
    });
    card.addEventListener('mousedown', () => card.classList.add('is-pressed'));
    card.addEventListener('mouseup', () => card.classList.remove('is-pressed'));
    card.addEventListener('mousecancel', () => card.classList.remove('is-pressed'));
    card.addEventListener('blur', () => {
      card.classList.remove('is-hover', 'is-pressed');
    });
  });
})();
