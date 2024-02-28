import dbCnx from './db';
import { PostRow, JobBoardsTables } from './dbTypes';
import queryBuilder from '../utils/queryBuilder';

const get = ({
  filter,
  columns,
  length,
  orderBy = 'queueDate',
}: {
  filter?: Partial<PostRow>;
  columns?: any[];
  length?: number;
  orderBy?: keyof PostRow;
}): PostRow[] | false => {
  let query = queryBuilder.get<JobBoardsTables>({
    table: 'posts',
    filter,
    columns,
    length,
    orderBy,
  });
  if (!query) {
    console.log('wrong data passed to queryBuilder');
    return false;
  }

  // console.log(query);
  let statement: unknown = null;
  if (length === 1) {
    statement = dbCnx.prepare(query.query);
    // @ts-ignore
    const resp = statement.get(query.params);
    if (resp === undefined) {
      return [];
    }
    return [resp];
  } else if (!length || length > 1) {
    statement = dbCnx.prepare(query.query);
    // @ts-ignore
    return statement.all(query.params);
  }

  console.log('Err -> a get query with length=0 ?');
  return false;
};

const add = ({
  values,
  ignoreDuplicate = false,
}: {
  values: Partial<PostRow>;
  ignoreDuplicate?: boolean;
}) => {
  if (ignoreDuplicate) {
    const result = get({ filter: { url: values.url }, length: 1 });
    if (result && result.length) {
      // console.log("Warning -> the post already exists; Ignoring entry.");
      return false;
    }
  }

  const query = queryBuilder.add<JobBoardsTables>({ table: 'posts', values });
  // console.log({query})
  if (!query) {
    console.log('wrong data passed to queryBuilder');
    return false;
  }
  const statement = dbCnx.prepare(query.query);
  return statement.run(query.params);
};

const update = ({
  filter,
  newValues,
}: {
  filter: Partial<PostRow>;
  newValues: Partial<PostRow>;
}) => {
  const query = queryBuilder.update<JobBoardsTables>({
    table: 'posts',
    filter,
    newValues,
  });
  if (!query) {
    console.log('wrong data passed to queryBuilder');
    return false;
  }

  // console.log(query);
  // return;
  const statement = dbCnx.prepare(query.query);
  statement.run(query.params);

  // return the updated version from db
  return get({ filter, length: 1 });
};

export default { get, add, update };
