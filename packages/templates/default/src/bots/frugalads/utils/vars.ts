export interface Member {
  nickname: string;
  country: string;
  gender: 'male' | 'female';
  age: number;
  DOMElementIndex: number;
}
export interface Site {
  peopleWereApproached: Record<string, Member>;
}
interface Vars {
  sites: Record<'chatiwus', Site>;
  sessionStats: {
    previous: {
      checksCount: number;
      checkRequestsCount: number;
      sentAdsCount: number;
    };
    current: {
      checksCount: number;
      checkRequestsCount: number;
      sentAdsCount: number;
    };
    durationSeconds: number;
    counting: boolean;
    sentPer30Seconds: number;
    checksPer30Seconds: number;
  };
}
const vars: Vars = {
  sessionStats: {
    current: {
      checksCount: 0,
      checkRequestsCount: 0,
      sentAdsCount: 0,
    },
    previous: {
      checksCount: 0,
      checkRequestsCount: 0,
      sentAdsCount: 0,
    },
    durationSeconds: 0,
    counting: false,
    sentPer30Seconds: 0,
    checksPer30Seconds: 0,
  },
  sites: {
    chatiwus: {
      peopleWereApproached: {},
    },
  },
};

export default vars;
