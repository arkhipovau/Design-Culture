#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'src/pages/interviews/togetherwithyou.html');
const GALLERY = path.join(ROOT, 'src/pages/gallery-data.js');
const META = path.join(ROOT, 'content/interviews-meta.json');

let photoId = 0;

function figure(file, title, wide) {
  const id = photoId++;
  const wideClass = wide ? ' m-photo-slot--wide' : '';
  return `    <figure class="m-photo-slot${wideClass}" id="photo-togetherwithyou-${id}">
      <div class="m-photo-slot__image">
        <img src="../../images/interviews/togetherwithyou/${encodeURIComponent(file)}" alt="${title}" loading="lazy" decoding="async" />
      </div>
      <figcaption class="m-photo-slot__caption">
        <span class="m-photo-slot__title">${title}</span>
      </figcaption>
    </figure>`;
}

function row(files, title) {
  return `    <div class="m-photo-row">\n${files.map((file) => figure(file, title, false)).join('\n')}\n    </div>`;
}

function renderBlocks(blocks) {
  return blocks
    .map((item) => {
      if (item.type === 'row') return row(item.files, item.title);
      if (item.type === 'wide') return figure(item.file, item.title, true);
      throw new Error('Unknown block type');
    })
    .join('\n\n');
}

// Small placements (1 wide or 1 pair) scattered through the interview.
// Markers must be complete blocks — never partial <p> text — so photos sit between Q&A rows.
const placements = [
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Первое - антидисциплинарный подход. Не мультидисциплинарный, а антидисциплинарный, потому что нам нравится вот этот контртон, отрицание, которое в этом заложено. Чтобы придумать что-то клёвое сегодня, нужно отрицать дисциплину, из которой ты вышел. Чтобы придумать что-то в рамках диджитал-продукта, нужно отрицать все остальные диджитал-продукты, стандартные решения, которые есть на рынке. Для бренда нужно думать наоборот, избрать другую крайность. Нужно из дисциплины себя вытаскивать иногда насильно, делая несколько шагов назад.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Biceps Grotesk.webp', title: 'Biceps Grotesk' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Наши слова из месяца в месяц доказывает распространение искусственного интеллекта: насколько это быстро происходит и насколько на самом деле невозможно заменить креативность, творчество и аутентичность человека. Но насколько можно быстро заменить крафт. К сожалению, это так. И дальше только будет быстрее развиваться. Главное - не только в том, как это выглядит или как это работает, сколько в смыслах, заложенных в это, в глубине и аутентичности людей, которые это делали.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>\n        </div>\n      </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival.webp', title: 'Arrival' }],
  },
  {
    marker:
      '          <p class="m-interview-section__prose">Это другой пункт – human-centric. Мы так и назвались, потому что не лукавим: мы реально всё строим вокруг людей. Нас сейчас трое в этом Zoom. Этот разговор получается так, потому что нас трое. Тебя убери или Артёма убери, он получится другим. Этот Zoom можно считать сложившимся произведением. Бизнес можно из этого сделать, это уже дальше, не важно. Творчество, бизнес, дизайн – для нас это всё одно. Но определяется людьми в комнате. Есть одно условие: получается классно, пока эти люди готовы быть честными, аутентичными и ответственными. Дальше это уже вопрос построения отношений: внутри команды, с клиентами, с коллабораторами. Через доверие, ответственность и аутентичность.</p>\n        </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Biceps Grotesk 2.webp', title: 'Biceps Grotesk' }],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Эти принципы',
    blocks: [
      {
        type: 'row',
        title: 'Etoso',
        files: ['Etoso.webp', 'Etoso 2.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Забавно, что ты уже ответила сама. Органика появления – в органике [смеётся]. Поэтому мы и не говорим, что это супердолгосрочные принципы. Мы растём вместе, каждый что-то новое вносит, и крышу над этим фундаментом не ставим. Меня всегда палят и бесят принципы Дитера Рамса: он такой – «я настолько большой, что возьму и опишу весь дизайн». А по мне это глупость поганишная.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'MARCO.png', title: 'MARCO' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Сейчас поймал хорошую мысль. На контрасте: роль случая очень важна. Поэтому «про органику» прикольно. И поэтому Дитер Рамс и Корбюзье – люди прошлого: там антислучай, антиприрода. Попытка спроектировать что-то вопреки, идеальное нечто. Но идеала не бывает. И в итоге эти люди оказываются злыми стариками. [смеётся]</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Etoso 4.webp', title: 'Etoso' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>А люди, которые умирают в счастливой старости, как правило, чем-то другим жизнь заняли. Мы стараемся обращать внимание на случайность. Это во многом история про количество людей в комнате, и кто они, определяет результат работы. Иногда тебе даже делать ничего не надо: идея рождается за счёт формулы «ты плюс я плюс кто-то ещё». И может повлиять случай – внешнее событие, среда, время дня, погода, твоё личное состояние. Невозможно отрицать значимость этого. Некое событие может иметь авторство внутри результата работы. Если уж событие может иметь авторство, что говорить о людях?</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Silk &amp; Silk Road',
        files: ['Silk & Silk Road.png', 'Silk & Silk Road 5.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Кайфовый дизайн – это результат ошибок, а не принятых правильных решений. Ты что-то нашёл, шутейку, артефакт, и оно легло в основу. Либо нашёл что-то, что может стать длинным событием внутри размышлений, сигнатурной вещью, на которую потом можно опираться. Но порой это вообще ошибки. Ты понятия не имеешь, как это происходит. Происходит за счёт того, что вы общаетесь, шутите, играете, думаете друг о друге. Это точно не штука про «давай теперь дизайн по семи принципам побьём». Чёрт его знает.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'MARCO 2.webp', title: 'MARCO' }],
  },
  {
    marker:
      '        <blockquote class="m-quote-block">\n          <p><strong>Кайфовый дизайн – это результат ошибок, а не принятых правильных решений.</strong></p>\n          <cite class="m-quote-block__cite">– Артём Тарасов и Артём Тарадаш</cite>\n        </blockquote>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Silk & Silk Road 2.webp', title: 'Silk &amp; Silk Road' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Не так много людей готовы брать ответственность за то, чтобы оказывать импакт на бренд. И это нормально, люди не должны брать ответственность за чужой бизнес. Если ты в найме в корпорации, это не твоя компания, ты ей ничего не должен – у вас коммерческие товарно-денежные отношения. Но обязательно есть человек, для которого это больше, чем работа. Таких людей может быть много. И вот они…</p><p>> <em>Атрибуция А¹/А² ниже не подтверждена.</em></p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>\n        </div>\n      </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'MARCO 5.png', title: 'MARCO' }],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Хочется спросить про рутину.',
    blocks: [{ type: 'wide', file: 'Arrival 3.webp', title: 'Arrival' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Сложно относиться к этому как к «работе». Это просто время, которое тратишь на то, что тебе нравится. Хочешь, чтобы было классно, тратишь час, два, десять. Хочу – трачу, хочу – нет. Бывает дедлайн показа: «к этому времени надо что-то показать». Это единственное «надо».</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 4.webp', 'Arrival 7.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Ритуал «быть эффективным» – немного дурацкая тема. Кажется, всё должно быть в удовольствие в одной степени: кофеёк сделать, ужин приготовить, прогуляться, спортом заняться, дизайн поделать. Не «отдыхаю от одного, делая другое», и не «пойду похайпать, чтобы потом сделать дизайн».</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather.webp', 'Ather 2.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Важно, чтобы мы вдвоём были, и ещё клиенты. Остальное второстепенно. У меня нет проблемы начать работать из туалета, из аэропорта, откуда угодно. [смеются] У тебя есть такое? Каждый день перед работой что-то делаешь?</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Ather 7.webp', title: 'Äther' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Ритуалов в смысле «без этого не могу» нет. Мы из каких только мест друг с другом не работали. Но есть перманентная вещь: периодически просто сверяемся, держим синхронизацию вокруг друг друга. Это и есть «держать отношения на плаву». Когда вы вдвоём, это как семейные, как романтические отношения. Нам важно друг друга понимать на многих уровнях.</p><p>> <em>Атрибуция А¹/А² ниже не подтверждена.</em></p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>\n        </div>\n      </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather 8.webp', 'Ather 9.webp'],
      },
    ],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Последний большой вопрос, про AI.',
    blocks: [{ type: 'wide', file: 'Ather 3.webp', title: 'Äther' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Юзаем очень активно. Тут важна специфика: мы digital-first, и у нас мало ручного, упаковок, например, мы почти не делаем. Не сказать, что мне этого лично не хватает: иногда хочется что-то ручное поделать, но это не влияет на результат. Я дизайн вижу чуть в другом, и думаю, мы тут с Артёмом сходимся. Когда ты идёшь домой определённым путём или выбираешь, что на ужин приготовить, это такой же момент дизайна, как и любой другой. Это просто творческий импульс, момент, когда твоя творческая сторона включается и начинает решать задачу нетривиальным путём. И ты можешь решить её очень дёшево, заказав еду в Wolt, а можешь приготовить сам. AI – это просто ультрабыстрые инструменты решения твоих творческих задач. У тебя будут разные кейсы, и в мире есть место всему: и тому, где надо сделать что-то долго, приложив всё ручное мастерство, и тому, где надо сделать быстро, по щелчку, описав промпт или просто подумав.</p><p>Я слышал мнения про AI как про что-то чудовищное: лишит работы, поменяет мир. Мне кажется, это тоже дизайн – придумать себе новый способ существовать в этом меняющемся мире. Если ты этого не можешь, буду цинично рассуждать, значит, наверное, ты и в дизайне плох? Если ты не можешь сориентироваться в наборе случайностей и меняющихся факторов.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather 5.webp', 'Ather 6.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Всему есть место и всему будет. Просто перемешается, как часто это происходит. Газеты переехали в интернет, журналы остались. Печатная пресса осталась, просто стала выполнять другую функцию. Никто не читает эти тексты, зато они ставят красивые картинки. AI не отрицает крафт, это просто другой вид крафта. Раньше книги набирали на станке, а сейчас не на станке. То же самое.</p><p>Ты выбираешь из поливариантности способов: хочу сделать в AI, потом отправить в Фотошоп, дорисовать и куда-то выложить. AI всё не заканчивается и не начинается, оно просто есть там. Никогда не бывает «только AI». Фигма, она такая: «Ну всё, я нахрен не схлопаюсь». AI – это просто функция Фигмы. Какое-то количество задач можешь закрывать там, какое-то здесь. Но нет такого, что «эта штука сама всё сделает». Фотошоп тоже много чего умеет делать сам, Фигма много чего может, это не убивает людей вокруг.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Eleganza 2.webp', title: 'Eleganza' }],
  },
  {
    marker:
      '        <blockquote class="m-quote-block">\n          <p><strong>AI не отрицает крафт, это просто другой вид крафта.</strong></p>\n          <cite class="m-quote-block__cite">– Артём Тарасов и Артём Тарадаш</cite>\n        </blockquote>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Ather 4.webp', title: 'Äther' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Хайповая вещь, что AI убьёт нахрен все профессии. Оно убьёт профессии, которые занимались описательным пространством. Под «описыванием» я не имею в виду буквально «дорисовывание, доделывание», я имею в виду места, где нет первичного импульса. Там AI много чего порешает. Но когда речь касается начального импульса, даже в архитектуре, в автомобилестроении, тебе надо придумать какой-то экземпляр. Ты в AI просто бьёшься: «Сделай это, сделай вот так, покажи вот так». Останавливаешься: «Вот это нравится» и идёшь туда углубляться. Это тот же крафт, просто быстрее. Раньше ты бы долбился с 3D Max миллионы лет, а так накидываешь: «Дай, дай, дай, вот сюда хочу. Поехали».</p><p>И все пытаются решить проблему энтропии внутри AI, что он не даёт всегда тот результат, который нужен. Чтобы он давал нужный результат, надо упарываться: как бы один из второго выходит, потому что он всегда начинает с хаоса. Как этот хаос эволюционировать, вот основные проблематичности. Ты по-любому всегда в энтропии. И когда сам делаешь руками, тоже в энтропии. Никогда не получается так, как у тебя в голове. Никогда. Просто там тебе дают результат быстрее: посмотрел, иду дальше.</p><p>Интересная штука: когда ты делаешь что-то с AI, ты перестаёшь относиться к этому слишком персонально. Тебе легче отказываться от загнивающих ответвлений от основной идеи. «Ничего страшного, я на это не так много потратил». Возвращаешься, идёшь дальше. И это, наоборот, даёт огромный прирост к тому, что получится в конце. Возможно, в конце вы устроите фотосессию и будете снимать людей. Но чтобы к ней прийти, надо итерировать энное количество фотосессий. Почему так много хреновых фотографов? Потому что у них не было AI. Они видят что-то в голове, а в голове это волшебно. Сфоткали, а потом такие: «Говно». И с этим уже ничего не сделаешь. Это, типа, эвтаназия художника: он постоянно в эвтаназию уходит, убивает себя в конце каждого результата. А в AI этого нет. Ты просто в цикле: смотришь, смотришь ещё что-то. Насмотренность у дизайнеров из-за AI вырастает очень классно, они начинают сравнивать очень много всего. Я в этом боли не вижу. Я вижу невероятную возможность развиваться ещё быстрее.</p><p>> <em>Атрибуция А¹/А² ниже не подтверждена.</em></p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>\n        </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Eleganza',
        files: ['Eleganza 1.webp', 'Ather 10.webp'],
      },
    ],
  },
  {
    marker:
      '          <p class="m-interview-section__prose">Интересная штука: когда ты делаешь что-то с AI, ты перестаёшь относиться к этому слишком персонально. Тебе легче отказываться от загнивающих ответвлений от основной идеи. «Ничего страшного, я на это не так много потратил». Возвращаешься, идёшь дальше. И это, наоборот, даёт огромный прирост к тому, что получится в конце. Возможно, в конце вы устроите фотосессию и будете снимать людей. Но чтобы к ней прийти, надо итерировать энное количество фотосессий. Почему так много хреновых фотографов? Потому что у них не было AI. Они видят что-то в голове, а в голове это волшебно. Сфоткали, а потом такие: «Говно». И с этим уже ничего не сделаешь. Это, типа, эвтаназия художника: он постоянно в эвтаназию уходит, убивает себя в конце каждого результата. А в AI этого нет. Ты просто в цикле: смотришь, смотришь ещё что-то. Насмотренность у дизайнеров из-за AI вырастает очень классно, они начинают сравнивать очень много всего. Я в этом боли не вижу. Я вижу невероятную возможность развиваться ещё быстрее.</p>\n        </div>\n      </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival 6.webp', title: 'Arrival' }],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Зацепилась за энтропию.',
    blocks: [{ type: 'wide', file: 'Etoso 5.webp', title: 'Etoso' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Надо доверять себе. Иногда первым вещам, которые приходят. Понятно, что их часто надо допилить, додрочить, но это уже техническая фигня. Together with you мы сделали после многих лет в дизайне, на самом деле. Сложно представить студию людей, которые только заехали в профессию, и хотят…</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 8.webp', 'Arrival 13.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Это вопрос интенции, братец.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Silk & Silk Road 3.webp', title: 'Silk &amp; Silk Road' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Качество – субъективная вещь. Это не объективный параметр. Связано с тем, что человек проходил в своей жизни. Я не могу определить качество. Бывает: смотришь, вроде плохо, а вроде и хорошо. Либо всё хорошо, но что-то одно тебя парит так, что ты: «Да всё говно». Я в себе это пытаюсь изживать, критически относиться, говорить «вот это плохо, вот это хорошо». Потому что как только это появляется, появляется школьность. Типа «вилка слева».</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival 5.webp', title: 'Arrival' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Качество – это какой-то ещё момент про дроч. Когда ты успокоился, смотришь и такой: «Ну ладно, всё. Вроде готово». Этот момент «вроде готово», во-первых, никак не похож на то, что ты задумал. Во-вторых, всегда неидеальный, всегда можно что-то доделать. Это микс из того, что ты заебался и тебе страшно надоело, хочется переключиться, и какой-то реальной доделанности.</p><p>И ещё интересная штука: я недавно заметил, что мне нравятся все наши проекты, но в последних есть какой-то момент… Не «больше нравится», а «по-другому». Думаю, через год снова посмотрю и увижу что-то новое. Это важно, всё время отмечать, что какое-то развитие идёт. А если ты достиг идеала, которого не существует, кроме как в твоей голове, у тебя нет возможности дальше идти.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 9.webp', 'Arrival 12.webp'],
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Только как Дитер Рамс, можешь писать списки того, из чего твой идеал состоит. [смеётся]</p><p>> <em>Атрибуция А¹/А² ниже не подтверждена.</em></p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>\n        </div>\n      </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival 10.webp', title: 'Arrival' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Мне в начале интервью пришла цитата из прошлого. В комиксах про Черепашек-Ниндзя была фраза «постоянство перемен». Близко к тому, что мы сейчас разгоняем: жизнь, движение, взаимодействие. Проекты тоже должны жить и меняться.</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival 11.webp', title: 'Arrival' }],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Это классная отсылка к Макиавелли. У него есть «всё истинно – ложно».</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Arrival 2.webp', title: 'Arrival' }],
  },
  {
    marker:
      '        <blockquote class="m-quote-block">\n          <p><strong>Дизайн находится на два шага раньше, чем рисование или проектирование. Он в моменте идеи.</strong></p>\n          <cite class="m-quote-block__cite">– Артём Тарасов и Артём Тарадаш</cite>\n        </blockquote>',
    insertAfter: true,
    blocks: [{ type: 'wide', file: 'Ather 11.webp', title: 'Äther' }],
  },
  {
    marker: '      <section class="m-article-info a-section">',
    blocks: [{ type: 'wide', file: 'Etoso 3.webp', title: 'Etoso' }],
  },
];

