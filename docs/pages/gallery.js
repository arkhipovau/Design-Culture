(function () {

  var data = window.deFindingsGalleryData || { entries: [] };
  var entries = (data.entries || []).map(function (e, idx) {
    return {
      src: e.src,
      author: e.author || '',
      project: e.project || e.subtitle || '',
      subtitle: e.subtitle || '',
      href: e.href || '#',
      kind: idx % 3 === 0 ? 'tall' : 'wide'
    };
  });

  var tableView = document.getElementById('tableView');
  var sliderView = document.getElementById('sliderView');
  var tableBtn = document.getElementById('tableBtn');
  var sliderBtn = document.getElementById('sliderBtn');

  var EAGER_CARDS = 6;
  var fragment = document.createDocumentFragment();

  entries.forEach(function (item, idx) {
    var card = document.createElement('a');
    card.className =
      'm-gallery-card m-gallery-card--' + (item.kind === 'tall' ? 'tall' : 'wide');
    card.href = item.href;
    card.setAttribute('data-gallery-index', idx);

    var img = document.createElement('img');
    img.decoding = 'async';
    img.alt = item.author || '';
    img.loading = idx < EAGER_CARDS ? 'eager' : 'lazy';
    if (item.kind === 'tall') {
      img.width = 218;
      img.height = 272;
    } else {
      img.width = 218;
      img.height = 145;
    }
    if (idx < EAGER_CARDS) {
      try { img.fetchPriority = 'high'; } catch (_) {  }
    }

    img.src = item.src;

    var media = document.createElement('span');
    media.className = 'm-gallery-card__media';
    media.appendChild(img);

    var go = document.createElement('span');
    go.className = 'm-gallery-card__go a-arrow-button a-arrow-button--corner';
    go.setAttribute('aria-hidden', 'true');
    media.appendChild(go);

    card.appendChild(media);

    if (img.complete && img.naturalWidth > 0) {
      card.classList.add('is-loaded');
    }

    var overlay = document.createElement('span');
    overlay.className = 'm-gallery-card__overlay';
    card.appendChild(overlay);

    fragment.appendChild(card);
  });

  tableView.appendChild(fragment);

  function activate(mode) {
    var isTable = mode === 'table';
    tableBtn.classList.toggle('is-active', isTable);
    sliderBtn.classList.toggle('is-active', !isTable);
    tableBtn.setAttribute('aria-selected', isTable ? 'true' : 'false');
    sliderBtn.setAttribute('aria-selected', isTable ? 'false' : 'true');
  }

  tableBtn.addEventListener('click', function () {
    activate('table');
  });

  sliderBtn.addEventListener('click', function () {
    activate('slider');
    openLightbox(0);
  });

  var lightbox = document.getElementById('galleryLightbox');
  var lbImage = lightbox.querySelector('.s-gallery-lightbox__image');
  var lbImageLink = lightbox.querySelector('.s-gallery-lightbox__image-link');
  var lbCaption = lightbox.querySelector('.s-gallery-lightbox__caption');
  var lbAuthorLink = lightbox.querySelector('.s-gallery-lightbox__author-link');
  var lbSubtitle = lightbox.querySelector('.s-gallery-lightbox__subtitle');
  var lbClose = lightbox.querySelector('.s-gallery-lightbox__close');
  var lbBackdrop = lightbox.querySelector('.s-gallery-lightbox__backdrop');
  var lbThumbs = lightbox.querySelector('.s-gallery-lightbox__thumbs');

  var currentIndex = 0;
  var thumbButtons = [];

  function buildThumbs() {
    if (!lbThumbs) return;
    lbThumbs.innerHTML = '';
    thumbButtons = entries.map(function (item, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 's-gallery-lightbox__thumb';
      btn.setAttribute('data-thumb-index', idx);
      btn.setAttribute('aria-label', item.author || ('Изображение ' + (idx + 1)));
      var img = document.createElement('img');
      img.alt = '';

      img.loading = 'eager';
      img.decoding = 'async';
      img.src = item.src;
      btn.appendChild(img);
      btn.addEventListener('click', function () {
        goTo(idx);
      });
      lbThumbs.appendChild(btn);
      return btn;
    });
  }

  function syncThumbState() {
    thumbButtons.forEach(function (btn, idx) {
      btn.classList.toggle('is-current', idx === currentIndex);
    });
    var current = thumbButtons[currentIndex];
    if (current && typeof current.scrollIntoView === 'function') {
      current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }

  function updateSlide() {
    var item = entries[currentIndex];
    if (!item) return;
    lbImage.src = item.src;
    lbImage.alt = item.author || '';

    var href = item.href || '#';
    if (lbCaption) lbCaption.textContent = item.project || 'Название проекта';
    if (lbAuthorLink) {
      lbAuthorLink.textContent = item.author || '';
      lbAuthorLink.setAttribute('href', href);
    }
    if (lbSubtitle) lbSubtitle.textContent = '';

    if (lbImageLink) lbImageLink.setAttribute('href', href);
    syncThumbState();
  }

  function openLightbox(index) {
    if (!entries.length) return;
    currentIndex = Math.max(0, Math.min(entries.length - 1, index));
    updateSlide();
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

  buildThumbs();

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

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
