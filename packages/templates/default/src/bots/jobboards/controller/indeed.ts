import {
  serverTools,
  serverVars,
  browser,
  type BrowserContext,
  type Page,
} from 'scrapeyard';
import companyM from '../model/company';
import postM from '../model/post';
import { PostRow } from '../model/dbTypes';
import localTools from '../utils/tools';

const options = {
  platformUrl: 'https://www.indeed.com',
  urls: {
    noFilterSearch: `https://ma.indeed.com/jobs?l=&from=searchOnHP&vjk=caee5b2933c429a8`,
  },
};

let postsListTab: Page;
let applyToPostsTab: Page;
let currentlyApplyingToUrl: string;

const updatePostStatus = async (driver: BrowserContext, { status }) => {
  // console.log({ url: currentlyApplyingToUrl, status });
  const updatedPost = postM.update({
    filter: { url: currentlyApplyingToUrl },
    newValues: { status },
  });
  console.log({ updatedPost });
  await apply(driver, { firstCall: false });
};

const apply = async (
  driver: BrowserContext,
  { firstCall = true }: { firstCall?: boolean },
) => {
  if (firstCall) {
    applyToPostsTab = await browser.newTab(serverVars.windows[0], {
      beautyLevel: 2,
    });
    const eventHandler = (tab: Page) => {
      //async
      browser.injectView(applyToPostsTab, {
        projectName: 'jobboards',
        viewName: 'manuallyApplyToPost',
      });
    };
    browser.onLoad(applyToPostsTab, { eventHandler });
  }

  const posts = postM.get({
    filter: {
      status: 'doesMatch',
      platformUrl: 'https://www.indeed.com',
    },
    length: 1,
  });
  if (!posts) {
    console.log('Err (maroannonces.parse) -> cannot get posts from db.');
    return;
  }
  if (!posts.length) {
    console.log('Err -> no unparsed(queued) posts are left');
    return;
  }

  const matchingJobPost = posts[0];
  currentlyApplyingToUrl = matchingJobPost.url;
  await browser.goto(applyToPostsTab, {
    url: matchingJobPost.url,
  });
};

