import {deserialize} from 'serializr'
import {BaseApiClient, BaseApiError} from './client-base'
import {Story} from '../models/story'

export class ApiError extends BaseApiError {}

export class ApiClient extends BaseApiClient {

  getStories = async (): Promise<Array<Story>> => {
    const { json } = await this.GET('/news', { page: 1 })
    return deserialize(Story, json as any[])
  }

  getStory = async (id: number): Promise<Story> => {
    const { json } = await this.GET(`/item/${id}`)
    return deserialize(Story, json)
  }

}
