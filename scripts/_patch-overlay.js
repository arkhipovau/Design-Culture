const fs = require('fs');
const path = require('path');
const TITLES = {
  'aleksey-pyankov': 'Дизайн-ДНК вместо декора и треугольник результата',
  'anastasia-sycheva': 'Бизнес-контекст, кор-идея бренда и место AI в работе дизайнера',
  'anya-golub': 'Культура как уважение, «санитар леса» и зона комфорта в работе',
  'togetherwithyou': 'Антидисциплинарный подход, мир постдизайна и крафт в эпоху AI',
  'masha-chern': 'От одиночной работы к коллаборациям и осторожность с генеративным визуалом',
  'polina-zagumenova': 'Гибкие рамки в Берлине, неожиданные заказы и скепсис к AI-картинкам',
  'olya-bazanova': 'Когда лучше не сделать и душа в сувенирном производстве',
  'sasha-barabonova': 'Случайный путь в дизайн, эмпатия как метод и примирение с AI',
  'sergey-breus': 'Дизайн ради смысла и простота через тысячи итераций',
  'sergey-kudinov': 'Культура против симулятора в продуктовом дизайне и ценность ручного труда',
  'stefan-lashko': 'Порядок из хаоса, метафора в знаке и работа с ценностями клиента',
  'yulya-kondratyeva': 'Уместный дизайн, «Типомания», Werkstatt и границы слова «дизайн-культура»',
  'yan-zaretsky': 'Генотип и фенотип бренда и цельность как критерий',
  'gavril-perov': 'Архитектура, город и графический язык',
  'elena-chinakova': 'Своё дизайн-комьюнити Zorky в Лондоне и роль дизайнера в команде',
  'andrey-maksimenkov': 'spros, пять принципов мышления и устойчивость подхода поверх инструментов',
  'sergey-mekryukov': 'Полевые исследования, данные как основание и проверка вкуса результатом',
  'artem-gerts': 'Когда язык бренда нужно создать с нуля',
  'dasha-makurina': 'CGI, метафоры продукта и инклюзивный визуал',
  'dariia-chertanova': 'Смыслы, контекст и непрерывное «пробовать новое»',
  'maxim-aksenov': 'Архитектурный бэкграунд, дизайн как система и дисциплина мышления',
};
const file = path.join(__dirname, '..', 'src', 'udf', 'superorganisms', 'menu', 'menu-overlay.js');
let js = fs.readFileSync(file, 'utf8');
let changed = 0;
for (const [slug, title] of Object.entries(TITLES)) {
  const re = new RegExp(
    "(subtitle:\\s*')([^']*)(',\\s*\\n\\s*kind:[^\\n]*\\n\\s*href:\\s*interview\\('" + slug + "'\\))",
    'g'
  );
  js = js.replace(re, (_m, a, _b, c) => { changed++; return a + title.replace(/'/g, "\\'") + c; });
}
fs.writeFileSync(file, js, 'utf8');
console.log('overlay entries updated:', changed);
