import {alias, deserialize, identifier, list, object, primitive, serializable} from 'serializr'


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

  // noinspection JSUnusedGlobalSymbols
  static fromJson(data: any): Story {
    return deserialize(Story, data)
  }
}
