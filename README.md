Hacker News Client
==================

A mobile optimized Hacker News client running in the browser: <https://hn.eugenkiss.com>.

Inspired by [HN (Android)](https://github.com/manmal/hn-android/) and [HNPWA](https://hnpwa.com/).

Uses [HNPWA API](https://github.com/tastejs/hacker-news-pwas/blob/master/docs/api.md).

Built with:
- [React](https://reactjs.org)
- [MobX](https://mobx.js.org)
- [TypeScript](https://www.typescriptlang.org)
- [router5](http://router5.github.io)
- [Inferno](https://infernojs.org)
- [emotion](https://emotion.sh)
- [Styled System](http://jxnblk.com/styled-system)

Principles:
  - High perceived speed in the GUI without giving up DX/abstractions on the programmatic side

[WebPagetest](https://www.webpagetest.org/easy):
  - [Mobile – Slow 3G](https://www.webpagetest.org/result/180208_MC_589f0257c719d7a20c39d19818d6b42f) 
    (Lighthouse Performance Score: 54) (The LightHouse trace almost always fails...)
  - [Mobile – Regular 3G](https://www.webpagetest.org/result/180208_JJ_01f07a06adb2f1d7b7b68adc8902fe4f) 
    (Lighthouse Performance Score: 90)

Notable Concepts:
  - As part of the build process a server-side rendered HTML shell is generated for each route.
    The necessary Firebase routing configuration is generated, too. The browser is served the pre-rendered 
    HTML file with critical CSS while the JS bundle is being loaded. That is, the user is presented with a 
    skeleton screen as soon as possible. Of course, complete server-side rendering (SSR) for each request, 
    such that data required to display the UI is also retrieved server-side, is superior but also more involved.
  - State management is roughly done as described here: https://mobx.js.org/best/store.html
  - The routing/navigation approach is roughly inspired by: https://vincent.is/testing-a-different-spa-routing/
  - View state restoration (such as scroll positions) is done in a novel way as far as I know.
    It is roughly inspired by how it's done on Android. View state restoration is enabled by the employed routing
    approach. It is assumed that each view/screen is uniquely identifiable by its path. Going forward
    in history is deliberately ignored when restoring view state.
  - To make screen restoration fast when navigating back top-level components (screens) are not destroyed when
    navigating away from them. Instead, they have their `display` CSS attribute set to `none`. That is,
    we have a stack of screens.
  - The way requests and their results are handled/cached is special in the sense that I did not
    encounter this approach in other projects. It's quite convenient. The idea is to have an observable request
    generator object for each endpoint that encapsulates results and meta information. Then there are special
    variations of this object, for example for paginated endpoints. Slightly similar to the Rx Single object but 
    simpler and much more specific in scope. Also inspired by:
    https://medium.com/@mweststrate/mobx-utils-community-driven-utility-belt-for-mobx-264346cb2744#3222
    - TODO (Rephrase properly): Reactive item database. To solve E.g. you go to story, comment count is updated,
      you go back to overview, but overview shows old comment count
      The problem is that you can get the same kind of entity via different requests.
      If you only cache the result of a request but do not save the retrieved entity
      centrally, then there is going to be staleness.

Shoutout:
  - Inferno is nice on mobile, considerably less lag
  - emotion is pretty good
  - router5 is awesome
  - MobX is awesome as always

Observations:
  - Service Worker configuration and workflow is a pain in the ass:
    - https://github.com/facebook/create-react-app/issues/2554
    - https://twitter.com/dan_abramov/status/954146978564395008
  - Browser history navigation is limiting for apps
  - Native development gives you a lot but requires you to sacrifice part of your freedom (e.g. customizability)
  - Why doesn't the Chrome browser use the a's title attribute as the share title when sharing a link?
  - Even though inferno-compat is quite good it's still a PITA for edge cases
  - Build configuration as well as correctly setting up tree shaking / dead code elimination
    in this heterogeneous ecosystem is a PITA


---------------------------------  
  
  
TODO:
  - Create requester package? Make generic inpute type 
    - Progress here, used in production but no time yet to open source...
  - Use https://github.com/grahammendick/navigation! It's all that I ever wished for!
    - That's what I want: https://navigation4asp.net/2018/06/11/pwa-stack-navigation-native/
  
  - Put NavigationsOptions to 'router5'
  - Use history.back only when stack > 1 for back arrow, otherwise home
  - data is older 48 years
  - maxage for requests
  
TODO Longterm (if ever):
  - GraphQL API?: https://github.com/tigranpetrossian/hn-api
  - How to stop/freeze mobx from forceUpdating a component while it is not active?
    To prevent _accidental_ rerendering of old screen just before switching to new one.
    Note that I want to retain the old component tree to quickly redraw it when going
    back to the screen so just returning null when !active doesn't cut it completely.
    See also: https://github.com/mobxjs/mobx-react/issues/50
  - BFF proxy to simulate delay / user etc. in dev mode
    - Failed to load stories: retry button
  - Mutation API? http4k
    - https://github.com/manmal/hn-android/tree/master/app/src/main/java/com/manuelmaly/hn
    - upvote/downvote, flag, user account, comment etc.
  - Use react-dom-lite once ready instead of Inferno
  - Reduce bundle size
    - Code splitting (ReactLoadable)
  - compare to https://medium.com/@NareshBhatia/introducing-mobx-state-router-dae4cb9386fb
  - Improve Makefile
  - Would MobX State Tree help somehow? In retaining scroll position for example?
  - Real SSR?
    - https://github.com/kristoferbaxter/react-hn
    - https://github.com/cheeaun/node-hnapi
  - Animations/transitions. E.g. spinner fade out, overflow menu, shared element transition, etc.
    - Animate/count numbers up/down (e.g. points) when new data/values arrive
  - React Native version
  - Steal some UI ideas from reddit is fun 
    e.g. selected/active comment, top/hot/... tabs underneath toolbar, share dialog
  - Refactoring
    - Extract style (color constants etc.)
  - Abstract/extract code into reusable libraries?
    - Routing, pregen, req, scroll restoration
  - Error boundary (e.g. to not break client-side navigation on error)
  - How to make news.ycombinator.com open with a top-left X in Chrome on Android?
    I think it doesn't work for them because hn isn't mobile optimized?
  - User detail page, single comment page
  - Search for a post, search inside comments
  - depending on type change path (e.g. /story/{id} /job/{id} /ask/{id})
  - auto-hiding toolbar
  - Theming (dark mode)
  - do not render feed item in new page if it exists in a previous page
  - Toast message on failed request
  - Storyview: If you scroll up/down fast and cover some distance
    show scroll to top/button action
  - pull to refresh (such a PITA): 
    - https://github.com/yusukeshibata/react-pullrefresh/issues/28
    - https://github.com/infernojs/inferno/issues/1001
