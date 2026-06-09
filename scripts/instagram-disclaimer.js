/** ч. 2 ст. 13.15 КоАП РФ — при упоминании Instagram (продукт Meta Platforms Inc.) */
const META_INSTAGRAM_DISCLAIMER_TEXT =
  'Meta Platforms Inc. признана экстремистской организацией, деятельность которой запрещена на территории РФ.';

const META_INSTAGRAM_DISCLAIMER_HTML = `<p class="m-article-info__disclaimer"><sup>*</sup> ${META_INSTAGRAM_DISCLAIMER_TEXT}</p>`;

const META_INSTAGRAM_BODY_DISCLAIMER_HTML = `<p class="m-interview-disclaimer"><sup>*</sup> ${META_INSTAGRAM_DISCLAIMER_TEXT}</p>`;

/** Russian/English word forms, skip if already marked */
const INSTAGRAM_WORD_RE = /(?:инстаграм(?:е|а|у|ом)?|Instagram)(?!\*)/gi;

function markInstagramMentions(text) {
  return text.replace(INSTAGRAM_WORD_RE, (match) => `${match}*`);
}

function hasInstagramMention(text) {
  return /(?:инстаграм(?:е|а|у|ом)?|Instagram)\*?/i.test(text);
}

function isInstagramHref(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'instagram.com';
  } catch {
    return /instagram\.com/i.test(href);
  }
}

module.exports = {
  META_INSTAGRAM_DISCLAIMER_TEXT,
  META_INSTAGRAM_DISCLAIMER_HTML,
  META_INSTAGRAM_BODY_DISCLAIMER_HTML,
  INSTAGRAM_WORD_RE,
  markInstagramMentions,
  hasInstagramMention,
  isInstagramHref,
};
