import React from 'react';
import ReactDOM from 'react-dom/client';
import vars from '../../../../../root/ui/src/viewUtils/viewsVars';
import bridge from '../../../../../root/ui/src/viewUtils/bridge';

import {
  sleep,
  runServerAction,
  globalStyle,
  projectsControllers,
} from '../../../../../root/ui/src/viewUtils/common';
import viewsVars from '../../../../../root/ui/src/viewUtils/viewsVars';

//todo: local cache might not be working.

const options = {
  dryRun: false,
  cacheLimit: 1000,
  messageDelayMs: 30000,
  messageLineDelayMs: 2000,
  membersChunckSize: 15,
};

interface Data {
  approachedPeople: Record<string, Member>;
}
const data: Data = {
  approachedPeople: {},
};

const genRandomNumber = (mi: number, ma: number) => {
  let min = Math.ceil(mi);
  let max = Math.floor(ma);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const genRandomNickName = (length: number) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const parseMembers = (membersDOM: Element[]) => {
  return membersDOM.map((memberDOM, index) => {
    const gender = memberDOM.querySelector('a')?.classList.contains('female')
      ? 'female'
      : 'male';

    const ageString = memberDOM.querySelector('a #age')?.innerText ?? null;
    const age = ageString ? Number(ageString) : null;
    const nickname = memberDOM.querySelector('a #nickname')?.innerText ?? null;
    const country = memberDOM.querySelector('a i')?.getAttribute('id') ?? null;

    if (!nickname) {
      console.log('Err -> could not parse member, nickname is null');
      return null;
    }

    const parsedMember: Member = {
      nickname,
      age,
      gender,
      country,
      DOMElementIndex: index,
    };

    return parsedMember;
  });
};

interface Member {
  nickname: string;
  age: number | null;
  gender: 'male' | 'female' | null;
  country: string | null;
  DOMElementIndex: number;
}

const extractUnapproachedMembers = (members: Member[]) => {
  const onlyUnapproachedMembersList = members.filter((targetMember) => {
    const memberExistsInLocalApproachedMembersList = Boolean(
      data.approachedPeople[targetMember.nickname],
    );
    if (memberExistsInLocalApproachedMembersList) {
      // todo: fix these checks. All similar but not same???
      // console.log('found similar member in local cache')
      const potentialSameMemberInCache =
        data.approachedPeople[targetMember.nickname];
      const memberInLocalCache = Object.keys(potentialSameMemberInCache).every(
        (memberProperty) => {
          if (memberProperty == 'DOMElementIndex') {
            return true;
          }
          // console.log(potentialSameMemberInCache[memberProperty])
          // console.log(targetMember[memberProperty])
          return (
            potentialSameMemberInCache[memberProperty] ==
            targetMember[memberProperty]
          );
        },
      );

      if (memberInLocalCache) {
        // new user with a cached nickname. Update with new.
        return false;
      }

      // console.log('similar but not the same')
      data.approachedPeople[targetMember.nickname] = targetMember;
      return true;
    }

    return true;
  });

  return onlyUnapproachedMembersList;
};

const whichMemberUnApproached = async (members: Member[]) => {
  // extract unapproached members from local cache first
  const unapproachedMembers = extractUnapproachedMembers(members);
  if (!unapproachedMembers.length) {
    return false;
  }

  console.log(
    `Members Not in Local Cache ${unapproachedMembers.length}/${members.length}`,
  );

  // to not overwhelm the server
  await sleep(200);
  const response = await runServerAction({
    action: (root) => root.frugalads.chatiwus.whichMembereWasNotApproached,
    data: unapproachedMembers,
  });

  // console.log({ serverResp: response });
  if (!response || response.err) {
    console.log(
      'Err -> server resopnse is invalid, it should be a boolean.',
      response.err,
    );
    return null;
  }

  interface ResponseData {
    approachedMembers: Member[];
    unapproachedmembers: Member[];
  }
  const responseData: ResponseData = response.data;
  // server found some unapproached members
  if (responseData) {
    responseData.approachedMembers.forEach((approachedMember) => {
      data.approachedPeople[approachedMember.nickname] = approachedMember;
    });

    const unapproachedMember = responseData.unapproachedmembers[0];
    if (unapproachedMember) {
      data.approachedPeople[unapproachedMember.nickname] = unapproachedMember;
      return unapproachedMember;
    }
  }

  return false;
};

const getAllMembersDOM = () => {
  const membersListDOM = document.querySelector('#friend_list > ul')?.children;

  return Array.from(document.querySelector('#friend_list > ul').children) ?? [];
};

const chunkify = (list: any[], chunckSize: number) => {
  const result = list.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunckSize);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
};

