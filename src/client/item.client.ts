import { AllConfig } from '../config/all-config';
import { GaxiosResponse } from 'gaxios';
import { httpClient } from '../helpers/http';
import { StatusCodes } from 'http-status-codes';

export type ItemDto = {
  token: string;
  sku: string;
}

export type CreateItemRequestDto = {
  sku: string;

  user: string;

  giveaway: string;
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

export async function getItemForRetailer(cfg: AllConfig, platform: string, code: string): Promise<ItemDto|null> {

  const client = await httpClient(cfg.itemGetUrl);

  try {
    const resp: GaxiosResponse<ItemDto> = await client.request({
      url: `${cfg.itemGetUrl}/retailer/${platform}/${code}`
    });
    return resp.data;
  } catch (e) {
    if (e.response?.status === StatusCodes.NOT_FOUND) {
      return null;
    } 
    throw e;
    
  }
}
