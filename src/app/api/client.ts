import {deserialize} from 'serializr'
import {BaseApiClient, BaseApiError} from './client-base'
import {Comment, StoriesKind, Story} from '../models/models'

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
      try {
        const comment = await this.getComment(id)
        comment.comments = await this.getComments(comment.kids)
        return comment
      } catch (e) {
        // Since a lot of requests can be made we don't want to render
        // nothing if a few requests failed
        console.error(e)
        const failedComment = new Comment(this)
        failedComment.user = '[failed]'
        failedComment.time = new Date().getTime() / 1000
        failedComment.content = '[failed]'
        return failedComment
      }
    }))
  }

  getStoryWithComments = async (id: number): Promise<Story> => {
    const story = await this.getStory(id)
    story.comments = await this.getComments(story.kids)
    return story
  }

  getStories = async (kind: StoriesKind): Promise<Array<Story>> => {
    const page = 1
    const max = 30
    const start = max * (page - 1)
    const end = start + max - 1
    const { json } = await this.GET<number[]>(`/${kind}stories.json`)
    return await Promise.all(json.slice(start, end).map(async id => {
      return await this.getStory(id)
    }))
  }
}
