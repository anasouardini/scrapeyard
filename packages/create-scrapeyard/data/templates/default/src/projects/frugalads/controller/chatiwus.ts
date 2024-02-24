import {
  browser,
  serverTools,
  init,
  serverVars,
  dispatcher,
  type ProjectsControllers,
} from 'scrapeyard';
import msg from '../data/fiverr-gig.msg';
import { BrowserContext, Page, Route } from 'playwright';
import vars, { type Member } from '../utils/vars';
import fiverrGigMsg from '../data/fiverr-gig.msg';
import twitterPostMsg from '../data/twitter-post-ad';
import twitterAccount from '../data/twitter-account-ad';

const options = {
  numberOfInstances: 1,
  msgVariations: twitterAccount,
};

interface Profile {
  nickName: string;
  age: number;
}
const injectChatiwView = (tab: Page) => {
  browser.injectView(tab, { projectName: 'frugalads', viewName: 'chatiwus' });
};

const statsPrinter = () => {
  if (!vars.sessionStats.counting) {
    const intervalSeconds = 30;
    // * setting counting to true so that I don't lunch many intervals at once which will make speed metrics useless.
    vars.sessionStats.counting = true;
    vars.sessionStats.durationSeconds = 0;
    setInterval(() => {
      vars.sessionStats.durationSeconds += intervalSeconds;

      const oldSentCount = vars.sessionStats.previous.sentAdsCount;
      const oldChecksCount = vars.sessionStats.previous.checksCount;
      const newSentCount = vars.sessionStats.current.sentAdsCount;
      const newChecksCount = vars.sessionStats.current.checksCount;

      // saving speeds to local vars
      vars.sessionStats.sentPer30Seconds = newSentCount - oldSentCount;
      vars.sessionStats.checksPer30Seconds = newChecksCount - oldChecksCount;

      const {
        sentPer30Seconds,
        checksPer30Seconds,
        durationSeconds,
        current: { checksCount, sentAdsCount, checkRequestsCount },
      } = vars.sessionStats;
      console.log({
        checksCount,
        checkRequestsCount,
        sentAdsCount,
        sentPer30Seconds,
        checksPer30Seconds,
        durationSeconds,
        totalMembers: Object.keys(vars.sites.chatiwus.peopleWereApproached)
          .length,
      });

      // saving a copy to the previous stat for speed calculation.
      vars.sessionStats.previous = structuredClone(vars.sessionStats.current);
    }, intervalSeconds * 1000);
  }
};

const lunchInstance = async () => {
  statsPrinter();

  const instances = Array(options.numberOfInstances).fill({
    stateful: false,
    headless: false,
  });

  for (let i = 0; i < instances.length; i++) {
    const driver = await browser.newDriver(instances[i]);
    await start(driver);
    // await dispatcher(driver, {
    //   action: ((root: ProjectsControllers) =>
    //     root.frugalads.chatiwus.start).toString(),
    //   data: {},
    //   type: "direct",
    // });
  }
};

