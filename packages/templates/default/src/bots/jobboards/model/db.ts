import db from 'better-sqlite3';
import path from 'path';

const cnx = db(path.join(__dirname, '../data/jobboards.db'), {
  fileMustExist: true,
  // verbose: console.log // meh, just prints the query
});
cnx.pragma('journal_mode = WAL');

// const cnx2 = db('../data/dreamjob.db', {});
// cnx.pragma('journal_mode = WAL');

export default cnx;
