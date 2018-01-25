WIP

https://hnclient-1b7c9.firebaseapp.com/

https://github.com/manmal/hn-android/

Techs: mobx, typescript, inferno, router5, react, emotion, pwa, server side prerendering (SSPR) 

TODO:
back button bigger area

- comments
- pagination
- hnpwa requirements: new, jobs
- pwa 100 score (favicons, 192, 512)
- check client-base.ts
- upvote/downvote, user account, comment etc.


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
  - Firebase
  
TODO
  - Improve Makefile

Opportunities
  - Reduce bundle size
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
