import {deserialize} from 'serializr'
import {BaseApiClient, BaseApiError} from './client-base'
import {Comment, Story} from '../models/story'

export class ApiError extends BaseApiError {}

export class ApiClient extends BaseApiClient {

  getItem = async (id: number) => {
    return this.GET<any>(`/item/${id}.json`)
  }

  getStory = async (id: number): Promise<Story> => {
    const { json } = await this.getItem(id)
    return deserialize(Story, json, null, { api: this })
  }

  getComment = async (id: number): Promise<Comment> => {
    const { json } = await this.getItem(id)
    return deserialize(Comment, json, null, { api: this })
  }

  getComments = async (kids: Array<number>): Promise<Array<Comment>> => {
    return await Promise.all((kids || []).map(async id => {
      const comment = await this.getComment(id)
      comment.comments = await this.getComments(comment.kids)
      return comment
    }))
  }

  getStoryWithComments = async (id: number): Promise<Story> => {
    const story = await this.getStory(id)
    story.comments = await this.getComments(story.kids)
    return story
  }

  getStories = async (): Promise<Array<Story>> => {
    const page = 1
    const max = 30
    const start = max * (page - 1)
    const end = start + max - 1
    const { json } = await this.GET<number[]>('/topstories.json')
    return await Promise.all(json.slice(start, end).map(async id => {
      return await this.getStory(id)
    }))
  }
}
