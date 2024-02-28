export interface CompanyRow {
  name: string;
  headquarters: string;
}

export interface PostRow {
  companyName: string;
  url: string;
  platformUrl: string;
  city: string;
  title: string;
  status:
    | 'queued'
    | 'valid'
    | 'invalid'
    | 'doesNotContainKeywords'
    | 'doesMatch'
    | 'doesNotMatch'
    | 'applied'
    | 'postponed'
    | 'contacted'
    | 'interviewed'
    | 'removed';
  phone?: string;
  details?: string;
  queueDate: string;
  sendDate?: string;
}
// -> job post's life cycle
// collect (queued)
// visit url (error, doesMatch)
// send (sent, postponed)
// update (contacted, interviewed, removed)

export interface JobBoardsTables {
  posts: PostRow;
  companies: CompanyRow;
}