const start = async (driver: BrowserContext) => {
  // todo: need profiles on the desk so that I can avoid captchas everytime I lunch an instance.

  //? first page is cursed, go back to newTab.
  const chatiwusTab = driver.pages()[0];
  await browser.goto(chatiwusTab, {
    url: 'https://chatiw.us',
  });

  //* event listener waiting for the chatting ui to appear, and for the user to manuall submit the captcha.
  const eventGlobalVars = { alreadyHandlingEvent: false };
  const eventHandler = async function (route) {
    // console.log({
    //   alreadyHandlingEvent: eventGlobalVars.alreadyHandlingEvent,
    // });

    // console.log("subscription event");
    //* wait for the recaptcha to appear (or not)
    await serverTools.sleep(10000);
    const recaptchaExists = await browser.findElement(chatiwusTab, {
      query: '.g-recaptcha',
    });
    if (!recaptchaExists) {
      browser.unsubscribeToRoute(chatiwusTab, {
        urlPattern: new RegExp(/chatting.php/gi),
        eventHandler,
      });

      //* keeping other requests event from duplicating the actions
      if (eventGlobalVars.alreadyHandlingEvent) {
        return;
      }
      eventGlobalVars.alreadyHandlingEvent = true;

      console.log('recaptcha gone');
      injectChatiwView(chatiwusTab);
    }

    route.continue();
  };
  browser.subscribeToRoute(chatiwusTab, {
    urlPattern: new RegExp(/chatting.php/gi),
    eventHandler,
  });

  // on block, clear cookies and restart
  async function onBlockEventHandler(route: Route) {
    // console.log('account blocked for spamming')
    // await driver.close();
    // await lunchInstance();
  }
  browser.subscribeToRoute(chatiwusTab, {
    urlPattern: new RegExp(/chatting.php\?slow=down/gi),
    eventHandler: onBlockEventHandler,
  });

  injectChatiwView(chatiwusTab);
};

const whichMembereWasNotApproached = (
  driver: BrowserContext,
  targetsList: Member[],
) => {
  vars.sessionStats.current.checkRequestsCount++;

  interface SiftedMembers {
    approachedMembers: Member[];
    unapproachedmembers: Member[];
  }
  const { unapproachedmembers, approachedMembers } =
    targetsList.reduce<SiftedMembers>(
      (acc: SiftedMembers, targetMember: Member) => {
        const wasApproached = wasMemberApproached(targetMember);
        // console.log({ wasApproached });
        if (wasApproached == null) {
          return acc;
        }

        if (wasApproached) {
          acc.approachedMembers.push(targetMember);
          return acc;
        }

        acc.unapproachedmembers.push(targetMember);
        return acc;
      },
      {
        approachedMembers: [],
        unapproachedmembers: [],
      },
    );

  if (unapproachedmembers.length) {
    vars.sites.chatiwus.peopleWereApproached[unapproachedmembers[0].nickname] =
      unapproachedmembers[0];
    vars.sessionStats.current.sentAdsCount++;
  }

  const responseData = {
    approachedMembers,
    unapproachedmembers,
  };

  // console.log({ responseData });
  return { data: responseData };
};

const wasMemberApproached = (targetMember: Member) => {
  if (!targetMember?.nickname) {
    console.log('invalid targetMember was provided in wasMemberApproached');
    return null;
  }

  vars.sessionStats.current.checksCount++;

  const approachedMember =
    vars.sites.chatiwus.peopleWereApproached?.[targetMember.nickname];

  // member with same nickname/id exists
  if (approachedMember) {
    const exactSameMemberHaveBeenApproached = Object.keys(
      approachedMember,
    ).every((targetPersonKey) => {
      if (targetPersonKey == 'DOMElementIndex') {
        return true;
      }
      return (
        approachedMember[targetPersonKey as keyof Member] ==
        targetMember[targetPersonKey as keyof Member]
      );
    });

    if (exactSameMemberHaveBeenApproached) {
      return true;
    }

    // updating props of the old member with same nickname/id
    Object.keys(approachedMember).forEach((key) => {
      const personKey = key as keyof Member;
      //* ignore the error, TS is helucinating.
      approachedMember[personKey] = targetMember[personKey];
    });

    return true;
  }

  // the client will send the msg/ad when it receives "false"
  return false;
};

const getAdVariations = () => {
  const parsedMsgVariations = options.msgVariations.map((msg) => {
    return msg
      .split('\n')
      .map((line) => {
        return line.replace(/\s+/g, ' ').trim();
      })
      .filter((line) => line.length > 0);
  });
  // console.log(parsedMsgVariations);
  return {
    data: parsedMsgVariations,
  };
};

export default {
  start,
  getAdVariations,
  whichMembereWasNotApproached,
  lunchInstance,
};
