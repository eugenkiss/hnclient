import {alias, deserialize, identifier, list, object, primitive, serializable} from 'serializr'
import {makeExternalItemLink, makeExternalUserLink} from '../utils'


export class Comment {
  @serializable(identifier())
  id: number
  @serializable
  level: number
  @serializable
  user: string
  @serializable
  time: number
  @serializable(alias('time_ago', primitive()))
  timeAgo: string
  @serializable
  content: string
  @serializable(list(object(Comment)))
  comments: Array<Comment>

  get externalUserLink() {
    return makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }

  // noinspection JSUnusedGlobalSymbols
  static fromJson(data: any): Comment {
    return deserialize(Comment, data)
  }
}

export class Story {
  @serializable(identifier())
  id: number
  @serializable
  title: string
  @serializable
  points: number
  @serializable
  user: string
  @serializable
  time: number
  @serializable(alias('time_ago', primitive()))
  timeAgo: string
  @serializable(alias('comments_count', primitive()))
  commentsCount: number
  @serializable
  type: string
  @serializable
  url: string
  @serializable
  domain: string
  @serializable(list(object(Comment)))
  comments: Array<Comment>

  get externalUserLink() {
    return makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }

  asStringStory(): StringStory {
    return {
      id: this.id.toString(),
      title: this.title,
      points: this.points.toString(),
      user: this.user,
      time: this.time.toString(),
      timeAgo: this.timeAgo,
      commentsCount: this.commentsCount.toString(),
      type: this.type,
      url: this.url,
      domain: this.domain,
      comments: '',
      externalUserLink: this.externalUserLink,
      externalLink: this.externalLink,
      asStringStory: '',
    }
  }

  // noinspection JSUnusedGlobalSymbols
  static fromJson(data: any): Story {
    return deserialize(Story, data)
  }
}

export type StringStory = {[P in keyof Story]: string}