function stripPhotos(html) {
  return html
    .replace(/    <div class="m-photo-row[\s\S]*?<\/div>\n\n/g, '')
    .replace(/    <figure class="m-photo-slot[\s\S]*?<\/figure>\n\n/g, '');
}

function applyPlacements(html) {
  photoId = 0;
  let out = stripPhotos(html);
  for (const placement of placements) {
    const insertHtml = '\n' + renderBlocks(placement.blocks) + '\n\n';
    if (!out.includes(placement.marker)) {
      throw new Error(`Marker not found: ${placement.marker.slice(0, 80)}…`);
    }
    out = placement.insertAfter
      ? out.replace(placement.marker, placement.marker + insertHtml)
      : out.replace(placement.marker, insertHtml + placement.marker);
  }
  return out;
}

function rebuildGalleryIds(html) {
  const items = [];
  const re =
    /<figure class="m-photo-slot[^"]*" id="photo-togetherwithyou-(\d+)">[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="m-photo-slot__title">([^<]*)<\/span>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    items.push({ id: Number(match[1]), src: match[2], title: match[3] });
  }
  return items;
}

function updateGallery(items) {
  let js = fs.readFileSync(GALLERY, 'utf8');
  const entries = items
    .map(
      (item) => `    {
      "src": "${item.src.replace('../../images/', '../images/')}",
      "author": "Артём Тарасов и Артём Тарадаш",
      "project": "${item.title.replace(/"/g, '\\"')}",
      "subtitle": "Мир постдизайна",
      "href": "./interviews/togetherwithyou.html#photo-togetherwithyou-${item.id}"
    }`
    )
    .join(',\n');

  js = js.replace(
    /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Артём Тарасов и Артём Тарадаш",[\s\S]*?\},\n    \{\n      "src": "\.\.\/images\/07fe256693582605e691\.webp"/,
    entries + ',\n    {\n      "src": "../images/07fe256693582605e691.webp"'
  );

  fs.writeFileSync(GALLERY, js);
}

function updateMeta(items) {
  const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
  if (!meta.interviews.togetherwithyou) {
    meta.interviews.togetherwithyou = {};
  }
  meta.interviews.togetherwithyou.images = items.map((item) => ({
    src: item.src.replace('../../images/', '../images/'),
    title: item.title,
  }));
  fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
}

function main() {
  const html = applyPlacements(fs.readFileSync(HTML, 'utf8'));
  fs.writeFileSync(HTML, html);
  const items = rebuildGalleryIds(html);
  if (items.length !== 40) {
    throw new Error(`Expected 40 photos, got ${items.length}`);
  }
  updateGallery(items);
  updateMeta(items);
  console.log(`Wired togetherwithyou: ${items.length} photos in ${placements.length} placements`);
}

main();
