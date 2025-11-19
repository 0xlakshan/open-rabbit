#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {existsSync} from 'fs';
import {resolve} from 'path';

const cli = meow(
	`
	Usage
	  $ open-rabbit <file-path>

	Options
	  --model, -m     AI model to use (gemini-2.5-flash, gemini-2.0-flash-exp)
	  --detailed, -d  Provide more detailed feedback
	  --focus, -f     Focus area (security, performance, style, all)
	  --help, -h      Show help

	Examples
	  $ open-rabbit ./src/index.ts
	  $ open-rabbit ./app.tsx --detailed
	  $ open-rabbit ./api.ts --focus=security
	  $ open-rabbit ./utils.js --model=gemini-2.0-flash-exp
`,
	{
		importMeta: import.meta,
		flags: {
			model: {
				type: 'string',
				alias: 'm',
				default: 'gemini-2.5-flash',
			},
			detailed: {
				type: 'boolean',
				alias: 'd',
				default: false,
			},
			focus: {
				type: 'string',
				alias: 'f',
				default: 'all',
			},
		},
	},
);

if (cli.input.length === 0) {
	console.error('Error: Please provide a file path to review');
	console.log('\nUsage: open-rabbit <file-path>');
	console.log('Try: open-rabbit --help');
	process.exit(1);
}

const filePath = resolve(cli.input[0]);

if (!existsSync(filePath)) {
	console.error(`Error: File not found: ${filePath}`);
	process.exit(1);
}

render(
	<App
		filePath={filePath}
		model={cli.flags.model}
		detailed={cli.flags.detailed}
		focus={cli.flags.focus}
	/>,
);
