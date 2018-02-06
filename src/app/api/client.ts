import {deserialize} from 'serializr'
import {BaseApiClient, BaseApiError} from './client-base'
import {FeedItem, FeedType, Item} from '../models/models'

export class ApiError extends BaseApiError {}

export class ApiClient extends BaseApiClient {

  getItem = async (id: number): Promise<Item> => {
    const { json } = await this.GET(`/item/${id}.json`)
    return deserialize(Item, json)
  }

  getFeedItems = async (kind: FeedType): Promise<Array<FeedItem>> => {
    const { json } = await this.GET<any[]>(`/${kind}.json`)
    return deserialize(FeedItem, json)
  }
}
