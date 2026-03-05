(function () {
  var articles = {
    'marina-kondratenko': {
      author: 'Марина Кондратенко',
      subtitle: 'Лондон, Берлин и Москва: три подхода к работе',
      images: [
        '../images/8a6ae07d69c4e874b52c.jpg',
        '../images/324b9db98c5f779e2f2c.jpg',
        '../images/5797605502626eb5eaa3.jpg',
        '../images/45603f1b4adcc73ea37b.jpg',
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/513f0a449c59e7eb2dcb.webp'
      ]
    },
    'sergey-meryukov': {
      author: 'Сергей Мерюков',
      subtitle: 'Дизайн как операционная система продукта',
      images: [
        '../images/d801538041a9350ba5d2.webp',
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/96f7d4116789d1f7784d.webp',
        '../images/c5deba37a7ba17c25518.webp',
        '../images/dcb01eec06cf1e00cbed.webp',
        '../images/324b9db98c5f779e2f2c.jpg'
      ]
    },
    'artem-tarasov-taradash': {
      author: 'Артём Тарасов и Артём Тарадаш',
      subtitle: 'Анти-дисциплина: на стыке стратегии, бренда и кода',
      images: [
        '../images/8a6ae07d69c4e874b52c.jpg',
        '../images/513f0a449c59e7eb2dcb.webp',
        '../images/324b9db98c5f779e2f2c.jpg',
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/86c2cda628bf2b209a91.webp',
        '../images/45603f1b4adcc73ea37b.jpg'
      ]
    },
    'filipp-tretyakov': {
      author: 'Филипп Третьяков',
      subtitle: 'Брендинг от сути продукта',
      images: [
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/86c2cda628bf2b209a91.webp',
        '../images/513f0a449c59e7eb2dcb.webp',
        '../images/d801538041a9350ba5d2.webp',
        '../images/324b9db98c5f779e2f2c.jpg',
        '../images/5797605502626eb5eaa3.jpg'
      ]
    },
    'polina-zagumenova': {
      author: 'Полина Загуменова',
      subtitle: 'Одиночная практика: как держать качество и свободу',
      images: [
        '../images/45603f1b4adcc73ea37b.jpg',
        '../images/8a6ae07d69c4e874b52c.jpg',
        '../images/1d0536b32e76aa8ad169.webp',
        '../images/324b9db98c5f779e2f2c.jpg',
        '../images/5797605502626eb5eaa3.jpg',
        '../images/513f0a449c59e7eb2dcb.webp'
      ]
    },
    'alexander-ivan-vasiny': {
      author: 'Александр и Иван Васины',
      subtitle: 'Как сообщества формируют практику',
      images: [
        '../images/86c2cda628bf2b209a91.webp',
        '../images/8a6ae07d69c4e874b52c.jpg',
        '../images/d801538041a9350ba5d2.webp',
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/45603f1b4adcc73ea37b.jpg',
        '../images/513f0a449c59e7eb2dcb.webp'
      ]
    },
    'ira-kosheleva': {
      author: 'Ира Кошелева',
      subtitle: 'Нью-Йорк: работа в процессе',
      images: [
        '../images/3f7901bcc62741e03722.jpg',
        '../images/45603f1b4adcc73ea37b.jpg',
        '../images/8a6ae07d69c4e874b52c.jpg',
        '../images/8c30a668aa8d06217ed6.webp',
        '../images/d801538041a9350ba5d2.webp',
        '../images/324b9db98c5f779e2f2c.jpg'
      ]
    }
  };

  var entries = [];
  Object.keys(articles).forEach(function (slug) {
    var article = articles[slug];
    article.images.forEach(function (src, idx) {
      entries.push({
        src: src,
        slug: slug,
        author: article.author,
        subtitle: article.subtitle,
        kind: idx % 3 === 0 ? 'tall' : 'wide'
      });
    });
  });

  var tableView = document.getElementById('tableView');
  var sliderView = document.getElementById('sliderView');
  var tableBtn = document.getElementById('tableBtn');
  var sliderBtn = document.getElementById('sliderBtn');

  entries.forEach(function (item) {
    var card = document.createElement('a');
    card.className = 'gallery-item ' + item.kind;
    card.href = './article.html?slug=' + item.slug;
    card.innerHTML =
      '<img src="' +
      item.src +
      '" alt="' +
      item.author +
      '"><span class="overlay"></span><span class="go a-arrow-button a-arrow-button--corner" aria-hidden="true"></span>';
    tableView.appendChild(card);

    var slide = document.createElement('a');
    slide.className = 'gallery-slide';
    slide.href = './article.html?slug=' + item.slug;
    slide.innerHTML = '<img src="' + item.src + '" alt="' + item.author + '">';
    sliderView.appendChild(slide);
  });

  function activate(mode) {
    var isTable = mode === 'table';
    tableBtn.classList.toggle('is-active', isTable);
    sliderBtn.classList.toggle('is-active', !isTable);
    tableBtn.setAttribute('aria-selected', isTable ? 'true' : 'false');
    sliderBtn.setAttribute('aria-selected', isTable ? 'false' : 'true');
    tableView.hidden = !isTable;
    sliderView.hidden = isTable;
  }

  tableBtn.addEventListener('click', function () {
    activate('table');
  });

  sliderBtn.addEventListener('click', function () {
    activate('slider');
  });
})();
