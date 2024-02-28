import {
  browser,
  serverTools,
  serverVars,
  type BrowserContext,
  type Page,
} from 'scrapeyard';
import companyM from '../model/company';
import postM from '../model/post';
import { PostRow } from '../model/dbTypes';
import localTools from '../utils/tools';

const options = {
  applyBlindly: true,
  collectBlindly: false,
  platformUrl: 'https://www.marocannonces.com',
  urls: {
    marrakechWeb:
      'https://www.marocannonces.com/maroc/offres-emploi-marrakech-b309-t580.html',
    noFilterSearch:
      'https://www.marocannonces.com/maroc/offres-emploi-b309.html',
  },
};

let postsListTab: Page;

const doesPostExist: (tab: Page) => Promise<boolean> = async (tab) => {
  const timeout = 1000;
  // check if post exists
  //* first variation
  const noPostFound = await browser.findElement(tab, {
    query: '.erreur_404',
    timeout,
  });
  if (noPostFound) {
    console.log('post not found');
    return false;
  }
  //* second variation
  const errorBoxQuery = 'h1';
  // document.querySelector('h1').innerText.includes('Désolé');
  const pageNotFoundErr = await browser.findElement(tab, {
    query: errorBoxQuery,
    timeout,
  });
  if (pageNotFoundErr) {
    const errMsg: string = await browser.exec(tab, {
      string: `return document.querySelector("${errorBoxQuery}").innerText`,
    });
    //   console.log({errMsg})
    if (errMsg.includes('Désolé')) {
      serverTools.print.error('Page does not even exist');
      return false;
    }
  }
  //* third variation
  const errorBoxQuery2 = 'div.exalert_title';
  // document.querySelector('h1').innerText.includes('Désolé');
  const pageNotFoundErr2 = await browser.findElement(tab, {
    query: errorBoxQuery2,
    timeout,
  });
  if (pageNotFoundErr2) {
    const errMsg: string = await browser.exec(tab, {
      string: `return document.querySelector("${errorBoxQuery2}").innerText`,
    });
    //   console.log({errMsg})
    if (errMsg.includes("Désolé, cette annonce n'est plus disponible")) {
      serverTools.print.error('ad does not exist');
      return false;
    }
  }

  return true;
};

const isPostAppliedTo: (tab: Page) => Promise<boolean> = async (tab) => {
  const timeout = 1000;
  // click application button
  const applyButtonQuery = 'a.btn-reply';
  const applyButton = await browser.findElement(tab, {
    query: applyButtonQuery,
    timeout,
  });
  //   console.log({ applyButton });
  if (applyButton) {
    // console.log("applying for post");
    await browser.exec(tab, {
      string: `document.querySelector("${applyButtonQuery}").click()`,
    });
  }

  let triesCount = 0;
  while (triesCount < 2) {
    triesCount++;

    // check if already sent [1st variation]
    const errorBoxQuery = 'div.errorbox';
    // console.log('checking for error box...')
    const error = await browser.findElement(tab, {
      query: errorBoxQuery,
      timeout,
    });
    if (error) {
      const errMsg: string = await browser.exec(tab, {
        string: `return document.querySelector("${errorBoxQuery}").innerText`,
      });
      //   console.log({errMsg})
      if (errMsg.includes('Vous avez déjà postulé')) {
        serverTools.print.error('post already applied to');
        return true;
      }
    }
    // check if already sent [2nd variaiion]
    const errorBoxQuery2 = 'h1 + form > div';
    // console.log('checking for error box 2...')
    const error2 = await browser.findElement(tab, {
      query: errorBoxQuery2,
      timeout,
    });

    if (error2) {
      const errMsg: string = await browser.exec(tab, {
        string: `return document.querySelector("${errorBoxQuery2}").innerText`,
      });
      //   console.log({errMsg})
      if (errMsg.includes('Vous avez déjà postulé')) {
        serverTools.print.error('post already applied to');
        return true;
      }
    }

    await serverTools.sleep(1000);
  }

  return false;
};

const getPostDetails: (tab: Page) => Promise<{
  description: string;
  extra: string;
  companyName: string;
}> = async (tab) => {
  const details = await browser.exec(tab, {
    string: `
      const description = document.querySelector('.description .block').innerText;
      const extra = document.querySelector('#extra_questions').innerText;
      const companyName = document.querySelector('.infoannonce > dl > dd').innerText;
      // console.log({description, extra, companyName});

      return {description, extra, companyName};
    `,
  });

  return details;
};

