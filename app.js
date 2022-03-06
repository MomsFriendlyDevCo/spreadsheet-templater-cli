#!/bin/sh
":" //# comment; exec /usr/bin/env node --no-warnings "$0" "$@"
// ^^^ Weird hack to disable warnings - https://gist.github.com/rachidbch/5985f5fc8230b45c4b516ce1c14f0832

var _ = require('lodash');
var commander = require('commander');
var commanderExtras = require('commander-extras');
var {faker} = require('@faker-js/faker');
var SpreadsheetTemplater = require('@momsfriendlydevco/spreadsheet-templater');

var program = commander
	.version(require('./package.json').version)
	.name('spreadsheet-templator')
	.usage('[arguments] <input.xlsx> <output.xlsx>')
	.option('-d, --data [key=val]', 'Set a data value - use multiple times if needed', (v, t) => {
		// Parse --data values {{{
		var [key, val] = v.split(/\s*=\s*/, 2);
		if (key && val === undefined) { // Assume boolean
			_.set(t, key, true);
		} else if (['true', 'false'].includes(val)) { // Assume boolean
			_.set(t, key, val == 'true');
		} else if (isFinite(val)) { // Assume numeric
			_.set(t, key, parseFloat(val));
		} else { // Assume string
			_.set(t, key, val);
		}
		return t;
		// }}}
	}, {})
	.option('--repeat [key=size]', 'Create an empty data array of a given size (useful when using faker) - can be specified multiple times', (v, t) => {
		// Parse --repeat values {{{
		var [key, size] = v.split(/\s*=\s*/, 2);
		if (!size || !parseInt(size)) throw new Error(`Invalid size for '${key}' key, requires --repeat key=size`);
		t[key] = parseInt(size);
		return t;
		// }}}
	}, {})
	.option('-i, --input [file]', 'Specify an input XLSX file (alternative method)')
	.option('-o, --output [file]', 'Specify an output XLSX file (alternative method)')
	.option('-v, --verbose', 'Be verbose - use multiple to increase verbosity', (v, t) => t + 1, 0)
	.note('@faker-js/faker is available as `faker` within a template')
	.note('lodash is available as `_` within a template')
	.example('spreadsheet-templator --repeat=people=100 input.xlsx output.xlsx', 'Create output.xlsx (from input.xlsx) setting `people` to an empty array of 100 items')
	.parse(process.argv)


Promise.resolve()
	// Process args into data {{{
	.then(()=> {
		program = {
			input: program.args[0],
			output: program.args[1],
			data: {},
			...program.opts(),
		};

		// Append repeat data + NPMs
		program.data = {
			...program.data,
			..._.chain(program.repeat)
				.mapValues(size => _.times(size, ()=> ({})))
				.value(),
		};
	})
	// }}}
	// Sanity checks {{{
	.then(()=> {
		if (!program.input) throw new Error('No input file specified');
		if (!program.output) throw new Error('No output file specified');
	})
	// }}}
	// Read input file {{{
	.then(()=> {
		if (program.verbose > 0) console.warn(`Templating ${program.input} -> ${program.output}...`);

		return new SpreadsheetTemplater({
			templateSettings: {
				dotted: true,
				handlebars: true,
				globals: {
					Date, Math, Number,
					_, faker,
				},
			},
		})
			.read(program.input)
	})
	// }}}
	// Apply template data {{{
	.then(spreadsheet => {
		if (program.verbose > 0) console.warn('Using data keys:', Object.keys(program.data));

		return spreadsheet
			.data(program.data)
			.apply()
			.write(program.output)
	})
	// }}}
	// End {{{
	.then(()=> process.exit(0))
	.catch(e => {
		console.warn(e);
		process.exit(1);
	})
	// }}}
