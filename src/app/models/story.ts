import {alias, deserialize, identifier, primitive, serializable} from 'serializr'

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

  // noinspection JSUnusedGlobalSymbols
  static fromJson(data: any): Story {
    return deserialize(Story, data)
  }
}
