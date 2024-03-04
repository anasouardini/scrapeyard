# Scrapeyard (WIP)

It's a scraping framework built on top of Playwright for adding scraping- or automation-related features on top of the testing features that Playwright offers.

Some of the feature are:

- Initialize a new scraping project/bot with one command: `npm run createProject botName`.
- Inject Reactjs component into the target page.
- Facilitates the communication between your injected js/views and your scraping server.
- Offers methods like onLoad, clearDOM and uploadFile so you don't have to create them yourself.

## How to use

Run the following command in a terminal: `npm create scrapeyard project-name`.