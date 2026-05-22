(function () {
  document.querySelectorAll('.m-journal-card[data-href]').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      window.location.href = card.getAttribute('data-href');
    });
  });
})();
