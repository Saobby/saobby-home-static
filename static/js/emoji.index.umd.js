(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.markedEmoji = {}));
})(this, (function (exports) { 'use strict';

  const defaultOptions = {
    // emojis: {}, required
    unicode: false
  };

  function markedEmoji(options) {
    options = {
      ...defaultOptions,
      ...options
    };

    if (!options.emojis) {
      throw new Error('Must provide emojis to markedEmoji');
    }

    const emojiNames = Object.keys(options.emojis).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const emojiRegex = new RegExp(`:(${emojiNames}):`);
    const tokenizerRule = new RegExp(`^${emojiRegex.source}`);

    return {
      extensions: [{
        name: 'emoji',
        level: 'inline',
        start(src) { return src.match(emojiRegex)?.index; },
        tokenizer(src, tokens) {
          const match = tokenizerRule.exec(src);
          if (!match) {
            return;
          }

          const name = match[1];
          const emoji = options.emojis[name];

          return {
            type: 'emoji',
            raw: match[0],
            name,
            emoji
          };
        },
        renderer(token) {
          if (options.unicode) {
            return token.emoji;
          } else {
            return `<img style="vertical-align:text-bottom;" height="${token.name.startsWith('stk_')?'64px':'24px'}" alt="${token.name}" src="${token.emoji}"${this.parser.options.xhtml ? ' /' : ''}>`;
          }
        }
      }]
    };
  }

  exports.markedEmoji = markedEmoji;

}));
