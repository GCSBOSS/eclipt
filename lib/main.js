const fs = require('fs');
const path = require('path');
const getHelp = require('./help');
const CLIInputData = require('./parser');

/*                                                                            o\
    Generate dictionary of shorthand options (-a) and it's long counterpart.
\o                                                                            */
function extractShorthands(options){
    let shorthands = {};
    for(let name in options)
        if(options[name][0] !== false)
            shorthands[options[name][0]] = name;
    return shorthands;
}

/*                                                  o\
    Add automatic option functionailty to CLI def.
\o                                                  */
function addDefaultOptions(context){
    context['help'] = ['h', 'Displays this help output'];

    if(this.getVersion)
        context['version'] = ['v', 'Displays the installed version'];
}

/*                                                                            o\
    Instances of this class repsesent a CLI definition which includes the
    available options and commands and it's descriptions.
\o                                                                            */
module.exports = class CLI {

    constructor(name, options, settings){
        this.settings = settings || {};
        this.settings.name = name;
        this.settings.summary = this.settings.summary || '';
        this.commands = {};
        this.options = options || {};

        this.getVersion = typeof this.settings.getVersion == 'function'
            ? this.settings.getVersion : false;

        addDefaultOptions.bind(this)(this.options);
        this.shorthands = extractShorthands(this.options);

        this.onOutput = this.settings.onOutput || console.log;
    }

    /*                                                        o\
        Parse a given args aray based on the CLI definition.
    \o                                                        */
    execute(args){
        args = (args || process.argv).slice(1);

        let input = new CLIInputData(this, args);
        let cmd = this.commands[input.cmd];

        if(input.optCount == 1 && input.data.help)
            this.onOutput(getHelp(this, input.cmd));

        else if(input.optCount == 1 && this.getVersion && !cmd && input.data.version)
            this.onOutput(this.getVersion());

        else if(cmd && typeof cmd.callback == 'function')
            cmd.callback(input);

        return input;
    }

    /*                                        o\
        Add a command definition to the CLI.
    \o                                        */
    setCommand(name, command){
        command = command || {};
        command.options = command.options || {};
        addDefaultOptions.bind(this)(command.options);
        this.commands[name] = command;
        this.commands[name].shorthands = extractShorthands(command.options);
    }

    /*                                                                o\
        Require all js modules in a folder and add them as commands.
    \o                                                                */
    requireCommands(dir){
        dir = path.resolve(dir);
        let files = fs.readdirSync(dir);
        for(let f of files){
            let name = f.replace(/\..+$/, '');
            this.setCommand(name, require(dir + '/' + name));
        }
    }

}
