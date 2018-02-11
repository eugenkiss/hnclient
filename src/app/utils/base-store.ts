import {canUseDOM} from './utils'

// TODO: Is ther a more generic way to create null objects for window, document, etc.? Proxies?

// noinspection JSUnusedLocalSymbols
const anyFunction = (...args: any[]): any => {}

export class BaseStore {
  get window(): any {
    if (canUseDOM) return window
    return {
      addEventListener: anyFunction,
      scrollTo: anyFunction,
      pageYOffset: 0,
    }
  }

  get history() {
    if (canUseDOM) return history
    return {
      back: anyFunction,
      scrollRestoration: null,
    }
  }
}
