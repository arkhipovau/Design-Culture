/**
 * Decorative .a-button inside .m-split-card has pointer-events: none.
 * Mirror hover/press on the card link via is-hover / is-pressed classes.
 */
(() => {
  const cards = document.querySelectorAll('.m-split-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const button = card.querySelector('.a-button');
    if (!button) return;

    const clearPress = () => button.classList.remove('is-pressed');

    card.addEventListener('mouseenter', () => button.classList.add('is-hover'));
    card.addEventListener('mouseleave', () => {
      button.classList.remove('is-hover', 'is-pressed');
    });
    card.addEventListener('mousedown', () => button.classList.add('is-pressed'));
    card.addEventListener('mouseup', clearPress);
    card.addEventListener('mousecancel', clearPress);
    card.addEventListener('blur', () => {
      button.classList.remove('is-hover', 'is-pressed');
    });
  });
})();
