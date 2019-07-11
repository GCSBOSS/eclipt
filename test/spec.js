const assert = require('assert');
const fs = require('fs');

const CLI = require('../lib/main.js');

let cli = new CLI('my-tool', {
    'opt-1': [ false, 'Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla', 'argDesc', 'default' ],
    'flag-1': [ 'f', 'Usage text bla bla' ]
});

cli.setCommand('doit', {
    summary: 'Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla Usage text bla bla',
    options: {
        'opt-2': [ false, 'Usage text bla bla', 'argDesc', 'default2' ]
    },
    callback: function(data){
        console.log(data);
    }
})

let data = cli.execute([ 'nodecaf', '--opt-1', 'value', '-f', 'doit', '--opt-2', '--', 'arg1', 'arg2' ]);

cli.displayHelp();

//console.log(data);

console.log(cli.shorthands);


describe.skip('Tempper', () => {

    describe('constructor', () => {

        it('Should create a directory in the system temp folder', () => {
            let t = new Tempper();
            assert(fs.existsSync(t.dir));
            process.chdir(__dirname);
            fs.rmdirSync(t.dir);
        });

        it('Should change to the newly created directory', () => {
            let t = new Tempper();
            assert.strictEqual(process.cwd(), t.dir);
            process.chdir(__dirname);
            fs.rmdirSync(t.dir);
        });

        it('Should store the old directory name', () => {
            let od = process.cwd();
            let t = new Tempper();
            assert.strictEqual(od, t.oldDir);
            process.chdir(__dirname);
            fs.rmdirSync(t.dir);
        });

    });

    describe('::clear', () => {

        it('Should create a directory in the system temp folder', () => {
            let t = new Tempper();
            let d = t.dir;
            t.clear();
            assert(!t.dir);
            assert(!fs.existsSync(d));
            t.clear();
        });

    });

    describe('::addFile', () => {

        it('Should copy the file from old location to new one', () => {
            process.chdir('./res');
            let t = new Tempper();
            t.addFile('file.txt', './file.txt');
            assert(fs.existsSync(t.dir + '/file.txt'));
            t.clear();
        });

        it('Should fail when temp not started', () => {
            let t = new Tempper();
            t.clear();
            assert.throws( () => t.addFile('file.txt', './file.txt'), /not started/);
        });

    });

    describe('::assertExists', () => {

        it('Should throw when path doesn\'t exist', () => {
            let t = new Tempper();
            t.addFile('file.txt', './file.txt');
            assert.throws( () => t.assertExists('file-WRONG.txt') );
            assert.doesNotThrow( () => t.assertExists('file.txt') );
            t.clear();
        });

    });

    describe('::assertMissing', () => {

        it('Should throw when path exists', () => {
            let t = new Tempper();
            t.addFile('file.txt', './file.txt');
            assert.doesNotThrow( () => t.assertMissing('file-WRONG.txt') );
            assert.throws( () => t.assertMissing('file.txt') );
            t.clear();
        });

    });

    describe('::mkdir', () => {

        it('Should create an empty dir inside the tmp dir', () => {
            let t = new Tempper();
            t.mkdir('my-test');
            t.assertExists('my-test');
            t.clear();
        });

        it('Should create an empty dir recursively', () => {
            let t = new Tempper();
            t.mkdir('my-test/my-super-test');
            t.assertExists('my-test/my-super-test');
            t.clear();
        });

    });

    describe('::rm', () => {

        it('Should remove an existing diretory', () => {
            let t = new Tempper();
            t.mkdir('my-test/foo');
            t.rm('my-test')
            t.assertMissing('my-test/foo');
            t.clear();
        });

        it('Should remove an existing file', () => {
            let t = new Tempper();
            t.addFile('file.txt', './file.txt');
            t.rm('file.txt')
            t.assertMissing('file.txt');
            t.clear();
        });

    });

    describe('::refresh', () => {

        it('Should return you a new clean tmp dir', () => {
            let t = new Tempper();
            t.addFile('file.txt', './file.txt');

            t.refresh();
            assert(!fs.existsSync(t.dir + '/file.txt'));
            t.clear();
        });

    });

});
