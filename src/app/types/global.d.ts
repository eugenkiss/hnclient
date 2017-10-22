import {IPromiseBasedObservable} from 'mobx-utils'

// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

declare global {
  type Req<T> = IPromiseBasedObservable<T>
}
