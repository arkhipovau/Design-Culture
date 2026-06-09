/** ч. 2 ст. 13.15 КоАП РФ — при упоминании Instagram (продукт Meta Platforms Inc.) */
const META_INSTAGRAM_DISCLAIMER_TEXT =
  'Meta Platforms Inc. признана экстремистской организацией, деятельность которой запрещена на территории РФ.';

function isInstagramHref(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'instagram.com';
  } catch {
    return /instagram\.com/i.test(href);
  }
}

function unmarkInstagramMentions(text) {
  return text
    .replace(/инстаграм\*е\*/gi, 'инстаграме')
    .replace(/Инстаграм\*е\*/g, 'Инстаграме')
    .replace(/(?:инстаграм(?:е|а|у|ом)?|Instagram)\*/gi, (match) => match.slice(0, -1));
}

module.exports = {
  META_INSTAGRAM_DISCLAIMER_TEXT,
  isInstagramHref,
  unmarkInstagramMentions,
};
