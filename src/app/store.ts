import {action, autorun, observable} from 'mobx'
import {fromPromise, FULFILLED, PENDING, whenAsync} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {ApiClient} from './api/client'
import {RouterStore} from './router'
import {Story} from './models/story'

const fulfilledReq = fromPromise.resolve(null)

export class UiStore {

  constructor(
    public api: ApiClient,
    public routerStore: RouterStore,
  ) {
    if ('scrollRestoration' in history) { history.scrollRestoration = 'manual' }

    routerStore.restoreUiStates()
    window.addEventListener('unload', () => {
      routerStore.persistUiStates()
    })

    autorun(() => {
      if ( this.getStoriesReq.state === PENDING
        || this.getStoryReq.state === PENDING
      ) {
        NProgress.start()
      } else {
        NProgress.done()
      }
    })
  }

  @observable lastGetStoriesValue: Array<Story>
  @observable getStoriesReq: Req<Array<Story>> = fulfilledReq
  @action getStories = async () => {
    this.getStoriesReq = fromPromise(this.api.getStories())
    await whenAsync(() => this.getStoriesReq.state !== 'pending')
    if (this.getStoriesReq.state !== FULFILLED) return
    this.lastGetStoriesValue = this.getStoriesReq.value
  }

  @observable storyCache = observable.map<Story>()
  @observable getStoryReq: Req<Story> = fulfilledReq
  @action getStory = async (id) => {
    this.getStoryReq = fromPromise(this.api.getStory(id))
    const req = this.getStoryReq
    await whenAsync(() => req.state !== 'pending')
    if (req.state !== FULFILLED) return
    this.storyCache.set(req.value.id.toString(), req.value)
  }
}
