const fs = require('fs');

const getLatestMigrationNumber = () => {
  const fileNames = fs.readdirSync('./migrations');
  if (fileNames.length === 0) return 0;
  const migrationNumbers = fileNames
    .map(fname => parseInt(fname.split('.')[0]))
    .sort((a, b) => a > b);
  return migrationNumbers[migrationNumbers.length - 1];
};

module.exports = function (plop) {
  plop.setGenerator('migration', {
    description: 'Migration generator',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'migration name (snake_case):',
      },
      {
        type: 'input',
        name: 'desc',
        message: 'migration description:',
      },
    ],
    actions: () => {
      const migrationNumber = (getLatestMigrationNumber() + 1).toString().padStart(4, '0');
      return [
        {
          type: 'add',
          path: 'migrations/{{number}}.do.{{name}}.sql',
          templateFile: 'templates/migration.hbs',
          data: { type: 'DO', number: migrationNumber },
        },
        {
          type: 'add',
          path: 'migrations/{{number}}.undo.{{name}}.sql',
          templateFile: 'templates/migration.hbs',
          data: { type: 'UNDO', number: migrationNumber },
        },
      ];
    },
  });
};
