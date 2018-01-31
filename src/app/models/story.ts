import {alias, createModelSchema, getDefaultModelSchema, identifier, list, primitive, serializable} from 'serializr'
import {computed} from 'mobx'
import {now} from 'mobx-utils'
import * as ms from 'ms'
import {makeExternalItemLink, makeExternalUserLink} from '../utils'
import {ApiClient} from '../api/client'

const timeUnitMap = {
  s: 'seconds',
  ms: 'milliseconds',
  m: 'minutes',
  h: 'hours',
  d: 'days',
}

const clock = now(1000 * 60)

export class Comment {
  // noinspection JSUnusedLocalSymbols
  constructor(private api: ApiClient) {}

  @serializable(identifier())
  id: number
  @serializable
  parent: number
  @serializable(alias('by', primitive()))
  user: string
  @serializable
  time: number
  @serializable(alias('text', primitive()))
  content: string
  @serializable(list(primitive()))
  kids: Array<number>

  comments: Array<Comment>

  @computed get timeAgo(): string {
    return ms(/*new Date().getTime()*/ clock - this.time * 1000).replace(/[a-z]+/, str => ` ${timeUnitMap[str]} ago`)
  }

  get externalUserLink() {
    return makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }
}

// TODO: Probably not needed
createModelSchema(Comment, getDefaultModelSchema(Comment).props, ctx => {
  const comment = new Comment(ctx.args.api)
  if (comment.kids == null) comment.kids = []
  return comment
})

export class Story {
  // noinspection JSUnusedLocalSymbols
  constructor(private api: ApiClient) {}

  @serializable(identifier())
  id: number
  @serializable
  title: string
  @serializable(alias('score', primitive()))
  points: number
  @serializable(alias('by', primitive()))
  user: string
  @serializable
  time: number
  @serializable(alias('text', primitive()))
  content: string
  @serializable(list(primitive()))
  kids: Array<number>
  @serializable(alias('descendants', primitive()))
  commentsCount: number
  @serializable
  type: string
  @serializable
  url: string

  comments: Array<Comment>

  @computed get domain(): string {
    try {
      const host = new URL(this.url).host
      return host.startsWith('www.') ? host.slice('www.'.length) : host
    } catch (e) {
      return null
    }
  }

  @computed get timeAgo(): string {
    return ms(clock - this.time * 1000).replace(/[a-z]+/, str => ` ${timeUnitMap[str]} ago`)
  }

  get externalUserLink() {
    return makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }
}

// TODO: Probably not needed
createModelSchema(Story, getDefaultModelSchema(Story).props, ctx => {
  const story = new Story(ctx.args.api)
  if (story.kids == null) story.kids = []
  return story
})

export type StringStory = {[P in keyof Story]: string}
