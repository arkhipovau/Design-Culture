(function () {
  const roots = document.querySelectorAll('[data-article-share]');
  if (!roots.length) return;

  const url = window.location.href;

  const getShareText = () => {
    const author = document.querySelector('.o-interview-hero__author')?.textContent.trim();
    const headline = document.querySelector('.o-interview-hero__title')?.textContent.trim();

    if (author && headline) return `${author} – ${headline}`;
    if (author) return author;

    return document.title
      .replace(/\s*–\s*deFindings\s*$/u, '')
      .replace(/:\s*/gu, ' – ')
      .trim();
  };

  const shareText = getShareText();
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;

  const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(input);
    if (!ok) throw new Error('copy failed');
  };

  roots.forEach((root) => {
    const copyBtn = root.querySelector('[data-share-copy]');
    const tgLink = root.querySelector('[data-share-telegram]');
    const status = root.querySelector('[data-share-status]');

    if (tgLink) tgLink.href = telegramHref;

    if (!copyBtn) return;

    const defaultLabel = copyBtn.textContent.trim() || 'Поделиться';

    copyBtn.addEventListener('click', async () => {
      try {
        await copyText(url);
        copyBtn.textContent = 'Скопировано';
        if (status) status.textContent = 'Ссылка скопирована';
        window.setTimeout(() => {
          copyBtn.textContent = defaultLabel;
          if (status) status.textContent = '';
        }, 2000);
      } catch {
        if (status) status.textContent = 'Не удалось скопировать ссылку';
      }
    });
  });
})();
