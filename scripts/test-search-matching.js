#!/usr/bin/env node
const assert = require('node:assert/strict');
const path = require('node:path');

const search = require(path.join(__dirname, '../src/udf/superorganisms/menu/search-matching.js'));

function item(title, subtitle, keywords) {
  var titleNorm = search.normalizeText(title);
  var subtitleNorm = search.normalizeText(subtitle);
  var keywordsNorm = search.normalizeText(keywords);
  return {
    title: title,
    subtitle: subtitle,
    kind: 'Статья',
    href: '#',
    order: 0,
    priority: 70,
    titleNorm: titleNorm,
    subtitleNorm: subtitleNorm,
    haystack: [titleNorm, subtitleNorm, keywordsNorm].join(' ').trim()
  };
}

function titles(results) {
  return results.map(function (entry) {
    return entry.title;
  });
}

function includesTitle(results, title) {
  return titles(results).indexOf(title) !== -1;
}

var index = [
  item('Ян Зарецкий', '«Мастерская» в Петербурге', 'санкт-петербург питер munk мастерская продукт студия'),
  item('Сергей Кудинов', 'Культура против симулятора в продуктовом дизайне', 'москва яндекс 360 продукт'),
  item('Артём Герц', 'Язык с нуля в айдентике', 'москва redis студия айдентика'),
  item('Алексей Пьянков', 'Дизайн-ДНК в Pragmatica', 'екатеринбург pragmatica прагматика студия'),
  item('Баухаус', 'Школа как культурная практика', 'bauhaus баухаус веймар история эссе'),
  item('Дизайн-системы', 'Система как инфраструктура', 'дизайн система material design hig история эссе')
];

assert.ok(includesTitle(search.findSearchResults(index, 'питер'), 'Ян Зарецкий'), 'alias: питер');
assert.ok(includesTitle(search.findSearchResults(index, 'дизайнеров'), 'Сергей Кудинов'), 'stem: дизайнеров');
assert.ok(includesTitle(search.findSearchResults(index, 'айдентике'), 'Артём Герц'), 'stem: айдентике');
assert.ok(includesTitle(search.findSearchResults(index, 'прагматике'), 'Алексей Пьянков'), 'alias/stem: прагматике');
assert.ok(includesTitle(search.findSearchResults(index, 'баухауса'), 'Баухаус'), 'alias: баухауса');
assert.ok(includesTitle(search.findSearchResults(index, 'системы'), 'Дизайн-системы'), 'stem: системы');
assert.ok(includesTitle(search.findSearchResults(index, 'яндексе'), 'Сергей Кудинов'), 'alias: яндексе');
assert.equal(search.findSearchResults(index, 'ai').length, 0, 'short token should not over-match');

console.log('search-matching: ok');
