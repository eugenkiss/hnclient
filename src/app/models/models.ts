import {alias, identifier, list, object, primitive, serializable} from 'serializr'
import {action, computed, observable} from 'mobx'
import {now} from 'mobx-utils'
import {getNow, makeExternalItemLink, makeExternalUserLink, timeAgo} from '../utils/utils'

const interval = 60 * 1000

export class Item {
  _createdAt = getNow()
  @serializable(identifier())
  id: number
  @serializable
  @observable
  title: string
  @serializable
  @observable
  points?: number
  @serializable
  user?: string
  @serializable
  time: number
  @serializable
  content: string
  @serializable
  deleted: boolean
  @serializable
  dead: boolean // TODO: handle
  @serializable
  type: string
  @serializable(alias('url', primitive()))
  _url?: string
  @serializable
  domain?: string

  @serializable(list(object(Item)))
  comments: Array<Item>
  @serializable(alias('comments_count', primitive()))
  @observable
  commentsCount: number
  @serializable
  level: number

  @computed get url(): string {
    if (this._url == null) return null
    if (!this._url.startsWith('http')) {
      // This means it points to ycombinator.com
      return makeExternalItemLink(this.id.toString())
    }
    return this._url
  }

  @computed get timeAgo(): string {
    return timeAgo(now(interval), this.time * 1000)
  }

  @computed get excerpt(): string {
    if (this.content == null) return ''
    const max = 100
    const len = this.content.length
    const trueExcerpt = len < max
    return this.content.slice(0, Math.min(100, this.content.length)) + (trueExcerpt ? '…' : '')
  }

  get externalUserLink(): string | null {
    return this.user == null ? null : makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }
}

export type Comment = Item
export type Story = Item
export type StringStory = {[P in keyof Story]: string}

export class FeedItem {
  _createdAt = getNow()
  @serializable(identifier())
  id: number
  @serializable
  @observable
  title: string
  @serializable
  @observable
  points?: number
  @serializable
  user?: string
  @serializable
  time: number
  @serializable
  type: string
  @serializable(alias('url', primitive()))
  _url?: string
  @serializable
  domain?: string
  @serializable(alias('comments_count', primitive()))
  @observable
  commentsCount: number

  @computed get url(): string {
    if (this._url == null) return null
    if (!this._url.startsWith('http')) {
      // This means it points to ycombinator.com
      return makeExternalItemLink(this.id.toString())
    }
    return this._url
  }

  @computed get timeAgo(): string {
    return timeAgo(now(interval), this.time * 1000)
  }

  get externalUserLink(): string | null {
    return this.user == null ? null : makeExternalUserLink(this.user)
  }

  get externalLink() {
    return makeExternalItemLink(this.id.toString())
  }

  @action updateFromStory(story: Item) {
    this.title = story.title
    this.points = story.points
    this.user = story.user
    this.type = story.type
    this._url = story.url
    this.domain = story.domain
    this.commentsCount = story.commentsCount
  }
}

export enum FeedType {
  Top = 'news',
  New = 'newest',
  // Best = 'best',
  Ask = 'ask',
  Show = 'show',
  Job = 'job',
}
