import en from './messages/en.json';
import vi from './messages/vi.json';
import jp from './messages/jp.json';

type NestedObject = { [key: string]: string | NestedObject };

function collectKeys(obj: NestedObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' ? collectKeys(value, fullKey) : [fullKey];
  });
}

const enKeys = collectKeys(en);

describe('i18n translation completeness', () => {
  describe('vi.json', () => {
    const viKeys = new Set(collectKeys(vi));
    it.each(enKeys)('has key "%s"', key => {
      expect(viKeys.has(key)).toBe(true);
    });
  });

  describe('jp.json', () => {
    const jpKeys = new Set(collectKeys(jp));
    it.each(enKeys)('has key "%s"', key => {
      expect(jpKeys.has(key)).toBe(true);
    });
  });
});
