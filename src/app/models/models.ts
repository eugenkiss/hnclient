import {alias, createModelSchema, getDefaultModelSchema, identifier, list, primitive, serializable} from 'serializr'
import {computed} from 'mobx'
import {now} from 'mobx-utils'
import {makeExternalItemLink, makeExternalUserLink, timeAgo} from '../utils/utils'
import {ApiClient} from '../api/client'

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
  @serializable
  deleted: boolean
  @serializable(list(primitive()))
  kids: Array<number>

  comments: Array<Comment>

  @computed get timeAgo(): string {
    return timeAgo(now(), this.time * 1000)
  }

  @computed get excerpt(): string {
    if (this.content == null) return ''
    const max = 100
    const len = this.content.length
    const trueExcerpt = len < max
    return this.content.slice(0, Math.min(100, this.content.length)) + (trueExcerpt ? '…' : '')
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
  @serializable
  deleted: boolean
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
    return timeAgo(now(), this.time * 1000)
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

export enum StoriesKind {
  Top = 'top',
  New = 'new',
  Best = 'best',
  Ask = 'ask',
  Show = 'show',
  Job = 'job',
}
