const assert = require('assert');

describe('Eclipt', function(){
    const CLI = require('../lib/main.js');

    describe('General', () => {

        it('Should parse regular arguments when no options were specified', () => {
            let cli = new CLI('my-tool');
            let input = cli.execute([ 'foo', '--', '-n', '--fake-opt', 'fakearg', 'arg1' ]);
            assert.strictEqual(input.args.length, 4);
            input = cli.execute([ 'foo', 'not-cmd' ]);
            assert.strictEqual(input.args.length, 1);
        });

        it('Should read ARGV when no args array is supplied', () => {
            let cli = new CLI('my-tool');
            let input = cli.execute();
            assert(/\*\.js/.test(input.args.pop()));
        });

    });

    describe('Commands', () => {

        it('Should parse a specified command', () => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd');
            let input = cli.execute([ 'foo', 'my-cmd' ]);
            assert.strictEqual(input.cmd, 'my-cmd');
        });

        it('Should fail when given command doesn\'t exist [requireCommand]', () => {
            let cli = new CLI('my-tool', {}, { requireCommand: true });
            assert.throws( () => cli.execute([ 'foo', 'fake-command' ]), /Unknown command/ );
        });

        it('Should execute a provided command callback [cmd.callback]', done => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd', { callback: () => done() });
            cli.execute([ 'foo', 'my-cmd' ]);
        });

    });

    describe('Options', () => {

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

        it('Should output defaults when flag is not sent', () => {
            let cli = new CLI('my-tool', {
                opt1: [ false, 'foo', 'thing1', 'foo' ],
                opt2: [ false, 'foo' ]
            });
            let input = cli.execute([ 'foo' ]);
            assert.strictEqual(input.data['opt1'], 'foo');
            assert.strictEqual(input.data['opt2'], false);
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

    });

    describe('Help', () => {

        it('Should output global help', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/Usage\:/.test(data));
                assert(/Options\:/.test(data));
                done();
            } });
            cli.execute([ 'foo', '-h' ]);
        });

        it('Should output given cli summary', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/foobarfoo/.test(data));
                done();
            }, summary: 'foobarfoo' });
            cli.execute([ 'foo', '-h' ]);
        });

        it('Should not output arg placeholder [noArgs]', done => {
            let cli = new CLI('my-tool', {}, { noArgs: true, onOutput(data){
                assert(!/ARGS/.test(data));
                done();
            } });
            cli.execute([ 'foo', '-h' ]);
        });

        it('Should output available commands information', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/\[COMMAND\]/.test(data));
                assert(/my\-cmd\s+foobarbaz/.test(data));
                assert(/cmd2\s+bazbarfoo/.test(data));
                done();
            } });
            cli.setCommand('my-cmd', { summary: 'foobarbaz' });
            cli.setCommand('cmd2', { summary: 'bazbarfoo' });
            cli.execute([ 'foo', '-h' ]);
        });

        it('Should output required command placeholder when command is not rquired [requireCommand]', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(!/\[COMMAND\]/.test(data));
                done();
            }, requireCommand: true });
            cli.setCommand('my-cmd', { summary: 'foobarbaz' });
            cli.execute([ 'foo', '-h' ]);
        });

        it('Should output option informations', done => {
            let cli = new CLI('my-tool', {
                'opt-1': [ false, 'test' ],
                'opt-2': [ 'o', 'rest', 'thing' ]
            }, { onOutput(data){
                assert(/opt-1\s+test/.test(data));
                assert(/opt-2.+\<.+rest/.test(data));
                done();
            } });
            cli.execute([ 'foo', '-h' ]);
        });

    });

    describe('Help Command', () => {

        it('Should output command help', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/Usage\:\s+my-tool\ my-cmd/.test(data));
                assert(/Options\:/.test(data));
                done();
            } });
            cli.setCommand('my-cmd');
            cli.execute([ 'foo', 'my-cmd', '-h' ]);
        });

        it('Should output given command summary', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/foobarfoo/.test(data));
                done();
            } });
            cli.setCommand('my-cmd', { summary: 'foobarfoo' });
            cli.execute([ 'foo', 'my-cmd', '-h' ]);
        });

        it('Should not output arg placeholder [cmd.noArgs]', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(!/ARGS/.test(data));
                done();
            } });
            cli.setCommand('my-cmd', { noArgs: true });
            cli.execute([ 'foo', 'my-cmd', '-h' ]);
        });

    });

    describe('Version', () => {

        it('Should respond to version option with given function [getVersion]', done => {
            let cli = new CLI('my-tool', {}, {
                getVersion: () => '0.0.0',
                onOutput: version => {
                    assert.strictEqual(version, '0.0.0');
                    done();
                }
            });
            cli.execute(['my-tool', '-v']);
        });

    });

    describe('::requireCommands', () => {

        it('Should load commands from js modules in the given dir', () => {
            let cli = new CLI('my-tool');
            cli.requireCommands('./test/res/cmds');
            assert.strictEqual(Object.keys(cli.commands).length, 2);
            assert.strictEqual(cli.commands.bar.test, 'barbazfoo');
            assert.strictEqual(cli.commands.foo.test, 'foobarbaz');
        });

    });

});

// TODO allow Define positional args
