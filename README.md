# [Eclipt](https://gitlab.com/GCSBOSS/eclipt)

A complete library to develop complete CLI programs.

## Get Started

```js
const Eclipt = require('../lib/eclipt.js');

// The first temp sesison is started automatically here,
// A diretory will be creted inside your OS's temp dir.
let cli = new Eclipt(
    'my-cli-tool', // your tool's command name
    { // Available options object
        'opt-1': [ false, 'A cool options', 'string' ], // A regular option with a value
        'flag-1': [ false, 'A cool flag' ], // An option that doesn't receive a value
        'flag-2': [ 'f', 'A flag with a shorthand notation' ], // You may use -f
        'opt-2': [ false , 'An option with a default value', 'string', 'my-default' ]
    }
);

// Read process argv and generate the cli data.
let input = cli.execute();
console.log(input);
```

## Reporting Bugs
If you have found any problems with this module, please:

1. [Open an issue](https://gitlab.com/GCSBOSS/eclipt/issues/new).
2. Describe what happened and how.
3. Also in the issue text, reference the label `~bug`.

We will make sure to take a look when time allows us.

## Proposing Features
If you wish to get that awesome feature or have some advice for us, please:
1. [Open an issue](https://gitlab.com/GCSBOSS/eclipt/issues/new).
2. Describe your ideas.
3. Also in the issue text, reference the label `~proposal`.

## Contributing
If you have spotted any enhancements to be made and is willing to get your hands
dirty about it, fork us and
[submit your merge request](https://gitlab.com/GCSBOSS/eclipt/merge_requests/new)
so we can collaborate effectively.

## Reference

### Options Object

An object containing CLI options definition. Each key in the object is the name
of an option and has assigned to it an array with the following data:

```js
string: [ // Option name
    false || character // Define a property shorthand form if needed.
    string // Describes the option (used in help output).
    null || string // Name of the expected option value. Leave it blank to define a flag.
    null || string // A default value for the option.
]
```

### Constructor

To create a new CLI, use the Eclipt constructor with the following arguments:

```js
let cli = new Eclipt(
    'my-tool', // Your tool's command name
    options, // The available options object
    settings // General settings for your CLI
);
```

These are the settings supported by the constructor:

```js
{
    noArgs: boolean, // Whether positional arguments are supported or not
    requireCommand: boolean, // Whether a command is required or not
    getVersion: aFunction, // Function that retrieves the version for your tool
    onOutput: aFunction // To be executed whenever the cli means to output. Ex.: help or version output. Defaults to `console.log`
}
```

### Commands

You can add commands to your tool with `cli.setCommand` as follows:

```js
cli.setCommand(name, { // The command name and settings object
    options: options, // The options object for the command
    summary: string, // A brief explanation of the command
    callback: aFunction, // Function to be executed if the command is called
    noArgs: boolean // Whether positional arguments are supported or not
});
```
