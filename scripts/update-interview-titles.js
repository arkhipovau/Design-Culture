/**
 * Journal card titles: editorial headlines without author name (name is in author field).
 * Card descriptions: deck copy. No em dashes.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, 'src', 'pages', 'interviews');
const META_PATH = path.join(ROOT, 'content', 'interviews-meta.json');
const SEARCH_PATH = path.join(ROOT, 'src', 'udf', 'superorganisms', 'menu', 'menu-overlay.js');

const TITLES = {
  'aleksey-pyankov': {
    title: 'Дизайн-ДНК команды и треугольник результата',
    description:
      'Алексей дизайн-директор студии Pragmatica. Культуру команды называет ДНК и считает её клеем, в котором варится команда.',
  },
  'anastasia-sycheva': {
    title: 'Бизнес-контекст, кор-идея бренда и место AI в работе дизайнера',
    description:
      'Анастасия не начинает работу без понимания бизнеса заказчика. Без контекста визуал для неё – красивый шот, AI – инструмент, не подмена мышления.',
  },
  'anya-golub': {
    title: 'Культура как уважение, «санитар леса» и зона комфорта в работе',
    description:
      'Аня работает с повседневными брендами. Культуру сводит к уважению, образ «санитар леса» использует буквально.',
  },
  togetherwithyou: {
    title: 'Антидисциплинарный подход, мир постдизайна и крафт в эпоху AI',
    description:
      'Студия двух Артёмов работает «в контртоне»: чтобы придумать новое, надо отрицать дисциплину, из которой ты вышел.',
  },
  'masha-chern': {
    title: 'От одиночной работы к коллаборациям и осторожность с генеративным визуалом',
    description:
      'Маша пришла в коммдиз почти случайно. Разговор про переход от соло-работы к команде и про то, где у AI заканчивается её доверие.',
  },
  'polina-zagumenova': {
    title: 'Гибкие рамки в Берлине, неожиданные заказы и скепсис к AI-картинкам',
    description:
      'Полина из Берлина. О неожиданных заказах, любви к текстам и сомнениях в AI-визуале.',
  },
  'olya-bazanova': {
    title: 'Когда лучше не сделать и душа в сувенирном производстве',
    description:
      'Оля делает дизайн региональных брендов. Для неё дизайн – помощь продукту: если можно что-то не сделать, лучше не сделать.',
  },
  'sasha-barabonova': {
    title: 'Случайный путь в дизайн, эмпатия как метод и примирение с AI',
    description:
      'Саша попала в дизайн нелинейно. Говорит о дизайне буквально как об эмпатии – в процессах, в подходе, в каждом решении.',
  },
  'sergey-breus': {
    title: 'Дизайн ради смысла и простота через тысячи итераций',
    description:
      'Сергей делает диджитал-дизайн с акцентом на концепцию и смысл. Простой результат, по его словам, надо заслужить долгой работой.',
  },
  'sergey-kudinov': {
    title: 'Культура против симулятора в продуктовом дизайне и ценность ручного труда',
    description:
      'Сергей разделяет дизайн в жизни и в работе. Культура для него – мышление результатом и доверие к ручному труду.',
  },
  'stefan-lashko': {
    title: 'Порядок из хаоса, метафора в знаке и работа с ценностями клиента',
    description:
      'Стефан почти десять лет делает брендинг. Каждый проект начинается с эскиза в блокноте; решение работать или нет – тоже про ценности.',
  },
  'yulya-kondratyeva': {
    title: 'Уместный дизайн, «Типомания», Werkstatt и границы слова «дизайн-культура»',
    description:
      'Юля сооснователь Werkstatt и не любит термин «дизайн-культура». Формулирует проще: хороший дизайн – уместный.',
  },
  'yan-zaretsky': {
    title: 'Генотип и фенотип бренда и цельность как критерий',
    description:
      'Ян ведёт несколько дизайн-команд в продуктовых и брендинговых проектах. У зрелого проекта различает генотип и фенотип, цельность для него – главный критерий качества.',
  },
  'gavril-perov': {
    title: 'Архитектура, город и графический язык',
    description:
      'Гаврил отвечает за продуктовый дизайн Drinkit, в профессию пришёл из моды. Разговор про город, графический язык и баланс интересов.',
  },
  'elena-chinakova': {
    title: 'Своё дизайн-комьюнити Zorky в Лондоне и роль дизайнера в команде',
    description:
      'Елена строит дизайн-комьюнити Zorky в Лондоне, до эмиграции была дизайн-лидом большого сервиса. Культура для неё начинается с того, как команда видит дизайнера: партнёром или исполнителем.',
  },
  'andrey-maksimenkov': {
    title: 'spros, пять принципов мышления и устойчивость подхода поверх инструментов',
    description:
      'Андрей из Ростова, автор spros. Уверен, что инструменты и визуальные языки со временем меняются, а мышление и принципы остаются.',
  },
  'sergey-mekryukov': {
    title: 'Полевые исследования, данные как основание и проверка вкуса результатом',
    description:
      'Сергей делает дизайн продукта в Dodo Brands. UX не рождается в кабинете: он опирается на полевые исследования и проверяет каждое решение тем, что болит у пользователя и что показывают данные.',
  },
  'artem-gerts': {
    title: 'Когда язык бренда нужно создать с нуля',
    description:
      'Артём занимается айдентикой технологических компаний. Берётся там, где готового визуального кода нет, и ищет честный язык для сложной технологии.',
  },
  'dasha-makurina': {
    title: 'CGI, метафоры продукта и инклюзивный визуал',
    description:
      'Даша работает с CGI и 3D. В работе ищет метафору продукта и говорит о визуале, доступном разным аудиториям.',
  },
  'dariia-chertanova': {
    title: 'Смыслы, контекст и непрерывное «пробовать новое»',
    description:
      'Даша делает интерактивные визуалы и преподаёт. Главное для неё – не консервироваться: открыла для себя кодинг уже взрослым специалистом, считает, что профессию двигает желание пробовать разное.',
  },
  'maxim-aksenov': {
    title: 'Архитектурный бэкграунд, дизайн как система и дисциплина мышления',
    description:
      'Графический дизайнер с архитектурным бэкграундом. Разговор про культуру дизайна, школу мышления и системный подход.',
  },
};

function updateInterviewHtml(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');
  const data = TITLES[slug];
  if (!data) return false;
  const before = html;

  html = html.replace(
    /(<h1 class="o-interview-hero__title">)[^<]*(<\/h1>)/,
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

function updateSearchOverlay(filePath) {
  let js = fs.readFileSync(filePath, 'utf8');
  const before = js;
  for (const [slug, data] of Object.entries(TITLES)) {
    const re = new RegExp(
      `(subtitle:\\s*['"\`])[^'"\`]*(['"\`],\\s*\\n\\s*href:\\s*interview\\(['"]${slug}['"]\\))`,
      'g'
    );
    js = js.replace(re, `$1${data.title.replace(/'/g, "\\'")}$2`);
  }
  if (js !== before) {
    fs.writeFileSync(filePath, js, 'utf8');
    return true;
  }
  return false;
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

  const searchChanged = updateSearchOverlay(SEARCH_PATH);
  console.log(`menu-overlay.js: ${searchChanged ? 'updated' : 'unchanged'}`);
}

main();
