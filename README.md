WIP

https://hn.eugenkiss.com

https://github.com/manmal/hn-android/
https://app.hackerwebapp.com

Techs: mobx, typescript, inferno, router5, react, emotion, pwa, server side prerendering (SSPR), styled-system

- Use official API
- hnpwa requirements: new, jobs
- pwa 100 score (favicons, 192, 512)

- pull to refresh
- empty comments -> no comments message
- pagination or just more
- vertical comment lines (indent)
- story cache db?
- Improve README
- check client-base.ts
- Failed to load stories / story: retry
- Extract style (color constants etc.)
- upvote/downvote, user account, comment etc.
- Create requester package? Make generic inpute type
- React Native
- Steal some ideas from reddit is fun


Concepts
  - Shell pregen finite list
of rendered HTML files and respective server.js based on routing
definitions
  - Store, link to mobx
  - Routing TODO: Routing article (my reddit comment)
  - Req own thing (PoC)
  - Scroll restoration
  - Provide data to next view
  - Skeleton loading
  - Critical CSS

Shoutout
  - Inferno is nice on mobile, considerably less lag / faster
  - emotion pretty good
  - router5 awesome
  - mobx awesome anyhow, see blog post

Constraints
  - Fast as possible without giving up DX/abstractions
  - Firebase (for now)
  
TODO
  - How to make new.ycombinator.com open with a top-left X in Chrome on Android?
    I think it doesn't work for them because hn isn't mobile optimized?
  - Improve Makefile
  - Would MobX State Tree help somehow? In retaining scroll position for example?
  - Use react-dom-lite once ready instead of Inferno
  - BFF proxy to simulate delay / user etc. in dev mode
  - Real SSR with hosted API?
      - http4k
      - https://github.com/bagongkia/react-ssr-with-java
      - https://github.com/kristoferbaxter/react-hn
      - https://github.com/cheeaun/node-hnapi
  - Animations/transitions. E.g. spinner fade out, overflow menu

Opportunities
  - Reduce bundle size
      - Code splitting
  - Real SSR
  - Starting HN API request earlier
      - If not constrained to Firebase could start initial API
        request server side, stream HTML and stream API result as JSON to end
        of HTML (embedded). Once JS is loaded uses instrumented fetch to get initial result
        from embedded JSON. See react static server TODO
  - Faster HN Api / Streaming API
  - Service Worker config and workflow is PITA: TODO link from gaeron
      - https://github.com/facebook/create-react-app/issues/2554
      - https://twitter.com/dan_abramov/status/954146978564395008
  - Abstract/extract code into reusable libraries?
      - Routing, pregen, req, scroll restoration