const apply = async (driver: BrowserContext) => {
  const timeout = 1000;
  const applyToPostsTab = await browser.newTab(serverVars.windows[0], {
    beautyLevel: 2,
  });

  while (1) {
    const posts = postM.get({
      filter: {
        status: 'valid',
        platformUrl: 'https://www.marocannonces.com',
      },
      length: 1,
    });
    if (!posts) {
      console.log('Err (maroannonces.parse) -> cannot get posts from db.');
      break;
    }
    if (!posts.length) {
      console.log('Err -> no matching posts are left to apply to');
      break;
    }

    const matchingJobPost = posts[0];
    await browser.goto(applyToPostsTab, {
      url: matchingJobPost.url,
    });

    // console.log('does post exist!...')
    const postExists = await doesPostExist(applyToPostsTab);
    if (!postExists) {
      console.log(
        "Err -> too late, the matching post I'm trying to apply to has been removed.",
      );
      const newItem = postM.update({
        filter: { url: matchingJobPost.url },
        newValues: { status: 'removed' },
      });

      if (newItem?.[0].status != 'removed') {
        console.log('Err -> could not mark post as removed');
      }

      continue;
    }
    // console.log('is post applied to!...')
    let postAppliedTo = false;
    if (!options.applyBlindly) {
      postAppliedTo = await isPostAppliedTo(applyToPostsTab);
    } else {
      const applyButtonQuery = 'a.btn-reply';
      const applyButton = await browser.findElement(applyToPostsTab, {
        query: applyButtonQuery,
        timeout,
      });
      //   console.log({ applyButton });
      if (applyButton) {
        // console.log("applying for post");
        await browser.exec(applyToPostsTab, {
          string: `document.querySelector("${applyButtonQuery}").click()`,
        });
      }
      await serverTools.sleep(1000);
    }
    if (postAppliedTo) {
      console.log('Err -> trying to apply to an already-applied-to post.');
      const newItem = postM.update({
        filter: { url: matchingJobPost.url },
        newValues: { status: 'applied', sendDate: new Date().toISOString() },
      });

      if (newItem?.[0].status != 'applied') {
        console.log('Err -> could not mark post as applied');
      }
      continue;
    }

    //* apply after check
    // click confirmation button a.k.a "send application"
    const confirmButtonQuery = 'input#btn_envoyer';
    // console.log('finding confirm button!...')
    const confirmButton = await browser.findElement(applyToPostsTab, {
      query: confirmButtonQuery,
      timeout,
    });
    if (confirmButton) {
      // console.log("confirming application");
      await browser.exec(applyToPostsTab, {
        string: `document.querySelector("${confirmButtonQuery}").click()`,
      });
    }

    const applicationSentQuery = 'div.repondre_success';
    // console.log('confirming sent post!...')
    const applicationSent = await browser.findElement(applyToPostsTab, {
      query: applicationSentQuery,
      timeout,
    });
    if (applicationSent) {
      serverTools.print.success('application sent');
      const newItem = postM.update({
        filter: { url: matchingJobPost.url },
        newValues: { status: 'applied', sendDate: new Date().toISOString() },
      });

      if (newItem?.[0].status != 'applied') {
        console.log('Err -> could not mark post as applied');
      }
    }
  }
};

