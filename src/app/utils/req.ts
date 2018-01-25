import {fromPromise, FULFILLED, IPromiseBasedObservable, PENDING} from 'mobx-utils'
import {PromiseState} from 'mobx-utils/lib/from-promise'
import {action, IObservableValue, observable, ObservableMap, when} from 'mobx'
import {fulfilledReq, sleep} from '../utils'

// PoC
export class Requester<T> {
  private last: IObservableValue<T> = observable(null)
  @observable private req: IPromiseBasedObservable<T> = fulfilledReq

  constructor(private promiser: () => Promise<T>) {}

  private whenDisposer = () => {}
  @action refresh(minDuration?: number): IPromiseBasedObservable<T> {
    const promise = minDuration  == null ? this.promiser() :
      (async () => {
        const now = new Date().getTime()
        const result = await this.promiser()
        const duration = new Date().getTime() - now
        if (minDuration != null) await sleep(minDuration - duration)
        return result
      })();
    this.req = fromPromise(promise)
    this.whenDisposer()
    this.whenDisposer = when(() => this.req.state !== PENDING, () => {
      if (this.req.state !== FULFILLED) return
      this.last.set(this.req.value)
    })
    return this.req
  }

  get value(): T {
    return this.last.get()
  }

  get state(): PromiseState {
    return this.req.state
  }
}

// PoC
export class MapReq<I, T> {
  private map: ObservableMap<T> = observable.map<T>()
  private reqMap: ObservableMap<IPromiseBasedObservable<T>> = observable.map()
  @observable private lastReq: IPromiseBasedObservable<T> = fulfilledReq

  constructor(private promiser: (x: I) => Promise<T>) {}

  @action refresh(x: I): IPromiseBasedObservable<T> {
    const req = fromPromise(this.promiser(x))
    this.lastReq = req
    this.reqMap.set(x.toString(), req)
    when(() => this.reqMap.get(x.toString()).state !== PENDING, () => {
      const req = this.reqMap.get(x.toString())
      if (req.state !== FULFILLED) return
      this.map.set(x.toString(), req.value)
    })
    return req
  }

  value(x: I): T {
    return this.map.get(x.toString())
  }

  state(x: I): PromiseState {
    return (this.reqMap.get(x.toString()) || fulfilledReq).state
  }

  get lastState(): PromiseState {
    return this.lastReq.state
  }
}
