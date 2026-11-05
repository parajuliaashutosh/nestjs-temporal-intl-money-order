const { TsJestTransformer } = require('ts-jest');

const IMPORT_META_URL = /\bimport\.meta\.url\b/g;
const CJS_URL = "require('url').pathToFileURL(__filename).href";
const SHADOWED_REQUIRE = /^const require = .*createRequire\(.*$/gm;

const rewrite = (source) =>
  source.replace(SHADOWED_REQUIRE, '').replace(IMPORT_META_URL, CJS_URL);

class EsmTransformer extends TsJestTransformer {
  process(source, filePath, options) {
    return super.process(rewrite(source), filePath, options);
  }

  getCacheKey(source, filePath, options) {
    return super.getCacheKey(rewrite(source), filePath, options);
  }
}

module.exports = {
  createTransformer: (config) =>
    new EsmTransformer({ ...config, tsconfig: { allowJs: true } }),
};
