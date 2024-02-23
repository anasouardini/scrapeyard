// todo: use proper types for filter and values
// todo: abstract "where" and "set" loops
// todo: use keys instead of ? in the query, the params has to be an object

const get = <DBTables>({
  table,
  filter,
  columns,
  length,
  start,
  orderBy,
}: {
  table: keyof DBTables;
  filter?: Partial<DBTables[keyof DBTables]>;
  columns?: string[];
  length?: number;
  start?: number;
  orderBy?: string;
}) => {
  let query = `select ${
    columns?.length ? columns.join(', ') : '*'
  } from ${table}`;
  let params: Record<string, any> = {};

  const filterEntries = Object.entries(filter ?? {});
  if (filterEntries.length) {
    query += ' where ';
    const criteria: string[] = [];
    filterEntries.forEach((criterion) => {
      if (criterion[1] === null) {
        criteria.push(`${criterion[0]} is null`);
        return;
      }
      criteria.push(`${criterion[0]}=$${criterion[0]}`);
      params[criterion[0]] = criterion[1];
    });
    query += criteria.join(' and ');
  }

  if (start) {
    if (query.includes('where')) {
      query += ' and ';
    }
    query += `${start ? `id>=$id` : ''}`;
    params.id = start;
  }

  if (orderBy) {
    query += ` order by ${orderBy}`;
  }

  if (length && length > 1) {
    query += ` limit $limit`;
    params.limit = length;
  }

  return { query, params };
};

const add = <DBTables>({
  table,
  values,
}: {
  table: keyof DBTables;
  values: { [key: string]: any };
}) => {
  let query = `insert into ${table}`;
  let params: any[] = [];

  const valuesKeys = Object.keys(values ?? {});
  const valuesValues = Object.values(values ?? {});
  if (valuesKeys.length) {
    // specifying columns
    query += ' (';
    const qKeys: string[] = [];
    valuesKeys.forEach((value) => {
      qKeys.push(`${value}`);
    });
    query += qKeys.join(', ');
    query += ')';

    // adding values
    query += ' values(';
    const qValues: string[] = [];
    valuesValues.forEach((value) => {
      qValues.push('?');
      params.push(value);
    });
    query += qValues.join(', ');
    query += ')';
  }

  return { query, params };
};

const update = <DBTables>({
  table,
  filter,
  newValues,
}: {
  table: keyof DBTables;
  filter?: Partial<DBTables[keyof DBTables]>;
  newValues: Record<string, any>;
}) => {
  let query = `update ${table}`;
  let params: any[] = [];

  const valuesEntries = Object.entries(newValues ?? {});
  if (!valuesEntries.length) {
    console.log('Err -> there were no provided values to update');
    return false;
  }
  query += ' set ';
  const qValues: string[] = [];
  valuesEntries.forEach((value) => {
    qValues.push(`${value[0]}=?`);
    params.push(value[1]);
  });
  query += qValues.join(', ');

  const filterEntries = Object.entries(filter ?? {});
  if (filterEntries.length) {
    query += ' where ';
    const criteria: string[] = [];
    filterEntries.forEach((criterion) => {
      criteria.push(`${criterion[0]}=?`);
      params.push(criterion[1]);
    });
    query += criteria.join(' and ');
  }

  return { query, params };
};

const create = <DBTables>({
  table,
  newValues,
}: {
  table: keyof DBTables;
  newValues: Record<string, any>;
}) => {
  let query = `insert into ${table}`;
  let params: any[] = [];

  const valuesKeys = Object.keys(newValues);
  const valuesValues = Object.values(newValues);
  if (!valuesKeys.length) {
    console.log('Err -> there were no provided values to update');
    return false;
  }
  query += ` (${valuesKeys.join(', ')})`;
  query += ` values (${valuesValues.map((v) => '?').join(', ')})`;
  params.push(...valuesValues);

  return { query, params };
};

export default { get, add, update, create };
