import dbCnx from './db';

// todo: dates shall be unique
const schemas = {
  tables: {
    companies: `create table companies (
                    name varchar(100) primary key,
                    headquarters varchar(20)
                );`,
    posts: `create table posts (
            companyName varchar(100),
            url varchar(30) primary key,
            platformUrl varchar(100) not null,
            city varchar(30) not null,
            title varchar(30) not null,
            status varchar(30) not null,
            phone varchar(20),
            details varchar(500),
            queueDate date not null,
            sendDate date,
            foreign key (companyName) references companies(name)
        );`,
  },
  alteringTransaction: {
    open: `
               PRAGMA foreign_keys=off;
               BEGIN TRANSACTION;
               drop table if exists newTempTableName;
               ALTER TABLE $tableName RENAME TO newTempTableName;
            `,
    close: `INSERT INTO $tableName SELECT * FROM newTempTableName;
                drop table if exists newTempTableName;
                COMMIT;
                PRAGMA foreign_keys=on;`,
  },
};
type TableNames = keyof (typeof schemas)['tables'];

const exec = ({
  tableName,
  alter,
}: {
  tableName: TableNames;
  alter?: boolean;
}) => {
  console.log(`----- ${alter ? 'altering' : 're-creating'} ${tableName} ----`);
  const query = `
        ${
          alter
            ? schemas.alteringTransaction.open
            : `drop table if exists ${tableName};`
        }
        ${schemas.tables[tableName]};
        ${alter ? schemas.alteringTransaction.close : ``}
    `;
  const parsedQuery = query.replace(/\$tableName/g, tableName);
  console.log(parsedQuery);
  const resp = dbCnx.exec(parsedQuery);
};

// alter is the default because it's safer (no potential data loss)
const schema = ({ type = 'alter' }: { type: 'init' | 'alter' }) => {
  console.log('--------- schema change -------');
  const tableNames = Object.keys(schemas.tables) as TableNames[];
  tableNames.forEach((tableName) => {
    exec({ tableName, alter: type === 'alter' });
  });
  // add placeholder company row
  const statement = dbCnx.prepare(
    `insert into companies (name, headquarters) values ('placeholder', 'placeholder')`,
  );
  statement.run();
};

export default schema;