const collect = async (driver: BrowserContext) => {
  postsListTab = await browser.newTab(driver, { beautyLevel: 4 });

  const vars = {
    postsCount: 0,
    newPostsCount: 0,
    perKeywordPostsCount: 0,
    perKeywordNewPostsCount: 0,
    keywords: localTools.targetFilteringKeywords,
    // todo: get pages count
    pagesCount: 100, // assumption
  };

  for (
    let keywordIndex = 0;
    keywordIndex < vars.keywords.length;
    keywordIndex++
  ) {
    serverTools.print.success(`keyword: ${vars.keywords[keywordIndex]}`);
    let pageN = 1;
    for (; pageN <= vars.pagesCount; pageN++) {
      // console.log("page: ", pageN);
      await browser.goto(postsListTab, {
        url: `${options.urls.noFilterSearch}?kw=${vars.keywords[keywordIndex]}&pge=${pageN}`,
      });

      const posts = await browser.exec(postsListTab, {
        string: `
        const postsContainer = document.querySelector("ul.cars-list");
        if (!postsContainer) {
          console.log("Err -> posts list not found");
          return;
        }

        return Array.from(postsContainer.children).map((postLi) => {
          if (postLi.classList.contains("adslistingpos")) {
            return {title: "ad"};
          }

          const controlsContainer = document.createElement("div");
          controlsContainer.classList.add("controllsContainer");
          postLi.insertAdjacentElement("afterbegin", controlsContainer);

          const url = postLi.querySelector("a");
          if (!url) {
            console.log("Err -> cant extract post link");
            return;
          }

          //* percicely: div + div.holder > span.location
          const city = url.querySelector('span.location')?.innerText;

          const postObj = {
            title: url.title,
            url: url.href,
            city,
          };

          return postObj;
        });
        `,
      });
      if (!posts) {
        console.log('Err -> could not get posts list');
        break;
      }
      // console.log({posts})
      // console.log(posts[0])
      // console.log(posts[1])

      for (let postIndex = 0; postIndex < posts.length; postIndex++) {
        const post = posts[postIndex];
        if (post.title == 'ad') {
          continue;
        }

        let titleDoesMatch = true;
        if (!options.collectBlindly) {
          titleDoesMatch = vars.keywords.some((keyword: string) => {
            return post.title
              .split(' ')
              .some(
                (word: string) => word.toLowerCase() == keyword.toLowerCase(),
              );
          });
        }

        let postStatus: PostRow['status'] = 'doesNotContainKeywords';
        if (titleDoesMatch) {
          postStatus = options.collectBlindly ? 'doesMatch' : 'queued';
        }

        const postRow: PostRow = {
          companyName: 'placeholder',
          url: post.url,
          platformUrl: options.platformUrl,
          city: post.city,
          title: post.title,
          status: postStatus,
          queueDate: new Date().toISOString(),
        };
        // console.log({ postRow });
        const resp = postM.add({ values: postRow, ignoreDuplicate: true });

        if (resp?.changes > 0) {
          vars.newPostsCount++;
          vars.perKeywordNewPostsCount++;
        }

        vars.postsCount++;
        vars.perKeywordPostsCount++;
        // tools.print.info(`Post (${vars.postsCount}): ${post.title}`);
      }

      // tools.print.title("-------- applying to queued post");
      // await apply(driver);
    }
    console.log({
      pages: pageN - 1,
      perKeywordPosts: vars.perKeywordPostsCount,
      perKeywordNewPosts: vars.perKeywordNewPostsCount,
      totalPosts: vars.postsCount,
      totalNewPosts: vars.newPostsCount,
    });
    vars.perKeywordNewPostsCount = 0;
    vars.perKeywordPostsCount = 0;
  }

  console.log('--------------- end of collecting posts ---------');
};

const parse = async (_) => {
  const postsParsingTab = await browser.newTab(serverVars.windows[0], {
    beautyLevel: 4,
  });

  while (1) {
    const posts = postM.get({
      filter: {
        status: 'queued',
        platformUrl: 'https://www.marocannonces.com',
      },
      length: 1,
    });
    if (!posts) {
      console.log('Err (maroannonces.parse) -> cannot get posts from db.');
      break;
    }
    if (!posts.length) {
      console.log('Err -> no unparsed(queued) posts are left');
      break;
    }

    const post = posts[0];
    await browser.goto(postsParsingTab, {
      url: post.url,
    });

    let newColumns: Partial<PostRow>;
    const postExists = await doesPostExist(postsParsingTab);
    if (postExists) {
      const postDetails = await getPostDetails(postsParsingTab);
      const postAppliedTo = await isPostAppliedTo(postsParsingTab);

      companyM.add({
        values: {
          name: postDetails.companyName,
          headquarters: '',
        },
        ignoreDuplicate: true,
      });

      newColumns = {
        status: postAppliedTo ? 'applied' : 'valid',
        details: Object.values(postDetails).join('\n\n'),
        companyName: postDetails.companyName,
      };
    } else {
      newColumns = {
        status: 'invalid',
      };
    }

    // console.log({ newColumns });
    //* updaing posts with new values
    const resp = postM.update({
      filter: { url: post.url },
      newValues: newColumns,
    });
    if (!resp) {
      console.log(
        "Err (maroannonces.parse) -> could not update post row: query wasn't executed.",
      );
      break;
    }
    if (!resp.length) {
      console.log(
        'Err (maroannonces.parse) -> could not update post row: updatedRows length is 0',
      );
      break;
    }

    console.log({ updatedPost: resp[0] });
  }

  await browser.close(postsParsingTab);
};

export default {
  collect,
  parse,
  apply,
  findMatches: localTools.findMatches,
  getValidPosts: localTools.getValidPosts,
  setMatchingAndUnmatchingPosts: localTools.setMatchingAndUnmatchingPosts,
};
