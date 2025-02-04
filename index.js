//@ts-check

// http://stackoverflow.com/questions/14970224/anyone-know-of-a-good-way-to-convert-from-less-to-sass

function Less2Sass(){

}

Less2Sass.prototype.convert = function(file) {

  this.file = file;

  this.convertInterpolatedVariables()
      .convertVariables()
      .convertTildaStrings()
      .convertMixinsWhen()
      .convertMixins()
      .includeMixins()
      .convertExtend()
      .convertColourHelpers()
      .convertFileExtensions()
      .convertFunctionUnit();

  return this.file;
};

Less2Sass.prototype.includeMixins = function() {
  var includeRegex = /^(\s*)\.([a-zA-Z][\w\-]*\(?[^;{}]*\)?;{1}$)/gm;

  this.file = this.file.replace(includeRegex, '$1@include $2');

  return this;
};


Less2Sass.prototype.convertMixins = function() {
  // Simple form: no semicolons.
  const mixinRegexNoSemicolon = /^(\s*?)\.([\w\-]*?)\s*\(([\s\S][^\;]+?)?\)\s*\{$/gm;
  this.file = this.file.replace(mixinRegexNoSemicolon, '$1@mixin $2($3) {');
  // With semicolons.
  const mixinRegexWithSemicolon = /^(\s*?)\.([\w\-]*?)\s*\(([\s\S][^\,]+?)?\)\s*\{$/gm;
  this.file = this.file.replace(mixinRegexWithSemicolon, function (match, g1, g2, g3) {
    return g1 + '@mixin ' + g2 + '(' + g3.replace(/;/g, ',') + ') {';
  });
  return this;
};

Less2Sass.prototype.convertMixinsWhen = function () {
  
  const mixinWhenRegex = /^([ \t]*?)\.([\w\-]*?)\s*\(([^\)]+?)?\)\s*when \(((?:\s*default\(\s*\)\s*)|(?:[^\)]+))\)\s*\{([\s\S]*?)[\n\r]}/gm;
  // const mixinWhenRegex = /^([ \t]*?)\.([\w\-]*?)\s*\(([^\)]+?)?\)\s*when \(([^\)]+)\)\s*\{([\s\S]*?)[\n\r]}/gm;    
  // this.file = this.file.replace(mixinWhenRegex, '$1@mixin $2($3) {');

  let mixins = {}
  const mixinArgs = {}

  this.file = this.file.replace(mixinWhenRegex, function (match, indent, mixinName, args, condition, body) {

    const indentUnit = ' '.repeat(4);                 //  '\t';
    mixinName = args.trim()
      ? mixinName + '(' + args + ')'
      : ('%' + mixinName)
    condition = condition.replace(/[^\>\<](=)[^\>\<]\b/g, '==');

    const statement = condition.trim().startsWith('default(')
      ? '@else'
      : mixins[mixinName]
        ? ('@else if ' + condition.replace(/=/g, '=='))
        : ('@if ' + condition);
    // has no 100% convertion analog, elseif|if does not cover all cases. Thuth => some kind of `if & elseif` (custom mixin)
    // : ('@if ' + condition)
    let content = indent + indentUnit + statement + ' {' + body.split('\n').map(line => indentUnit + line).join('\n') + '\n' + indent + indentUnit + '}\n'
    mixins[mixinName] = (mixins[mixinName] || '') + content;

    // return indent + '@mixin ' + mixinName + '(' + args.replace(/\@/g, '$') + ') {\n' + content + '\n' + indent + '}'
    return (mixins[mixinName] == content)
      ? 'convertMixinsWhen__' + mixinName
      : ''
  });

  Object.entries(mixins).forEach(([mixinName, content]) => {
    this.file = this.file.replace('convertMixinsWhen__' + mixinName, '@mixin ' + mixinName + '{\n' + content + '}\n');
  })

  this.file = this.file.replace(/\n\n+/g, '\n\n')

  this.file = this.file.replace(/^([ \t]*?)\&[ ]*when[ ]*\(([^\)]+)\)/gm, '$1if $2')

  return this;
};

Less2Sass.prototype.convertFunctionUnit = function() {
  // Two-args.
  const unitTwoArgRegex = /unit\((\S+),(\S+)\)/g;
  this.file = this.file.replace(unitTwoArgRegex, '0$2 + $1');
  // One-arg.
  const unitOneArgRegex = /unit\(([^,]+)\)/g;
  this.file = this.file.replace(unitOneArgRegex, 'unit-less($1)');

  return this;
};

Less2Sass.prototype.convertExtend = function() {
  // http://lesscss.org/features/#extend-feature
  // &:extend syntax.
  const andExtendRegex = /&:extend\((.[\w]*)\);/g;
  this.file = this.file.replace(andExtendRegex, '@extend $1;');

  return this;
};

Less2Sass.prototype.convertColourHelpers = function() {
  var helperRegex = /spin\(/g;

  this.file = this.file.replace(helperRegex, 'adjust-hue(');

  // TODO (EK): Flag other colour helpers for manual conversion that SASS does not have

  return this;
};

Less2Sass.prototype.convertTildaStrings = function() {
  var tildaRegex = /~("|')/g;

  this.file = this.file.replace(tildaRegex, '$1');

  return this;
};

Less2Sass.prototype.convertInterpolatedVariables = function() {
  var interpolationRegex = /@\{(?!(\s|\())/g;

  this.file = this.file.replace(interpolationRegex, '#{$');

  return this;
};

Less2Sass.prototype.convertVariables = function() {
  // Matches any @ that doesn't have 'media ' or 'import ' after it.
  var atRegex = /@(?!(media|import|mixin|font-face|keyframes)(\s|\())/g;

  this.file = this.file.replace(atRegex, '$');

  return this;
};

Less2Sass.prototype.convertFileExtensions = function() {
  var extensionRegex = /\.less/g;

  this.file = this.file.replace(extensionRegex, '.scss');

  return this;
};

module.exports = new Less2Sass();
