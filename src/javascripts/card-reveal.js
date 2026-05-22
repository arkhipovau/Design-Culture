
(function () {
  var SELECTOR = '.m-journal-card, .m-gallery-card';

  function markLoaded(card) {
    if (!card || card.classList.contains('is-loaded')) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      card.classList.add('is-loaded');
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.classList.add('is-loaded');
      });
    });
  }

  function whenReady(img, done) {
    var fired = false;
    var finish = function () {
      if (fired) return;
      fired = true;
      done();
    };

    if (typeof img.decode === 'function') {
      img
        .decode()
        .then(finish)
        .catch(finish);
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }
    img.addEventListener('load', finish, { once: true });
    img.addEventListener('error', finish, { once: true });
  }

  function watch(card) {
    if (!card || card.dataset.revealWatched === '1') return;
    card.dataset.revealWatched = '1';

    var img = card.querySelector('img');
    if (!img) {
      markLoaded(card);
      return;
    }

    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');

    whenReady(img, function () {
      markLoaded(card);
    });
  }

  function scan(root) {
    if (!root) return;
    var nodes;
    if (root.matches && root.matches(SELECTOR)) {
      nodes = [root];
    } else if (root.querySelectorAll) {
      nodes = root.querySelectorAll(SELECTOR);
    } else {
      return;
    }
    Array.prototype.forEach.call(nodes, watch);
  }

  function boot() {
    scan(document);
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) scan(node);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
