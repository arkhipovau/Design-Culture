(function () {
  var chips = Array.from(document.querySelectorAll('.a-tag[data-filter]'));
  var cards = Array.from(document.querySelectorAll('.m-journal-card[data-tags]'));
  var activeFilters = new Set();

  function getChipFilter(chip) {
    return (chip.getAttribute('data-filter') || 'all').toLowerCase();
  }

  function collectExistingTags() {
    var existing = new Set();
    cards.forEach(function (card) {
      var tagText = (card.getAttribute('data-tags') || '').toLowerCase().trim();
      if (!tagText) return;
      tagText.split(/\s+/).forEach(function (tag) {
        if (tag) existing.add(tag);
      });
    });
    return existing;
  }

  function syncChipAvailability() {
    var existingTags = collectExistingTags();
    chips.forEach(function (chip) {
      var value = getChipFilter(chip);
      if (value === 'all') return;
      var isAvailable = existingTags.has(value);
      chip.classList.toggle('is-enabled', !isAvailable);
      chip.setAttribute('aria-enabled', isAvailable ? 'false' : 'true');
      if (!isAvailable) activeFilters.delete(value);
    });
  }

  function syncChipStates() {
    chips.forEach(function (chip) {
      var value = getChipFilter(chip);
      var isEnabled = chip.classList.contains('is-enabled');
      var isActive = !isEnabled && (value === 'all' ? activeFilters.size === 0 : activeFilters.has(value));
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyFilters() {
    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').toLowerCase();
      if (activeFilters.size === 0) {
        card.style.display = '';
        return;
      }
      var isVisible = Array.from(activeFilters).some(function (value) {
        return tags.indexOf(value) !== -1;
      });
      card.style.display = isVisible ? '' : 'none';
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (chip.classList.contains('is-enabled')) return;
      var value = getChipFilter(chip);
      if (value === 'all') {
        activeFilters.clear();
      } else if (activeFilters.has(value)) {
        activeFilters.delete(value);
      } else {
        activeFilters.add(value);
      }
      syncChipStates();
      applyFilters();
    });
  });

  syncChipAvailability();
  syncChipStates();
  applyFilters();
})();
