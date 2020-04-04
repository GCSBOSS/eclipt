const assert = require('assert');

process.env.NODE_ENV = 'testing';

describe('Eclipt', function(){
    const CLI = require('../lib/main.js');

    describe('General', () => {

        it('Should parse regular arguments when no options were specified', () => {
            let cli = new CLI('my-tool');
            let input = cli.execute([ 'my-tool', '--', '-n', '--fake-opt', 'fakearg', 'arg1' ]);
            assert.strictEqual(input.args.length, 4);
            input = cli.execute([ 'my-tool', 'not-cmd' ]);
            assert.strictEqual(input.args.length, 1);
        });

        it('Should read ARGV when no args array is supplied', () => {
            let cli = new CLI('test/*.js');
            let input = cli.execute();
            assert.strictEqual(process.argv.length, input.args.length);
        });

    });

    describe('Commands', () => {

        it('Should ignore prepend arguments that are not valid commands', () => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd');
            let input = cli.execute([ 'foo-not-err', 'my-tool', 'my-cmd' ]);
            assert.strictEqual(input.cmd, 'my-cmd');
        });

        it('Should parse a specified command', () => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd');
            let input = cli.execute([ 'my-tool', 'my-cmd' ]);
            assert.strictEqual(input.cmd, 'my-cmd');
        });

        it('Should fail when given command doesn\'t exist [requireCommand]', () => {
            let cli = new CLI('my-tool', {}, { requireCommand: true });
            assert.throws( () => cli.execute([ 'my-tool', 'fake-command' ]), /Unknown command/ );
        });

        it('Should execute a provided command callback [cmd.callback]', done => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd', {
                options: { opt: [ false, 'stuff', 'value' ] },
                callback(a, b, c){
                    assert.strictEqual(b, 'arg1');
                    assert.strictEqual(c, 'arg2');
                    done();
                }
            });
            cli.execute([ 'my-tool', 'my-cmd', '--opt', '1', 'arg1', 'arg2' ]);
        });

    });

    describe('Options', () => {

        it('Should fail when given option is not specified', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ] });
            assert.throws( () => cli.execute([ 'my-tool', '--opt2', 'arg2' ]), /Unknown option/ );
            assert.throws( () => cli.execute([ 'my-tool', '-f', 'arg2' ]), /Unknown option/ );
        });

        it('Should fail when option argument is not given', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ] });
            assert.throws( () => cli.execute([ 'my-tool', '--opt1' ]), /Missing value/ );
            assert.throws( () => cli.execute([ 'my-tool', '--opt1', '--opt2' ]), /Missing value/ );
        });

        it('Should parse global options', () => {
            let cli = new CLI('my-tool', { opt1: [ false, 'foo', 'thing1' ], opt2: [ false, 'foo' ] });
            let input = cli.execute([ 'my-tool', '--opt1', 'arg1', '--opt2', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], 'arg1');
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should output defaults when flag is not sent', () => {
            let cli = new CLI('my-tool', {
                opt1: [ false, 'foo', 'thing1', 'foo' ],
                opt2: [ false, 'foo' ]
            });
            let input = cli.execute([ 'my-tool' ]);
            assert.strictEqual(input.data['opt1'], 'foo');
            assert.strictEqual(input.data['opt2'], false);
        });

        it('Should parse short options', () => {
            let cli = new CLI('my-tool', { opt1: [ 'o', 'foo', 'thing1' ], opt2: [ false, 'foo' ] });
            let input = cli.execute([ 'my-tool', '-o', 'arg1', '--opt2', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], 'arg1');
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse grouped short options', () => {
            let cli = new CLI('my-tool', { opt1: [ 'o', 'foo' ], opt2: [ 'f', 'foo' ] });
            let input = cli.execute([ 'my-tool', '-of', 'arg2' ]);
            assert.strictEqual(input.data['opt1'], true);
            assert.strictEqual(input.data['opt2'], true);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse array options', () => {
            let cli = new CLI('my-tool', { opt1: [ 'o', 'foo', 'bar' ], opt2: [ 'f', 'foo', 'baz' ] });
            let input = cli.execute([ 'my-tool', '-o', '1', '-o', '2', '-o', '3', 'arg2' ]);
            assert.strictEqual(typeof input.data['opt1'], 'object');
            assert.strictEqual(input.data['opt1'].length, 3);
            assert.strictEqual(input.args[0], 'arg2');
        });

        it('Should parse command options', () => {
            let cli = new CLI('my-tool');
            cli.setCommand('my-cmd', { options: { opt1: [ false, 'foo', 'thing1' ], opt2: [ false, 'foo' ] } });
            let input = cli.execute([ 'my-tool', 'my-cmd', '--opt1', 'arg1', '--opt2', 'arg2' ]);
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
            cli.execute([ 'my-tool', '-h' ]);
        });

        it('Should output given cli summary', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/foobarfoo/.test(data));
                done();
            }, summary: 'foobarfoo' });
            cli.execute([ 'my-tool', '-h' ]);
        });

        it('Should not output arg placeholder [noArgs]', done => {
            let cli = new CLI('my-tool', {}, { noArgs: true, onOutput(data){
                assert(!/ARGS/.test(data));
                done();
            } });
            cli.execute([ 'my-tool', '-h' ]);
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
            cli.execute([ 'my-tool', '-h' ]);
        });

        it('Should output required command placeholder when command is not rquired [requireCommand]', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(!/\[COMMAND\]/.test(data));
                done();
            }, requireCommand: true });
            cli.setCommand('my-cmd', { summary: 'foobarbaz' });
            cli.execute([ 'my-tool', '-h' ]);
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
            cli.execute([ 'my-tool', '-h' ]);
        });

        it('Should output positional arguments informations [expectedArgs]', done => {
            let cli = new CLI('my-tool', {}, {
                expectedArgs: [ 'my-thing', 'my-thing-2' ],
                onOutput(data){
                    assert(/my-thing\ my-thing-2/.test(data));
                    done();
                }
            });
            cli.execute([ 'my-tool', '-h' ]);
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
            cli.execute([ 'my-tool', 'my-cmd', '-h' ]);
        });

        it('Should output given command summary', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(/foobarfoo/.test(data));
                done();
            } });
            cli.setCommand('my-cmd', { summary: 'foobarfoo' });
            cli.execute([ 'my-tool', 'my-cmd', '-h' ]);
        });

        it('Should not output arg placeholder [cmd.noArgs]', done => {
            let cli = new CLI('my-tool', {}, { onOutput(data){
                assert(!/ARGS/.test(data));
                done();
            } });
            cli.setCommand('my-cmd', { noArgs: true });
            cli.execute([ 'my-tool', 'my-cmd', '-h' ]);
        });

        it('Should output positional arguments informations [cmd.expectedArgs]', done => {
            let cli = new CLI('my-tool', {}, {
                onOutput(data){
                    assert(/my-thing\ my-thing-2/.test(data));
                    done();
                }
            });
            cli.setCommand('my-cmd', { expectedArgs: [ 'my-thing', 'my-thing-2' ] });
            cli.execute([ 'my-tool', 'my-cmd', '-h' ]);
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
