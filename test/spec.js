const assert = require('assert');

describe('Eclipt', () => {
    const CLI = require('../lib/main.js');

    describe('Parsing', () => {

        it('Should parse regular arguments when no options were specified', () => {
            let cli = new CLI('my-tool');
            let input = cli.execute([ 'foo', '--', '-n', '--fake-opt', 'fakearg', 'arg1' ]);
            assert.strictEqual(input.args.length, 4);
        });

        it('Should fail when given option is not specified', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ] });
            assert.throws( () => cli.execute([ 'foo', '--opt2', 'arg2' ]), /Unknown option/ );
            assert.throws( () => cli.execute([ 'foo', '-f', 'arg2' ]), /Unknown option/ );
        });

        it('Should fail when option argument is not given', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ] });
            assert.throws( () => cli.execute([ 'foo', '--opt1' ]), /Missing value/ );
            assert.throws( () => cli.execute([ 'foo', '--opt1', '--opt2' ]), /Missing value/ );
        });

        it('Should parse global options', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ], opt2: [ false, 'foo' ] });
            let input = cli.execute([ 'foo', '--opt1', 'arg1', '--opt2', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], 'arg1');
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse short options', () => {
            let cli = new CLI('my-tool', { opt1: [ 'o', 'foo', 'thing1' ], opt2: [ false, 'foo' ] });
            let input = cli.execute([ 'foo', '-o', 'arg1', '--opt2', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], 'arg1');
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse grouped short options', () => {
            let cli = new CLI('my-tool', { opt1: [ 'o', 'foo' ], opt2: [ 'f', 'foo' ] });
            let input = cli.execute([ 'foo', '-of', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], true);
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse command options', () => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd', { options: { opt1: [ false, 'foo', 'thing1' ], opt2: [ false, 'foo' ] } });
            let input = cli.execute([ 'foo', 'my-cmd', '--opt1', 'arg1', '--opt2', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], 'arg1');
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should fail when given command doesn\'t exist [requireCommand]', () => {
            let cli = new CLI('my-tool', {}, { requireCommand: true });
            assert.throws( () => cli.execute([ 'foo', 'fake-command' ]), /Unknown command/ );
        });

    });

    describe('Help', () => {

        it('Should ...', () => {
            let cli = new CLI('my-tool');
            let input = cli.execute([ 'foo', '-h' ]);
            //assert.strictEqual(input.args.length, 4);
        });

    });

});

// TODO allow Define positional args
