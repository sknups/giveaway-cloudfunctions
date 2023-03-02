import { sortFortuneSkus } from '../../src/helpers/giveaway';
import { SkuEntry } from '../../src/mapper/giveaway-config-json-parser';

const TEST_ENTRIES: SkuEntry[] = [
  { code: 'c1', weight: 1 },
  { code: 'c2', weight: 2 },
  { code: 'c3', weight: 7 },
];

const TEST_RANDOM = [
  0.555490829685213,
  0.33828879791260325,
  0.6801784590624975,
  0.5460202039643196,
  0.0010224756056698148,
  0.5506469046005078,
  0.8723997268277841,
  0.5854265422022902,
  0.004758631688537518,
  0.051209879087781074,
];

function _createRandomProvider(allNumbers: number[]): () => number {
  return () => {
    const result = allNumbers.shift();
    if (!result) {
      throw new Error('All numbers consumed from test random provider');
    }
    return result;
  }
}

describe('giveaway helper', () => {

  it('returns expected order with given random numbers', () => {

    expect(
      sortFortuneSkus(TEST_ENTRIES, _createRandomProvider([...TEST_RANDOM])),
    ).toEqual(['c3', 'c2', 'c1']);

    expect(
      sortFortuneSkus(TEST_ENTRIES, _createRandomProvider([...TEST_RANDOM].reverse())),
    ).toEqual(['c1', 'c2', 'c3']);

    expect(
      sortFortuneSkus(TEST_ENTRIES, _createRandomProvider([TEST_RANDOM.slice(3), TEST_RANDOM.slice(0, 3)].flat())),
    ).toEqual(['c3', 'c1', 'c2']);

  });

  it('does not use randomProvider for single sku entry', () => {

    const randomProvider = () => {
      throw new Error('The randomProvider should not be called for a single SKU entry');
    }

    expect(
      sortFortuneSkus([{ code: 'just1', weight: 99 }], randomProvider),
    ).toEqual(['just1']);

  });

});
