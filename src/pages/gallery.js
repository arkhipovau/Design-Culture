(function () {
  var data = window.deFindingsGalleryData || { entries: [] };
  var entries = (data.entries || []).map(function (e) {
    return {
      src: e.src,
      author: e.author || '',
      project: e.project || e.subtitle || '',
      subtitle: e.subtitle || '',
      href: e.href || '#'
    };
  });

  var tableView = document.getElementById('tableView');
  var tableBtn = document.getElementById('tableBtn');
  var sliderBtn = document.getElementById('sliderBtn');

  var EAGER_CARDS = 6;
  var fragment = document.createDocumentFragment();

  entries.forEach(function (item, idx) {
    var card = document.createElement('a');
    card.className = 'm-gallery-card';
    card.href = item.href;
    card.setAttribute('data-gallery-index', idx);

    var img = document.createElement('img');
    img.decoding = 'async';
    img.alt = item.author || '';
    img.loading = idx < EAGER_CARDS ? 'eager' : 'lazy';
    if (idx < EAGER_CARDS) {
      try {
        img.fetchPriority = 'high';
      } catch (_) {}
    }
    img.src = item.src;

    var markLoaded = function () {
      if (!img.naturalWidth) return;
      img.setAttribute('width', img.naturalWidth);
      img.setAttribute('height', img.naturalHeight);
      card.classList.add('is-loaded');
    };

    img.addEventListener('load', markLoaded);

    var media = document.createElement('span');
    media.className = 'm-gallery-card__media';
    media.appendChild(img);

    var go = document.createElement('span');
    go.className = 'm-gallery-card__go a-arrow-button a-arrow-button--corner';
    go.setAttribute('aria-hidden', 'true');
    media.appendChild(go);

    card.appendChild(media);

    if (img.complete) markLoaded();

    var overlay = document.createElement('span');
    overlay.className = 'm-gallery-card__overlay';
    card.appendChild(overlay);

    card.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activate('slider');
      openLightbox(idx);
    });

    fragment.appendChild(card);
  });

  if (tableView) tableView.appendChild(fragment);

  function activate(mode) {
    var isTable = mode === 'table';
    if (tableBtn) {
      tableBtn.classList.toggle('is-active', isTable);
      tableBtn.setAttribute('aria-selected', isTable ? 'true' : 'false');
    }
    if (sliderBtn) {
      sliderBtn.classList.toggle('is-active', !isTable);
      sliderBtn.setAttribute('aria-selected', isTable ? 'false' : 'true');
    }
  }

  if (tableBtn) {
    tableBtn.addEventListener('click', function () {
      activate('table');
      closeLightbox();
    });
  }

  if (sliderBtn) {
    sliderBtn.addEventListener('click', function () {
      activate('slider');
      openLightbox(currentIndex || 0);
    });
  }

  var lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) return;

  var lbImage = lightbox.querySelector('.s-gallery-lightbox__image');
  var lbImageLink = lightbox.querySelector('.s-gallery-lightbox__image-link');
  var lbCaption = lightbox.querySelector('.s-gallery-lightbox__caption');
  var lbAuthorLink = lightbox.querySelector('.s-gallery-lightbox__author-link');
  var lbSubtitle = lightbox.querySelector('.s-gallery-lightbox__subtitle');
  var lbClose = lightbox.querySelector('.s-gallery-lightbox__close');
  var lbBackdrop = lightbox.querySelector('.s-gallery-lightbox__backdrop');
  var lbThumbs = lightbox.querySelector('.s-gallery-lightbox__thumbs');
  var lbNames = lightbox.querySelector('.s-gallery-lightbox__names');

  var currentIndex = 0;
  var thumbButtons = [];
  var nameButtons = [];
  var groupElements = [];
  var groups = [];
  var authorFirstIndex = {};
  var uiBuilt = false;
  var wheelLock = false;
  var switchTimer = null;

  function buildGroups() {
    var map = {};
    var order = [];
    entries.forEach(function (item, idx) {
      var key = item.author || 'Без автора';
      if (!map[key]) {
        map[key] = { author: key, indices: [] };
        order.push(key);
        authorFirstIndex[key] = idx;
      }
      map[key].indices.push(idx);
    });
    groups = order.map(function (key) {
      return map[key];
    });
  }

  function ensureThumbSrc(idx) {
    var btn = thumbButtons[idx];
    if (!btn) return;
    var img = btn.querySelector('img');
    if (!img || img.dataset.srcLoaded === '1') return;
    img.src = entries[idx].src;
    img.dataset.srcLoaded = '1';
  }

  function loadGroupThumbs(author) {
    var group = null;
    for (var i = 0; i < groups.length; i += 1) {
      if (groups[i].author === author) {
        group = groups[i];
        break;
      }
    }
    if (!group) return;
    group.indices.forEach(ensureThumbSrc);
  }

  function observeGroups() {
    if (!lbThumbs || typeof IntersectionObserver === 'undefined') {
      groups.forEach(function (group) {
        group.indices.forEach(ensureThumbSrc);
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var author = entry.target.getAttribute('data-author');
          loadGroupThumbs(author);
          observer.unobserve(entry.target);
        });
      },
      { root: lbThumbs, rootMargin: '120px 0px', threshold: 0.01 }
    );
    groupElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function buildUi() {
    if (!lbThumbs || !lbNames) return;
    buildGroups();
    lbThumbs.innerHTML = '';
    lbNames.innerHTML = '';
    thumbButtons = new Array(entries.length);
    nameButtons = [];
    groupElements = [];

    groups.forEach(function (group) {
      var groupEl = document.createElement('div');
      groupEl.className = 's-gallery-lightbox__group';
      groupEl.setAttribute('data-author', group.author);

      group.indices.forEach(function (idx) {
        var item = entries[idx];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 's-gallery-lightbox__thumb';
        btn.setAttribute('data-thumb-index', idx);
        btn.setAttribute('aria-label', (item.project || item.author || 'Изображение') + ' ' + (idx + 1));
        var img = document.createElement('img');
        img.alt = '';
        img.decoding = 'async';
        btn.appendChild(img);
        btn.addEventListener('click', function () {
          goTo(idx);
        });
        groupEl.appendChild(btn);
        thumbButtons[idx] = btn;
      });

      lbThumbs.appendChild(groupEl);
      groupElements.push(groupEl);

      var nameBtn = document.createElement('button');
      nameBtn.type = 'button';
      nameBtn.className = 's-gallery-lightbox__name';
      nameBtn.setAttribute('data-author', group.author);
      var nameLabel = document.createElement('span');
      nameLabel.className = 's-gallery-lightbox__name-label';
      nameLabel.textContent = group.author;
      nameBtn.appendChild(nameLabel);
      nameBtn.addEventListener('click', function () {
        goTo(authorFirstIndex[group.author] || 0);
      });
      lbNames.appendChild(nameBtn);
      nameButtons.push(nameBtn);
    });

    observeGroups();
  }

  function ensureUi() {
    if (uiBuilt) return;
    uiBuilt = true;
    buildUi();
  }

  function syncUiState() {
    var item = entries[currentIndex];
    if (!item) return;

    thumbButtons.forEach(function (btn, idx) {
      if (!btn) return;
      btn.classList.toggle('is-current', idx === currentIndex);
    });

    var currentNameIndex = -1;
    nameButtons.forEach(function (btn, i) {
      var isCurrent = btn.getAttribute('data-author') === item.author;
      btn.classList.toggle('is-current', isCurrent);
      if (isCurrent) currentNameIndex = i;
    });

    nameButtons.forEach(function (btn, i) {
      var dist = currentNameIndex < 0 ? 10 : Math.abs(i - currentNameIndex);
      if (dist > 10) dist = 10;
      btn.setAttribute('data-distance', String(dist));
      if (dist >= 5) btn.setAttribute('data-far', '1');
      else btn.removeAttribute('data-far');
    });

    loadGroupThumbs(item.author);

    var currentThumb = thumbButtons[currentIndex];
    if (currentThumb && typeof currentThumb.scrollIntoView === 'function') {
      currentThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    if (currentNameIndex >= 0) {
      var currentName = nameButtons[currentNameIndex];
      if (currentName && typeof currentName.scrollIntoView === 'function') {
        currentName.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }

  function updateSlide(options) {
    var item = entries[currentIndex];
    if (!item || !lbImage) return;
    var animate = !options || options.animate !== false;

    if (animate) {
      lightbox.classList.add('is-switching');
      window.clearTimeout(switchTimer);
      switchTimer = window.setTimeout(function () {
        lbImage.src = item.src;
        lbImage.alt = item.author || item.project || '';
        lightbox.classList.remove('is-switching');
      }, 120);
    } else {
      lbImage.src = item.src;
      lbImage.alt = item.author || item.project || '';
      lightbox.classList.remove('is-switching');
    }

    var href = item.href || '#';
    if (lbCaption) lbCaption.textContent = item.project || 'Проект';
    if (lbAuthorLink) {
      lbAuthorLink.textContent = item.author || '';
      lbAuthorLink.setAttribute('href', href);
    }
    if (lbSubtitle) lbSubtitle.textContent = item.subtitle || '';
    if (lbImageLink) lbImageLink.setAttribute('href', href);

    syncUiState();
  }

  function openLightbox(index) {
    if (!entries.length) return;
    ensureUi();
    currentIndex = Math.max(0, Math.min(entries.length - 1, index));
    updateSlide({ animate: false });
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    activate('table');
  }

  function nextSlide() {
    if (!entries.length) return;
    currentIndex = (currentIndex + 1) % entries.length;
    updateSlide();
  }

  function prevSlide() {
    if (!entries.length) return;
    currentIndex = (currentIndex - 1 + entries.length) % entries.length;
    updateSlide();
  }

  function goTo(idx) {
    if (idx < 0 || idx >= entries.length) return;
    currentIndex = idx;
    updateSlide();
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

  lightbox.addEventListener(
    'wheel',
    function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (Math.abs(event.deltaY) < 4) return;
      var target = event.target;
      if (
        (lbThumbs && lbThumbs.contains(target)) ||
        (lbNames && lbNames.contains(target))
      ) {
        return;
      }
      event.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      if (event.deltaY > 0) nextSlide();
      else prevSlide();
      window.setTimeout(function () {
        wheelLock = false;
      }, 420);
    },
    { passive: false }
  );

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      prevSlide();
    }
  });
})();
