#!/usr/bin/env node

const {program} = require('commander');
const patchActions = require('../dist/patch-actions');

program
  .command('patch-actions [tsconfig] [entry]')
  .description('Patch the actions without proxy')
  .option('--echo', 'echo only, do not write')
  .action((tsconfig, entry, options) => {
    patchActions(tsconfig, entry, !!options.echo);
  });

program.parse(process.argv);
