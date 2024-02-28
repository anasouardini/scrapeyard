import {
  serverTools,
  serverVars,
  browser,
  type BrowserContext,
  type Page,
} from 'scrapeyard';
import postM from '../model/post';
import { PostRow } from '../model/dbTypes';
// import chatGPT from "../../1iqai/controller/chatgpt";

let choseMatchingPostsTab: Page;

const targetFilteringKeywords = [
  'wp',
  'wordpress',
  'development',
  'développement',
  'informatique',
  'developer',
  'Développeur',
  'web',
  'web developer',
  'stage',
  'intern',
  'front end',
  'full stack',
  'react js',
  'reactjs',
  'react',
  'js',
  'javascript',
];

//! chatGPT is so dumb even for this little task
const findMatchesAI = async () => {
  let prompt = `
    From a list of job posts titles, I need you to find me the ones that match my skills.
    I'm an inexperienced full stack web JS developer, I use React in the front and nodejs+expressjs in the back, but can take both front-end and/or back-end jobs.
    I have no problem doing Internsips even if they're a little outside my skill set, but has to be web-related, something like wordpress for example is ok as an internship.
    The titles might be in either french or english, some of them might be french that uses 1-2 words from english and vice versa.
    Do not output ANYTHING, anything other than numbers of the lines (starting with 1) you've chosen for me separated by commas, e.g: "1,4,5".
    And don't forget anything that matches my criteria.
  `;

  const posts = postM.get({
    filter: { status: 'valid' },
    length: 10,
  });
  if (!posts) {
    console.log('Err (maroannonces.parse) -> cannot get posts from db.');
    return;
  }
  if (!posts.length) {
    console.log('Err -> no unparsed(queued) posts are left');
    return;
  }

  prompt += `here is the list:\n${posts.map(({ title }) => title).join('\n')}`;

  prompt = serverTools.cleanString(prompt);

  const response = await chatGPT.prompt(serverVars.windows[0], prompt);

  console.log({ prompt, response });
};

const findMatches = async ({ firstPage = true }: { firstPage: boolean }) => {
  if (!firstPage) {
    await browser.clearDOM(choseMatchingPostsTab);
  } else {
    //* first call of this function
    choseMatchingPostsTab = await browser.newTab(serverVars.windows[0], {});
  }

  await browser.injectView(choseMatchingPostsTab, {
    projectName: 'jobboards',
    viewName: 'choseMatchingJobPosts',
  });
};

const getValidPosts = async (driver: BrowserContext) => {
  const posts = postM.get({
    filter: { status: 'valid' },
    length: 10,
  });
  if (!posts) {
    console.log('Err (maroannonces.parse) -> cannot get posts from db.');
    return;
  }
  if (!posts.length) {
    console.log('Err -> no unparsed(queued) posts are left');
    return;
  }

  return { data: posts };
};

const setMatchingAndUnmatchingPosts = async (
  driver: BrowserContext,
  parsedList: { url: string; doesMatch: boolean }[],
) => {
  parsedList.forEach((post) => {
    const newColumns: Partial<PostRow> = {
      status: post.doesMatch ? 'doesMatch' : 'doesNotMatch',
    };
    // console.log({ newColumns });

    const newPost = postM.update({
      filter: { url: post.url },
      newValues: newColumns,
    });
    console.log({ newPost });
  });
  await findMatches({ firstPage: false });
};

export default {
  targetFilteringKeywords,
  // the following 3 are part of one task: "finding matches"
  findMatches,
  getValidPosts,
  setMatchingAndUnmatchingPosts,
};
