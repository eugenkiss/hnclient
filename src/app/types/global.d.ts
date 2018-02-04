// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

declare namespace JSX {
  // noinspection JSUnusedGlobalSymbols
  interface IntrinsicAttributes {
    css?: any // TODO: more precise
  }
}
