import {fromPromise, FULFILLED, IPromiseBasedObservable, PENDING, REJECTED} from 'mobx-utils'
import {PromiseState} from 'mobx-utils/lib/from-promise'
import {action, computed, IObservableValue, observable, ObservableMap, runInAction, when} from 'mobx'
import {failedReq, fulfilledReq} from './utils'

// PoC: Like fromPromise but generalized to continue making requests
export class Requester<T> {
  private last: IObservableValue<T> = observable(null)
  private lastTimeStamp: IObservableValue<number> = observable(-1)
  @observable private req: IPromiseBasedObservable<T> = fulfilledReq
  unstarted = true

  constructor(private promiser: () => Promise<T>) {}

  private whenDisposer = () => {}
  @action refresh(): IPromiseBasedObservable<T> {
    this.unstarted = false
    this.req = fromPromise(this.promiser())
    this.whenDisposer()
    this.whenDisposer = when(() => this.req.state !== PENDING, action(() => {
      if (this.req.state !== FULFILLED) return
      this.last.set(this.req.value)
      this.lastTimeStamp.set(new Date().getTime())
    }))
    return this.req
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

// PoC
export class MapRequester<I, T> {
  private map: ObservableMap<T> = observable.map<T>()
  private reqMap: ObservableMap<IPromiseBasedObservable<T>> = observable.map()
  @observable lastReqId: I = null
  @computed private get lastReq(): IPromiseBasedObservable<T> {
    return this.lastReqId == null
      ? fulfilledReq
      : this.reqMap.get(this.lastReqId.toString())
  }

  constructor(private promiser: (x: I) => Promise<T>) {}

  @action refresh(x: I): IPromiseBasedObservable<T> {
    const req = fromPromise(this.promiser(x))
    this.lastReqId = x
    this.reqMap.set(x.toString(), req)
    when(() => this.reqMap.get(x.toString()).state !== PENDING, () => {
      const req = this.reqMap.get(x.toString())
      if (req.state !== FULFILLED) return
      this.map.set(x.toString(), req.value)
    })
    return req
  }

  @action cancel(x: I) {
    const req = this.reqMap.get(x.toString()) || {} as any
    if (req.state === PENDING) this.reqMap.set(x.toString(), failedReq)
  }

  valueOrRefresh(x: I): T {
    const v = this.map.get(x.toString())
    runInAction(() => {
      const r = this.reqMap.get(x.toString())
      if (v == null && (r == null || r.state !== PENDING && r.state !== REJECTED)) {
        this.refresh(x)
      }
    })
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