interface Post {
  title: string;
  url: string;
  city: string;
  companyName?: string;
}
const collect = async (driver: BrowserContext) => {
  postsListTab = await browser.newTab(driver, { beautyLevel: 4 });

  const vars = {
    postsCount: 0,
    newPostsCount: 0,
    perKeywordPostsCount: 0,
    perKeywordNewPostsCount: 0,
    keywords: localTools.targetFilteringKeywords,
    // keywords: ["web"],
    // todo: get pages count
    pagesCount: 100, // assumption
  };

  for (
    let keywordIndex = 0;
    keywordIndex < vars.keywords.length;
    keywordIndex++
  ) {
    serverTools.print.success(`keyword: ${vars.keywords[keywordIndex]}`);
    await browser.goto(postsListTab, {
      url: `${options.urls.noFilterSearch}&q=${vars.keywords[keywordIndex]}`,
    });

    let pageNumber = 1;
    while (1) {
      const posts = await browser.exec(postsListTab, {
        string: `
          const postsList = Array.from(document.querySelector('div#mosaic-provider-jobcards > ul').children).reduce((acc, jobPost)=>{
            console.log(jobPost);
            if(!jobPost){return acc;}

            // filter out non-easy-apply posts.
            const easyApplyButton = jobPost.querySelector('[data-testid="indeedApply"]');
            if(!easyApplyButton){return acc;}

            const title = jobPost.querySelector('h2');
            if(!title){return acc;}

            const url = title.querySelector('a')?.href;

            const companyName = jobPost.querySelector('[data-testid="company-name"]')?.innerText;
            const city = jobPost.querySelector('[data-testid="text-location"]').innerText;

            const jobPostObj = {
              title: title.innerText,
              url: url.includes("/pagead/") ? url : url.split("&")[0],
              city,
              companyName
            }

            acc.push(jobPostObj);
            return acc;
          }, []);
          console.log(postsList);
          return postsList;
        `,
      });
      if (!posts) {
        console.log('Err -> could not get posts list');
        break;
      }

      let postsThatMatchCount = 0;
      for (let postIndex = 0; postIndex < posts.length; postIndex++) {
        const post = posts[postIndex] as Post;
        // console.log({post})

        const titleDoesMatch = vars.keywords.some((keyword: string) => {
          return post.title
            .split(' ')
            .some(
              (word: string) => word.toLowerCase() == keyword.toLowerCase(),
            );
        });
        if (titleDoesMatch) {
          postsThatMatchCount++;
          if (post.companyName) {
            console.log('creating company ', post.companyName);
            companyM.add({
              values: {
                name: post.companyName,
                headquarters: '',
              },
              ignoreDuplicate: true,
            });
          }
          const postRow: PostRow = {
            companyName: post.companyName ?? 'placeholder',
            url: post.url,
            platformUrl: options.platformUrl,
            city: post.city,
            title: post.title,
            status: 'valid',
            queueDate: new Date().toISOString(),
          };
          console.log({ postRow });
          const resp = postM.add({ values: postRow, ignoreDuplicate: true });
          if (resp?.changes > 0) {
            vars.newPostsCount++;
            vars.perKeywordNewPostsCount++;
          }

          vars.postsCount++;
          vars.perKeywordPostsCount++;
          serverTools.print.info(`Post (${vars.postsCount}): ${post.title}`);
        }
      }

      console.log({
        pageNumber,
        postsWithEasyApply: posts.length,
        postsThatMatchCount,
      });

      //* had to clear parsed ones due to how infinite scrolling works.
      //* infinie scroll only happens when not using a search keyword
      // await browser.exec(postsListTab, {
      //   string: `
      //     Array.from(document.querySelector('div#mosaic-provider-jobcards > ul').children)
      //       .reduce((acc, postCard)=>{
      //         postCard.remove();
      //       })
      //   `,
      // });
      //* loading new posts
      // await browser.exec(postsListTab, {
      //   string: `window.scroll(0, 9999)`,
      // });

      //* loading new posts - pagination method
      const isLastPage = await browser.exec(postsListTab, {
        string: `
          const nextPageButton = document.querySelector(
            'a[data-testid="pagination-page-next"]'
          );
          if (nextPageButton) {
            nextPageButton.click();
            return false;
          }

          return true; // lastPage=true; no next button
        `,
      });
      if (isLastPage) {
        break; // next keyword; out of pages while-loop
      }

      while (1) {
        await serverTools.sleep(1000);
        //* when page reloads, execution context gets destroyed, no big deal, ignoring exception (printError: false).
        const extractedPageNumber = await browser.exec(postsListTab, {
          printError: false,
          string: `
          const currentPageNumber = document.querySelector('a[data-testid="pagination-page-current"]').innerText;
          return currentPageNumber;
        `,
        });
        if (parseInt(extractedPageNumber) == pageNumber + 1) {
          pageNumber = parseInt(extractedPageNumber);
          break;
        }
      }

      // await tools.sleep(2000);
    }

    console.log({
      perKeywordPosts: vars.perKeywordPostsCount,
      perKeywordNewPosts: vars.perKeywordNewPostsCount,
      totalPosts: vars.postsCount,
      totalNewPosts: vars.newPostsCount,
    });
    vars.perKeywordNewPostsCount = 0;
    vars.perKeywordPostsCount = 0;
  }
  console.log('----------- end of collecting posts ---------');
};

export default {
  collect,
  apply,
  findMatches: localTools.findMatches,
  getValidPosts: localTools.getValidPosts,
  setMatchingAndUnmatchingPosts: localTools.setMatchingAndUnmatchingPosts,
  updatePostStatus,
};
