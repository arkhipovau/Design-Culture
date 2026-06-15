(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.DefindingsSearch = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var RU_SUFFIXES = [
    'ированием',
    'ировании',
    'ованием',
    'овании',
    'ирование',
    'ование',
    'ениями',
    'ениям',
    'ениях',
    'ением',
    'ении',
    'ения',
    'ений',
    'ами',
    'ями',
    'ого',
    'его',
    'ому',
    'ему',
    'ыми',
    'ими',
    'ать',
    'ять',
    'ить',
    'еть',
    'ать',
    'ять',
    'ться',
    'ться',
    'ах',
    'ях',
    'ов',
    'ев',
    'ей',
    'ом',
    'ем',
    'ам',
    'ям',
    'ую',
    'юю',
    'ой',
    'ый',
    'ий',
    'ая',
    'яя',
    'ое',
    'ее',
    'ые',
    'ие',
    'ал',
    'ил',
    'ел',
    'ла',
    'ло',
    'ли',
    'а',
    'я',
    'у',
    'ю',
    'е',
    'и',
    'ы',
    'о'
  ];

  var TOKEN_ALIASES = {
    питер: ['санкт', 'петербург', 'петербурге'],
    спб: ['санкт', 'петербург', 'петербурге'],
    мск: ['москва', 'москве', 'москву'],
    лондоне: ['лондон'],
    берлине: ['берлин'],
    тбилиси: ['тбилиси'],
    дизайнер: ['дизайн'],
    дизайнеры: ['дизайн'],
    дизайнера: ['дизайн'],
    дизайнеров: ['дизайн'],
    дизайнеру: ['дизайн'],
    дизайнером: ['дизайн'],
    дизайнере: ['дизайн'],
    дизайнерская: ['дизайн'],
    дизайнерский: ['дизайн'],
    дизайнерское: ['дизайн'],
    дизайнерские: ['дизайн'],
    дизайнерскую: ['дизайн'],
    дизайнерским: ['дизайн'],
    дизайнерских: ['дизайн'],
    дизайнерскими: ['дизайн'],
    дизайнерской: ['дизайн'],
    дизайнерском: ['дизайн'],
    дизайнерского: ['дизайн'],
    дизайнерскому: ['дизайн'],
    интервью: ['статья', 'интервью'],
    история: ['история', 'эссе'],
    истории: ['история', 'эссе'],
    историю: ['история', 'эссе'],
    эссе: ['история', 'эссе'],
    журнале: ['журнал'],
    журналу: ['журнал'],
    галерее: ['галерея'],
    галерею: ['галерея'],
    подписка: ['рассылка', 'newsletter'],
    подписку: ['рассылка', 'newsletter'],
    подписки: ['рассылка', 'newsletter'],
    pragmatica: ['pragmatica', 'прагматика'],
    прагматики: ['pragmatica', 'прагматика'],
    прагматике: ['pragmatica', 'прагматика'],
    яндексе: ['яндекс'],
    яндекса: ['яндекс'],
    додо: ['dodo', 'додо'],
    брендинг: ['брендинг'],
    брендинга: ['брендинг'],
    брендингу: ['брендинг'],
    брендингом: ['брендинг'],
    айдентика: ['айдентика', 'айдентике', 'айдентики'],
    айдентике: ['айдентика', 'айдентике', 'айдентики'],
    айдентики: ['айдентика', 'айдентике', 'айдентики'],
    минимализм: ['минимализм', 'минимализма', 'muji'],
    минимализма: ['минимализм', 'минимализма', 'muji'],
    система: ['система', 'системы', 'system'],
    системы: ['система', 'системы', 'system'],
    систему: ['система', 'системы', 'system'],
    архитектура: ['архитектура', 'архитектуры'],
    архитектуры: ['архитектура', 'архитектуры'],
    архитектурный: ['архитектура', 'архитектуры'],
    архитектурная: ['архитектура', 'архитектуры'],
    архитектурное: ['архитектура', 'архитектуры'],
    архитектурные: ['архитектура', 'архитектуры'],
    продуктовый: ['продукт'],
    продуктовая: ['продукт'],
    продуктовое: ['продукт'],
    продуктовые: ['продукт'],
    продуктового: ['продукт'],
    продуктовой: ['продукт'],
    продуктовому: ['продукт'],
    продуктовом: ['продукт'],
    студии: ['студия', 'студию', 'студией'],
    студию: ['студия', 'студию', 'студией'],
    студией: ['студия', 'студию', 'студией'],
    студия: ['студия', 'студию', 'студией'],
    мастерской: ['мастерская', 'мастерскую'],
    мастерскую: ['мастерская', 'мастерскую'],
    мастерская: ['мастерская', 'мастерскую'],
    баухауса: ['bauhaus', 'баухаус'],
    баухаусу: ['bauhaus', 'баухаус'],
    баухаусом: ['bauhaus', 'баухаус'],
    баухаусе: ['bauhaus', 'баухаус'],
    баухаус: ['bauhaus', 'баухаус'],
    ульмской: ['ulm', 'ульм'],
    ульмская: ['ulm', 'ульм'],
    ульмскую: ['ulm', 'ульм'],
    ульм: ['ulm', 'ульм'],
    искусственный: ['ai', 'искусственный'],
    интеллект: ['ai', 'интеллект'],
    нейросеть: ['ai', 'нейросет'],
    нейросети: ['ai', 'нейросет'],
    нейросетей: ['ai', 'нейросет']
  };

  var SHORT_TOKEN_EXACT = {
    ai: true,
    ux: true,
    ui: true,
    ony: true,
    oni: true,
    ton: true,
    msk: true,
    spb: true
  };

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9\s-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isCyrillicWord(word) {
    return /[а-я]/.test(word);
  }

  function stemEnglish(word) {
    var result = word;
    if (result.length >= 5 && result.slice(-3) === 'ing') {
      result = result.slice(0, -3);
    } else if (result.length >= 4 && result.slice(-2) === 'ed') {
      result = result.slice(0, -2);
    } else if (result.length >= 4 && result.slice(-2) === 'es') {
      result = result.slice(0, -2);
    } else if (result.length >= 4 && result.slice(-1) === 's') {
      result = result.slice(0, -1);
    }
    return result;
  }

  function stemWord(word) {
    if (!word) return '';
    if (word.length < 4) return word;

    if (!isCyrillicWord(word)) {
      return stemEnglish(word);
    }

    var result = word;
    var guard = 0;
    while (result.length >= 4 && guard < 4) {
      guard += 1;
      var changed = false;
      for (var i = 0; i < RU_SUFFIXES.length; i += 1) {
        var suffix = RU_SUFFIXES[i];
        if (result.length - suffix.length < 3) continue;
        if (result.slice(-suffix.length) === suffix) {
          result = result.slice(0, -suffix.length);
          changed = true;
          break;
        }
      }
      if (!changed) break;
    }
    return result;
  }

  function splitWords(text) {
    return normalizeText(text)
      .split(' ')
      .filter(function (word) {
        return word.length > 0;
      });
  }

  function expandToken(token) {
    var forms = [token];
    var stem = stemWord(token);
    if (stem && stem !== token) {
      forms.push(stem);
    }

    var aliases = TOKEN_ALIASES[token];
    if (aliases) {
      aliases.forEach(function (alias) {
        if (forms.indexOf(alias) === -1) forms.push(alias);
        var aliasStem = stemWord(alias);
        if (aliasStem && forms.indexOf(aliasStem) === -1) {
          forms.push(aliasStem);
        }
      });
    }

    return forms;
  }

  function shareStemPrefix(a, b, minLen) {
    var limit = Math.min(a.length, b.length);
    while (limit >= minLen) {
      if (a.slice(0, limit) === b.slice(0, limit)) return true;
      limit -= 1;
    }
    return false;
  }

  function matchTokenInFields(token, fields) {
    if (!token) return null;

    if (token.length <= 3 || SHORT_TOKEN_EXACT[token]) {
      if (fields.haystack.indexOf(' ' + token + ' ') !== -1) {
        return { quality: 'exact-short', form: token };
      }
      if (fields.haystack.indexOf(token) === 0) {
        return { quality: 'exact-short', form: token };
      }
      if (fields.haystack.slice(-token.length) === token) {
        return { quality: 'exact-short', form: token };
      }
      return null;
    }

    var forms = expandToken(token);
    var best = null;

    forms.forEach(function (form) {
      if (!form) return;

      if (fields.haystack.indexOf(form) !== -1) {
        best = pickBetter(best, { quality: 'substring', form: form });
      }

      fields.words.forEach(function (word) {
        if (word === form) {
          best = pickBetter(best, { quality: 'exact', form: form });
          return;
        }

        var wordStem = fields.stems[word] || stemWord(word);
        var formStem = stemWord(form);
        if (wordStem && formStem && wordStem === formStem) {
          best = pickBetter(best, { quality: 'stem', form: form });
          return;
        }

        if (form.length >= 4 && word.indexOf(form) === 0) {
          best = pickBetter(best, { quality: 'prefix', form: form });
          return;
        }

        if (formStem.length >= 4 && shareStemPrefix(wordStem, formStem, 4)) {
          best = pickBetter(best, { quality: 'stem-prefix', form: form });
        }
      });
    });

    return best;
  }

  var QUALITY_SCORE = {
    'exact-short': 24,
    exact: 22,
    substring: 18,
    stem: 16,
    prefix: 12,
    'stem-prefix': 10
  };

  function pickBetter(current, next) {
    if (!current) return next;
    var currentScore = QUALITY_SCORE[current.quality] || 0;
    var nextScore = QUALITY_SCORE[next.quality] || 0;
    return nextScore > currentScore ? next : current;
  }

  function enrichSearchItem(item) {
    var words = splitWords(item.haystack || '');
    var stems = {};
    words.forEach(function (word) {
      stems[word] = stemWord(word);
    });

    return Object.assign({}, item, {
      words: words,
      stems: stems,
      haystack: ' ' + normalizeText(item.haystack || '') + ' '
    });
  }

  function scoreSearchItem(item, query, tokens, tokenMatches) {
    var score = item.priority || 0;
    var normalized = normalizeText(query);

    if (item.titleNorm.indexOf(normalized) === 0) score += 120;
    else if (item.titleNorm.indexOf(normalized) !== -1) score += 85;
    if (item.subtitleNorm.indexOf(normalized) !== -1) score += 45;

    tokens.forEach(function (token, index) {
      var match = tokenMatches[index];
      if (!match) return;

      score += QUALITY_SCORE[match.quality] || 0;
      if (item.titleNorm.indexOf(match.form) !== -1) score += 20;
      else if (item.subtitleNorm.indexOf(match.form) !== -1) score += 8;
      else score += 2;
    });

    return score;
  }

  function findSearchResults(index, query) {
    var normalized = normalizeText(query);
    if (!normalized) {
      return index.slice(0, 8);
    }

    var tokens = normalized.split(' ').filter(Boolean);
    var enriched = index.map(enrichSearchItem);

    return enriched
      .map(function (item) {
        var tokenMatches = tokens.map(function (token) {
          return matchTokenInFields(token, item);
        });

        var allTokensFound = tokenMatches.every(Boolean);
        if (!allTokensFound) return null;

        return {
          item: item,
          score: scoreSearchItem(item, query, tokens, tokenMatches)
        };
      })
      .filter(Boolean)
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.order - b.item.order;
      })
      .slice(0, 10)
      .map(function (entry) {
        return entry.item;
      });
  }

  return {
    normalizeText: normalizeText,
    stemWord: stemWord,
    expandToken: expandToken,
    enrichSearchItem: enrichSearchItem,
    findSearchResults: findSearchResults
  };
});
