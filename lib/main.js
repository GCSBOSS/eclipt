
const CLIInputData = require('./parser');
const getHelp = require('./help');

function extractShorthands(options){
    let shorthands = {};
    for(let name in options)
        if(options[name][0] !== false)
            shorthands[options[name][0]] = name;
    return shorthands;
}

function addDefaultOptions(context){
    context['help'] = ['h', 'Displays this help output'];
    context['version'] = ['v', 'Displays the installed version'];
}

module.exports = class CLI {

    constructor(name, options, settings){
        this.settings = settings || {};
        this.settings.name = name;
        this.settings.summary = this.settings.summary || '';
        this.commands = {};
        this.options = options || {};
        addDefaultOptions(this.options);
        this.shorthands = extractShorthands(this.options);
    }

    execute(args){
        args = (args || process.argv).slice(1);

        let input = new CLIInputData(this, args);

        if(Object.values(input.output.data).length == 1 && input.output.data.help)
            console.log(getHelp(this, input.cmd));

        if(input.cmd)
            if(typeof this.commands[input.cmd].callback == 'function')
                this.commands[input.cmd].callback(input);

        return input.output;
    }

    setCommand(name, command){
        this.commands[name] = command;
        this.commands[name].options = this.commands[name].options || {};
        addDefaultOptions(this.commands[name].options);
        this.commands[name].shorthands = extractShorthands(command.options);
    }

    requireCommands(dir){
        let files = fs.readdirSync(dir);
        for(let f of files)
            this.setCommand(f.replace(/\..+$/), require(dir + '/' + f));
    }

}
