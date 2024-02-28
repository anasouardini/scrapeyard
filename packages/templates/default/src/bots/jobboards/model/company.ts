import queryBuilder from '../utils/queryBuilder';
import dbCnx from './db';
import { CompanyRow } from './dbTypes';

const get = ({
  filter,
  columns,
  length,
  orderBy = 'name',
}: {
  filter?: Partial<CompanyRow>;
  columns?: any[];
  length?: number;
  orderBy?: keyof CompanyRow;
}): CompanyRow[] | false => {
  let query = queryBuilder.get({
    table: 'companies',
    filter,
    columns,
    length,
    orderBy,
  });
  // console.log(query);
  if (!query) {
    console.log('wrong data passed to queryBuilder');
    return false;
  }

  console.log(query);
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
  values: Partial<CompanyRow>;
  ignoreDuplicate?: boolean;
}) => {
  if (ignoreDuplicate) {
    const result = get({ filter: { name: values.name }, length: 1 });
    if (result && result.length) {
      console.log('Warning -> the company already exists; Ignoring entry.');
      return;
    }
  }
  const query = queryBuilder.add({ table: 'companies', values });
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
  filter: Partial<CompanyRow>;
  newValues: Partial<CompanyRow>;
}) => {
  const query = queryBuilder.update({ table: 'companies', filter, newValues });
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
