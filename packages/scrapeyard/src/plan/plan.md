## features

- add a DB viewer with the aibility to filter, sort and manipulate rows and
  columns
  - the feature is just a template, each project will use it as so, and add
    their own criteria and actions
  - actions are callbacks injected by the projects to perform actions on their
    DB
  - forking prisma/drizzle-studio might be a good start

## better DX

- add voice notification for errors and exceptions
- use a UI component lib (chadcn-ui)

## better UX

- browser.exec should use a function callback instead of a js as a string
- views should pass a function that runs the action along with passing the data
  needed instead of just letting the dispatcher handle everything.
- add an event logger feature.
  - changes in data/db-tables could be stored in a logs table for restoring or
    debugging.
- Add Plugins (helper projects): Not sure I can do this one without causing lots
  of headaches.
  - Github is enough for a plugins registry.
  - Plugins' dependencies has to be merged with the existing project
  - Also config files has to be merged somehow
- better home view:
  - viewing all projects/plugins, their controllers/actions and their views.
  - creating new projects from home's UI.
  - allow custom view for each project to replace the default home view.
  - store UI state/preferences so you can quickly get back where you were.
  - keyboard navigation
- integrate AI

## playwright cons

- viewport detection problems when not focusing on page/tab
  - couldn't click on the center of page when not focusing on it.
- the network intercepter is a hit or miss, especially when traffic is heavy — I
  suspect a race condition between Playwright/driver and browser.
- can't load browser extensions from profile by default.
- can't use the profile of a browser without using the exact same browser
  instance, that you use **for daily activities**.
- can't lunch more than one instance of playwright.
- I had to implement a "promise (async/await)" version of some of their event
  listeners to avoid call back hell.
- no SSE implementation in the network events interceptor — no big deal.
- it crashes from time to time saying "object has been collected to avoid
  unbound heap overflow..."
  - I suspect it's a memory leak that they avoid or can't fix it.
