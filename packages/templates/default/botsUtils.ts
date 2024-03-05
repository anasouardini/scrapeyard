export const botsActions = [
  { name: 'load', action: (root) => root.home.load },
  {
    name: 'collect',
    action: (root) => root.jobboards.indeed.collect,
  },
  {
    name: 'apply',
    action: (root) => root.jobboards.indeed.apply,
  },
  {
    name: 'findMatches',
    action: (root) => root.jobboards.indeed.findMatches,
  },
  {
    name: 'getValidPosts',
    action: (root) => root.jobboards.indeed.getValidPosts,
  },
  {
    name: 'setMatchingAndUnmatchingPosts',
    action: (root) => root.jobboards.indeed.setMatchingAndUnmatchingPosts,
  },
  {
    name: 'updatePostStatus',
    action: (root) => root.jobboards.indeed.updatePostStatus,
  },
  {
    name: 'marocannonces - collect',
    action: (root) => root.jobboards.marocannonces.collect,
  },
  {
    name: 'parse',
    action: (root) => root.jobboards.marocannonces.parse,
  },
  {
    name: 'marocannonces - apply',
    action: (root) => root.jobboards.marocannonces.apply,
  },
  {
    name: 'marocannonces - findMatches',
    action: (root) => root.jobboards.marocannonces.findMatches,
  },
  {
    name: 'marocannonces - getValidPosts',
    action: (root) => root.jobboards.marocannonces.getValidPosts,
  },
  {
    name: 'marocannonces - setMatchingAndUnmatchingPosts',
    action: (root) =>
      root.jobboards.marocannonces.setMatchingAndUnmatchingPosts,
  },
];
