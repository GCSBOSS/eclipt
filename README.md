# [Tempper](https://gitlab.com/GCSBOSS/tempper)

A library to easily create temp dir and inject files. Recommended for test suites.

## Get Started

```js
const Tempper = require('tempper');

// The first temp sesison is started automatically here,
// A diretory will be creted inside your OS's temp dir.
let tmp = new Tempper();

// This new directory is now your current dir.
console.log(process.cwd());

// Inject a file from your former directory into the new tmp one.
tmp.addFile('file-from-old-dir.conf', './same-file');

// Clear the temp directory and get a new one.
tmp.refresh();

console.log(process.cwd());

// Shortcut to create folders on the tmp dir.
tmp.mkdir('my-dir');
tmp.mkdir('my-recursive-dir/new-dir');

// Shortcut to remove both files os directories.
tmp.rm('my-recursive-dir');
tmp.rm('same-file');

// Assert wether paths exist or not.
tmp.assertMissing('my-recursive-dir/new-dir');
tmp.assertExists('same-file'); // => should throw

// Once you're done, erase the tempper diretory for good.
tmp.clear();

// And you'll be back to your old working dir.
console.log(process.cwd());
```

## Reporting Bugs
If you have found any problems with this module, please:

1. [Open an issue](https://gitlab.com/GCSBOSS/tempper/issues/new).
2. Describe what happened and how.
3. Also in the issue text, reference the label `~bug`.

We will make sure to take a look when time allows us.

## Proposing Features
If you wish to get that awesome feature or have some advice for us, please:
1. [Open an issue](https://gitlab.com/GCSBOSS/tempper/issues/new).
2. Describe your ideas.
3. Also in the issue text, reference the label `~proposal`.

## Contributing
If you have spotted any enhancements to be made and is willing to get your hands
dirty about it, fork us and
[submit your merge request](https://gitlab.com/GCSBOSS/tempper/merge_requests/new)
so we can collaborate effectively.
