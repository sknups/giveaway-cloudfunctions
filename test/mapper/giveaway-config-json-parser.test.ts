import "reflect-metadata";
import { parseConfig } from '../../src/mapper/giveaway-config-json-parser';

function _config(): any {
  return {
    skuEntries: [
      {
        code: 'SKU-CODE-1',
        weight: '500'
      },
      {
        code: 'SKU-CODE-2',
        weight: null
      }
    ]
  };
}

describe('mapper - giveaway card json parser', () => {

  it('valid JSON returns object', () => {
    const config = _config();

    const result = parseConfig(JSON.stringify(config));
    expect(result?.skuEntries).toHaveLength(2);
    expect(result?.skuEntries[0].code).toEqual('SKU-CODE-1');
    expect(result?.skuEntries[0].weight).toEqual('500');
    expect(result?.skuEntries[1].code).toEqual('SKU-CODE-2');
    expect(result?.skuEntries[1].weight).toEqual(null);
  });

});
