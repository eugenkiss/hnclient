WIP

https://hn.eugenkiss.com

https://github.com/manmal/hn-android/
https://app.hackerwebapp.com
hnpwa

Techs: mobx, typescript, inferno, router5, react, emotion, pwa, server side prerendering (SSPR), styled-system

- http://localhost:5001/story/16263040
- set alt/title attributes of links for better sharing emails
- hnpwa requirements: new, jobs
  https://github.com/HackerNews/API/
- pwa 100 score (favicons, 192, 512)

- pull to refresh
- pagination or just more
- Improve README
- Create requester package? Make generic inpute type

- handle deleted comments
- remember scroll position for comments (scroll, go to about, go back)
- Show top/new/show/ask/jobs in header instead of in overflow menu?
- On click for comment so that all anchors have target _blank?
- Extract style (color constants etc.)

Concepts
  - Shell pregen finite list of rendered HTML files and 
    respective server.js based on routing definitions
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

Constraints on Programmatic Design
  - Fast as possible without giving up DX/abstractions
  - Firebase (for now)
  
TODO (later if ever)
  - Improve Makefile
  - Would MobX State Tree help somehow? In retaining scroll position for example?
  - Use react-dom-lite once ready instead of Inferno
  - BFF proxy to simulate delay / user etc. in dev mode
      - Failed to load stories: retry button
  - Real SSR with hosted API?
      - http4k
      - https://github.com/bagongkia/react-ssr-with-java
      - https://github.com/kristoferbaxter/react-hn
      - https://github.com/cheeaun/node-hnapi
  - Animations/transitions. E.g. spinner fade out, overflow menu
  - Use this API approach: https://github.com/manmal/hn-android/tree/master/app/src/main/java/com/manuelmaly/hn
      - upvote/downvote, flag, user account, comment etc.
  - React Native version
  - Steal some UI ideas from reddit is fun (e.g. selected/active comment)
  - Reduce bundle size
      - Code splitting
  - Abstract/extract code into reusable libraries?
      - Routing, pregen, req, scroll restoration
  - Error boundary (e.g. to not break client-side navigation on error)
  - How to make news.ycombinator.com open with a top-left X in Chrome on Android?
    I think it doesn't work for them because hn isn't mobile optimized?
  - Reactive item database. To solve E.g. you go to story, comment count is updated,
    you go back to overview, but overview shows old comment count
  - User detail page, single comment page
  - Search
  - depending on type change path (e.g. /story /job /ask)

Observations
  - Official HN Firebase API is bad. It's admitted and has a reason.
  - Service Worker config and workflow is PITA: TODO link from gaeron
      - https://github.com/facebook/create-react-app/issues/2554
      - https://twitter.com/dan_abramov/status/954146978564395008
  - Browser history navigation seriously too limited for apps
