Spreadsheet-Templater-CLI
=========================
Command line interface for [@MomsFriendlyDevCo/Spreadsheet-Templater](https://github.com/MomsFriendlyDevCo/spreadsheet-templater)

This command takes an input + output file path and allows setting of data within the spreadsheet.

```
Usage: spreadsheet-templator [arguments] <input.xlsx> <output.xlsx>

Options:
  -V, --version         output the version number
  -d, --data [key=val]  Set a data value - use multiple times if needed
                        (default: {})
  --repeat [key=size]   Create an empty data array of a given size (useful when
                        using faker) - can be specified multiple times
                        (default: {})
  -i, --input [file]    Specify an input XLSX file (alternative method)
  -o, --output [file]   Specify an output XLSX file (alternative method)
  -v, --verbose         Be verbose - use multiple to increase verbosity
  -h, --help            display help for command

Notes:
  * @faker-js/faker is available as `faker` within a template
  * lodash is available as `_` within a template

Examples:

  # Create output.xlsx (from input.xlsx) setting `people` to an empty array of 100 items
  spreadsheet-templator --repeat=people=100 input.xlsx output.xlsx
```