const getFirstUnapproachedMember = async () => {
  const membersDOM = getAllMembersDOM();
  if (!membersDOM.length) {
    console.log(
      'Err -> found no members in the DOM list from getAllMembersDOM',
    );
    return null;
  }

  const membersDOMChuncks = chunkify(membersDOM, options.membersChunckSize);

  for (let i = 0; i < membersDOMChuncks.length; i++) {
    const membersDOMChunck = membersDOMChuncks[i];

    // don't mind the silly TS error
    const parsedMembers: Member[] = parseMembers(membersDOMChunck).filter(
      (member) => member != null,
    );
    const unapproachedMember = await whichMemberUnApproached(parsedMembers);

    if (unapproachedMember == null) {
      console.log('Err -> could not check approachability of a member');
      return null;
    }

    // false means no member found to be unapproached
    if (unapproachedMember != false) {
      // console.log("memberHasBeenApproached", memberHasBeenApproached);
      return {
        ...unapproachedMember,
        element: membersDOMChunck[unapproachedMember.DOMElementIndex],
      };
    }
  }

  console.log('Err -> could not get an approachable member');
  return null;
};

//todo: each instance has to inform the server with it's chosen nickname for the instances to not waste resources on each other.
const loginWithNewAccount = () => {
  const nicknameInput = document.querySelector('#input1');
  const ageSelectInput = document.querySelector('#age_list');
  const sexMaleRadioButton = document.querySelector(
    "input[type='radio'][name='sex'][value='M']",
  );
  const submitButton = document.querySelector('#submit_btn');

  nicknameInput.value = genRandomNickName(15);
  // nicknameInput.value = `Man${genRandomNumber(1000, 9999)}`;
  ageSelectInput.value = genRandomNumber(20, 50);
  sexMaleRadioButton.checked = true;
  submitButton.click();
};

const isLoggedin = () => {
  const loginForm = document.querySelector('#start_form');
  // console.log(loginForm);
  return !Boolean(loginForm);
};

const pickRandomVariation = (msgList: string[]) => {
  return msgList[Math.floor(Math.random() * msgList.length)];
};

const sendAd = async ({
  parsedMsgVariations,
  member,
}: {
  parsedMsgVariations: string[];
  member: Member;
}) => {
  const chatHistoryExists =
    document.querySelector('#chat_text_div')?.children.length;
  const lastMessageIsFromMe =
    chatHistoryExists &&
    Array.from(document.querySelector('#chat_text_div')?.children).some(
      (chatMsg) => {
        return chatMsg.innerText == 'Me';
      },
    );

  const haveApproachedBefore = chatHistoryExists && lastMessageIsFromMe;

  //* This is a thriple-check, the first two is the local cache and ther server request.
  if (!haveApproachedBefore) {
    console.log(`sending to : ${member.nickname}`);

    const msgLines = pickRandomVariation(parsedMsgVariations);
    for (let i = 0; i < msgLines.length; i++) {
      await sleep(options.messageLineDelayMs);
      document.querySelector('#chat_textarea').value = msgLines[i];
      if (options.dryRun) {
        console.log({ msgLine: msgLines[i] });
        continue;
      }

      document.querySelector('#chat_sendbtn').click();
    }
  } else {
    console.log('Err -> this should never happen');
  }
};

const limitCache = (limit) => {
  const membersKeys = Object.keys(data.approachedPeople);
  if (membersKeys.length > limit) {
    delete data.approachedPeople[membersKeys[0]];
  }
};

(async () => {
  console.log('=========> injected');

  // todo: use await runServerAction and get rid of this mess
  const response = await runServerAction({
    action: (root) => root.frugalads.chatiwus.getAdVariations,
    data: {},
  });
  if (response.err) {
    console.log(
      'Err -> cannot operate with out messages from the server. Cancel.',
    );
    return;
  }

  const parsedMsgVariations = response.data.map((msgVariation) => {
    return msgVariation
      .map((line) => {
        return line.trim().replace('  ', ' ');
      })
      .filter((line) => line.length > 0);
  });

  await sleep(3000);
  if (!isLoggedin()) {
    loginWithNewAccount();
    return;
  }

  while (true) {
    await sleep(options.messageDelayMs);

    interface ActionableMember extends Member {
      element: Element;
    }
    const member: null | ActionableMember = await getFirstUnapproachedMember();
    // console.log({ member });
    if (member == null || member == undefined) {
      // console.log("debugging sleep");
      // await sleep(90000);
      continue;
    }

    // select member
    member.element.querySelector('a').click();
    await sleep(1000);

    await sendAd({ parsedMsgVariations, member });

    // keep cache from growing like crazy
    limitCache(options.cacheLimit);
  }
})();
