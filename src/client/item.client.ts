import { AllConfig } from '../config/all-config';
import { GaxiosResponse } from 'gaxios';
import { httpClient } from '../helpers/http';

export type ItemDto = {
  token: string;
  sku: string;
}

export type CreateItemRequestDto = {
  skuCode: string;

  user: string;

  claimCode: string;
}

export async function createItem(data: CreateItemRequestDto, cfg: AllConfig): Promise<ItemDto> {

  const client = await httpClient(cfg.itemCreateUrl);

  const resp: GaxiosResponse<ItemDto> = await client.request({
    url: cfg.itemCreateUrl,
    method: 'POST',
    data,
  });

  if (!resp.data.token) {
    throw new Error(`Unexpected response from ${cfg.itemCreateUrl}: no item token found in response: ${JSON.stringify(resp.data)}`);
  }
  return resp.data;

}

export async function getItem(cfg: AllConfig, code: string): Promise<ItemDto> {

  const client = await httpClient(cfg.itemGetUrl);

  const resp: GaxiosResponse<ItemDto> = await client.request({
    url: `${cfg.itemGetUrl}/${code}`,
    method: 'GET'
  });

  return resp.data;
}
