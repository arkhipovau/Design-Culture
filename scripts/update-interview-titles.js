/**
 * Journal card titles: editorial headlines without author name (name is in author field).
 * Card descriptions: deck copy. No em dashes.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, 'src', 'pages', 'interviews');
const META_PATH = path.join(ROOT, 'content', 'interviews-meta.json');

const TITLES = {
  'aleksey-pyankov': {
    title:
      'Как в Pragmatica живёт дизайн-ДНК: белый лист на школьном сборе и треугольник результата',
    description:
      'Алексей начинал с принтов на футболках, сейчас дизайн-директор в Pragmatica. В студии культуру называют ДНК, а не декор; ещё со школьного белого листа для него полдела подать.',
  },
  'anastasia-sycheva': {
    title:
      'Бизнес-контекст, кор-идея бренда и AI как краска в палитре, а не замена руки',
    description:
      'Анастасия делает проекты в двух студиях для западных стартапов. Без бизнес-контекста визуал для неё красивый шот, а AI новая краска, не замена руки.',
  },
  'anya-golub': {
    title:
      'Культура как уважение, «санитар леса» и зона комфорта, без которой дизайн не держится',
    description:
      'Аня делает проекты в Prizma с Бали и работает с повседневными брендами от White Secret до Do I Do. Культуру сводит к уважению, образ «санитар леса» использует буквально.',
  },
  togetherwithyou: {
    title:
      'Антидисциплинарный подход, мир постдизайна и крафт в эпоху AI',
    description:
      'Студия Артёма Тарасова и Артёма Тарадаша считает себя антидисциплинарной: дизайн начинается раньше Figma. Разговор про манифест, ритуалы и крафт в эпоху AI.',
  },
  'masha-chern': {
    title:
      'От «сделаю всё сама» к коллаборациям, ребрендинг TON и границы с генеративными картинками',
    description:
      'Маша пришла в коммдиз почти случайно и отошла от «сделаю всё сама» к коллаборациям. В TON Foundation делает ребрендинг в команде и говорит о границах с AI-картинками.',
  },
  'polina-zagumenova': {
    title:
      'Гибкие рамки в Берлине, неожиданные заказы и скепсис к AI-картинкам',
    description:
      'Полина Загуменова из Берлина. О неожиданных заказах, любви к текстам и сомнениях в AI-визуале.',
  },
  'olya-bazanova': {
    title:
      'Когда лучше не сделать, игра «Хвостики» и душа в сувенирном производстве',
    description:
      'Оля делает «Подписные изделия» в Калининграде, до этого три года в «Додо». Дизайн для неё помощь продукту; если можно что-то не сделать, лучше не сделать.',
  },
  'sasha-barabonova': {
    title:
      'Случайный путь в дизайн, эмпатия как основа профессии и примирение с AI',
    description:
      'Саша попала в дизайн через «программирование» и называет профессию эмпатией. В Phygital+ сначала отвергала нейросети, потом нашла с ними общий язык.',
  },
  'sergey-breus': {
    title:
      'Недели на мудборде, ремесло с пользой и страх однотипного AI-контента',
    description:
      'Сергей пришёл в дизайн из танцев в пандемийную осень. Для него это ремесло с пользой: мудборды по неделям и страх однотипного AI-контента.',
  },
  'sergey-kudinov': {
    title:
      'Культура против симулятора в продуктовом дизайне и ценность ручного труда',
    description:
      'Сергей в Яндексе разделяет дизайн на жизнь и работу. Культура для него мышление результатом, а нарисованные ритуалы он называет симулятором.',
  },
  'stefan-lashko': {
    title:
      'Порядок из хаоса, метафора в знаке и отказ от клиентов без ценностей',
    description:
      'Стефан почти десять лет делает брендинг в ESH gruppa. Каждый проект начинается с эскиза в блокноте, студия отказывается от клиентов без ценностей.',
  },
  'yulya-kondratyeva': {
    title:
      'Уместный дизайн, «Типомания», Werkstatt и границы слова «дизайн-культура»',
    description:
      'Юля сооснователь Werkstatt и не любит термин «дизайн-культура». Формулирует проще: хороший дизайн уместный.',
  },
  'yan-zaretsky': {
    title:
      'Генотип и фенотип бренда, цельность как критерий и «Мастерская» в Петербурге',
    description:
      'Ян делает брендинг и продукт для отраслевого софта, соучредитель «Мастерской». У долгого проекта есть генотип и фенотип под разные форматы.',
  },
  'gavril-perov': {
    title: 'Good enough в Drinkit, баланс интересов и AI без страха',
    description:
      'Гаврил делает продуктовый дизайн в Drinkit, пришёл из моды. В большинстве случаев для него достаточно good enough.',
  },
  'elena-chinakova': {
    title: 'Zorky в Лондоне, роль дизайнера в Avito и взросление в профессии',
    description:
      'Елена основатель Zorky в Лондоне, до эмиграции была дизайн-лидом Авито. Культура для неё начинается с роли дизайнера: партнёр или «руки».',
  },
  'andrey-maksimenkov': {
    title: 'spros, пять принципов мышления и ночные идеи, которые нельзя терять',
    description:
      'Андрей из Ростова, автор spros про мышление дизайнеров. Пять принципов формулирует прямо в тексте и записывает ночные идеи, пока не забылись.',
  },
  'sergey-mekryukov': {
    title: 'Гемба в ресторанах, метрики Dodo Brands и честные UX-ревью',
    description:
      'Сергей делает дизайн продукта в Dodo Brands. Сначала гемба в ресторанах, потом данные; слабый UX признавать важнее самоуспокоения.',
  },
  'artem-gerts': {
    title: 'Язык с нуля в айдентике: Redis, Nil Foundation и честность в решениях',
    description:
      'Артём берётся за айдентику, где язык нужно создать с нуля. В Nil Foundation и RSquad искал честный визуальный код для технологии.',
  },
  'dasha-makurina': {
    title: 'CGI, метафоры продукта и инклюзивный визуал в pont.design и Rarible',
    description:
      'Даша делает CGI для pont.design и 3D для Rarible. В работе ищет метафору продукта и говорит про инклюзивный визуал на примере THX.',
  },
  'dariia-chertanova': {
    title: 'Смыслы, контекст и люди, меняющие профессию',
    description:
      'Даша работает в The Blueprint, кодит интерактивные визуалы, преподавала в Bang Bang Education и менторит. К дизайну пришла после социологии и барной стойки, оба разворота оказались про идею и контекст.',
  },
};

function updateInterviewHtml(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  const data = TITLES[slug];
  if (!data) return false;
  const before = html;

  html = html.replace(
    /(<h1 class="interview-hero__title">)[^<]*(<\/h1>)/,
    `$1${data.title}$2`
  );

  html = html.replace(/\s*<p class="interview-hero__subtitle">[^<]*<\/p>\s*/g, '\n          ');

  const hrefMatch = html.match(/m-next-article__circle[^"]*" href="\.\/([^"]+)"/);
  if (hrefMatch) {
    const linkedSlug = hrefMatch[1].replace(/\.html$/, '');
    if (TITLES[linkedSlug]) {
      html = html.replace(
        /(<span class="m-next-article__title">)[^<]*(<\/span>)/,
        `$1${TITLES[linkedSlug].title}$2`
      );
    }
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

function updateJournalCards(html, baseHref) {
  let updated = html;
  let changed = false;
  for (const [slug, data] of Object.entries(TITLES)) {
    const href = `${baseHref}${slug}.html`;
    const cardRe = new RegExp(
      `(data-href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?<h4 class="m-journal-card__subtitle">)[^<]*(<\\/h4>\\s*<\\/div>\\s*<p class="m-journal-card__description">)[^<]*(<\\/p>)`,
      'm'
    );
    const next = updated.replace(cardRe, `$1${data.title}$2${data.description}$3`);
    if (next !== updated) {
      updated = next;
      changed = true;
    }
  }
  return { html: updated, changed };
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const order = meta.order;

  for (const slug of order) {
    if (TITLES[slug]) meta.interviews[slug].subtitle = TITLES[slug].title;
  }
  fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

  const files = fs
    .readdirSync(HTML_DIR)
    .filter((f) => f.endsWith('.html') && f !== 'interview.css');

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    if (!TITLES[slug]) continue;
    const changed = updateInterviewHtml(path.join(HTML_DIR, file), slug);
    console.log(`${slug}: html ${changed ? 'updated' : 'unchanged'}`);
  }

  for (const [pagePath, baseHref] of [
    [path.join(ROOT, 'src', 'pages', 'journal.html'), './interviews/'],
    [path.join(ROOT, 'src', 'index.html'), './pages/interviews/'],
  ]) {
    const before = fs.readFileSync(pagePath, 'utf8');
    const { html, changed } = updateJournalCards(before, baseHref);
    if (changed) {
      fs.writeFileSync(pagePath, html, 'utf8');
      console.log(`${path.basename(pagePath)}: updated cards`);
    }
  }
}

main();
