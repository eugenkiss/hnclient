import {fromPromise, FULFILLED, IPromiseBasedObservable, PENDING, REJECTED} from 'mobx-utils'
import {PromiseState} from 'mobx-utils/lib/from-promise'
import {action, computed, IObservableValue, observable, ObservableMap, runInAction, when} from 'mobx'
import {failedReq, fulfilledReq, getNow} from './utils'

// PoC: Like fromPromise but generalized to continue making requests
export class Requester<T, I=void> {
  private last: IObservableValue<T> = observable(null)
  private lastTimeStamp: IObservableValue<number> = observable(-1)
  @observable private req: IPromiseBasedObservable<T> = fulfilledReq

  constructor(private promiser: (input: I) => Promise<T>) {}

  private whenDisposer = () => {}

  // TODO: how to make input required when generic type is not void but not required otherwise? Overloads?
  @action refresh(input?: I): IPromiseBasedObservable<T> {
    this.req = fromPromise(this.promiser(input))
    this.whenDisposer()
    this.whenDisposer = when(() => this.req.state !== PENDING, action(() => {
      if (this.req.state !== FULFILLED) return
      this.last.set(this.req.value)
      this.lastTimeStamp.set(getNow())
    }))
    return this.req
  }

  @action clearCache() {
    this.last.set(null)
    this.lastTimeStamp.set(-1)
  }

  valueOrRefresh(input?: I): T {
    if (this.value == null && (this.req.state !== PENDING && this.req.state !== REJECTED)) {
      this.refresh(input)
    }
    return this.value
  }

  @action cancel() {
    if (this.req.state === PENDING) this.req = failedReq
  }

  get value(): T {
    return this.last.get()
  }

  get timestamp(): number {
    return this.lastTimeStamp.get()
  }

  get state(): PromiseState {
    return this.req.state
  }
}

// PoC (TODO: MoreLoader as a consecutive specialization...)
export class PageRequester<T, I=number> {
  private map: ObservableMap<Array<T>> = observable.map()
  private reqMap: ObservableMap<IPromiseBasedObservable<Array<T>>> = observable.map()
  @observable lastReqPage: I = null
  @computed private get lastReq(): IPromiseBasedObservable<Array<T>> {
    return this.lastReqPage == null
      ? fulfilledReq
      : this.reqMap.get(this.lastReqPage.toString())
  }
  private lastTimeStamp: IObservableValue<number> = observable(-1)

  constructor(private promiser: (x: I) => Promise<Array<T>>) {}

  @action refresh(x: I, wrapper: (p: Promise<Array<T>>) => Promise<Array<T>> = x => x): IPromiseBasedObservable<Array<T>> {
    const req = fromPromise(wrapper(this.promiser(x)))
    this.lastReqPage = x
    this.reqMap.set(x.toString(), req)
    when(() => this.reqMap.get(x.toString()).state !== PENDING, action(() => {
      const req = this.reqMap.get(x.toString())
      if (req.state !== FULFILLED) return
      this.map.set(x.toString(), req.value)
      this.lastTimeStamp.set(getNow())
    }))
    return req
  }

  @action hardRefresh(x: I, wrapper: (p: Promise<Array<T>>) => Promise<Array<T>> = x => x): IPromiseBasedObservable<Array<T>> {
    const req = fromPromise(wrapper(this.promiser(x)))
    this.lastReqPage = x
    this.reqMap.set(x.toString(), req)
    when(() => this.reqMap.get(x.toString()).state !== PENDING, action(() => {
      const req = this.reqMap.get(x.toString())
      if (req.state !== FULFILLED) return
      this.clearCache()
      this.map.set(x.toString(), req.value)
      this.lastTimeStamp.set(getNow())
    }))
    return req
  }

  @action clearCache() {
    this.map.clear()
    this.lastTimeStamp.set(-1)
  }

  @action cancel(x: I) {
    const req = this.reqMap.get(x.toString()) || {} as any
    if (req.state === PENDING) this.reqMap.set(x.toString(), failedReq)
  }

  valueOrRefresh(x: I): Array<T> {
    const v = this.map.get(x.toString())
    runInAction(() => {
      const r = this.reqMap.get(x.toString())
      if (v == null && (r == null || r.state !== PENDING && r.state !== REJECTED)) {
        this.refresh(x)
      }
    })
    return v
  }

  value(x: I): Array<T> {
    return this.map.get(x.toString())
  }

  state(x: I): PromiseState {
    return (this.reqMap.get(x.toString()) || fulfilledReq).state
  }

  get lastState(): PromiseState {
    return this.lastReq.state
  }

  @computed get listOfPages(): Array<[number, Array<T>]> {
    const pages = this.map.keys().sort((a, b) => parseInt(a) - parseInt(b))
    const result = []
    for (const page of pages) {
      result.push([parseInt(page), this.map.get(page)])
    }
    return result
  }

  get timestamp(): number {
    return this.lastTimeStamp.get()
  }
}

// PoC
export class MapRequestMaker<I, T> {
  private map: ObservableMap<T> = observable.map<T>()
  private dateMap: Map<string, number> = new Map<string, number>()
  private reqMap: ObservableMap<IPromiseBasedObservable<T>> = observable.map()
  @observable private lastReqId: I = null
  @computed private get lastReq(): IPromiseBasedObservable<T> {
    return this.lastReqId == null
      ? fulfilledReq
      : this.reqMap.get(this.lastReqId.toString())
  }

  constructor(
    private promiseMaker: (x: I) => Promise<T>,
    private maxItemCount: number = Number.MAX_SAFE_INTEGER
  ) {}

  @action refresh(x: I): IPromiseBasedObservable<T> {
    const req = fromPromise(this.promiseMaker(x))
    this.lastReqId = x
    this.reqMap.set(x.toString(), req)

    when(() => this.reqMap.get(x.toString()).state !== PENDING, action(() => {
      const req = this.reqMap.get(x.toString())
      if (req.state !== FULFILLED) return
      this.map.set(x.toString(), req.value)
      this.dateMap.set(x.toString(), getNow())
      this.cacheEviction()
    }))

    return req
  }

  @action private cacheEviction() {
    if (this.map.size <= Math.max(1, this.maxItemCount)) return
    let keyOldest = null, dateOldest = Number.MAX_SAFE_INTEGER
    for (const [key, date] of this.dateMap) {
      if (date < dateOldest) {
        dateOldest = date
        keyOldest = key
      }
    }
    this.map.delete(keyOldest)
    this.dateMap.delete(keyOldest)
    this.reqMap.delete(keyOldest)
  }

  @action cancel(x: I) {
    const req = this.reqMap.get(x.toString()) || {} as any
    if (req.state === PENDING) this.reqMap.set(x.toString(), failedReq)
  }

  valueOrRefresh(x: I): T {
    const v = this.map.get(x.toString())
    setTimeout(action(() => { // Prevent mobx invariant violation. Note, async is no problem here as request is async anyway
      const r = this.reqMap.get(x.toString())
      if (v == null && (r == null || r.state !== PENDING && r.state !== REJECTED)) {
        this.refresh(x)
      }
    }), 0)
    return v
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
