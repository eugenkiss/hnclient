import {deserialize} from 'serializr'
import {BaseApiClient, BaseApiError} from './client-base'
import {FeedItem, FeedType, Item} from '../models/models'

export class ApiError extends BaseApiError {}

export class ApiClient extends BaseApiClient {

  getItem = async (id: number): Promise<Item> => {
    const { json } = await this.GET(`/item/${id}.json`)
    return deserialize(Item, json)
  }

  getFeedItems = async (kind: FeedType, page?: number): Promise<Array<FeedItem>> => {
    const { json } = await this.GET<any[]>(`/${kind}.json`, {page: page})
    // noinspection UnnecessaryLocalVariableJS
    const result = deserialize(FeedItem, json)
    // return result.slice(0, Math.min(result.length, 7))
    return result
  }
}
