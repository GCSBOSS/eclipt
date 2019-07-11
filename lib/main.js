
function parseLexicon(arg){
    if(arg == '--')
        return { type: '--' };

    if(arg.charAt(0) == '-')
        return { type: '-a', data: arg.replace(/^\-+/, '') };

    return { type: 'aa', data: arg };
}

function buildData(tokens){

    let phase = 0;
    let lastType = null;
    let lastKey = null;
    let arguments = [];
    let data = {};
    let command = null;
    let context = this.options;
    let shorthands = this.shorthands

    for(let i in tokens){
        let token = tokens[i];

        // console.log(token);
        // console.log(lastType);

        let justHadOptyOrFirst = lastType in { opt: true, flag: true } || i == 0;
        let last = i == tokens.length - 1;

        // CHANGE PHASE
        if(phase < 2 && token.type == '--'){
            phase++;
            continue;
        }
        else if(token.type == 'aa' && justHadOptyOrFirst)
            phase++;

        if(phase == 2){
            lastType = 'arg';
            arguments.push(token.data);
        }
        else if(phase == 1 && justHadOptyOrFirst && token.type == 'aa'){

            if(!(token.data in this.commands)){
                phase = 2;
                token.type = 'arg';
                arguments.push(token.data);
            }
            else{
                command = token.data;
                context = this.commands[token.data].options;
                shorthands = this.commands[token.data].shorthands;
            }

            lastType = 'command';
        }
        else if(token.type == '-a'){
            if(token.data in shorthands)
                token.data = shorthands[token.data];

            if(!(token.data in context))
                throw new Error('Unknown option: ' + token.data);

            lastType = !context[token.data][2] ? 'flag' : 'opty';
            let def = context[token.data][3];

            data[token.data] = lastType == 'opty' ? def : true;

            if(lastType == 'opty' && !def && (last || tokens[i + 1].type !== 'aa'))
                throw new Error('Missing required value for option: ' + token.data);

            lastKey = token.data;
        }
        else if(token.type == 'aa' && lastType == 'opty'){
            data[lastKey] = token.data;
            lastType = 'opt';
        }
    }

    return { args: arguments, data: data, cmd: command };
}

function getOptionsHelp(options){
    let output = '\r\nOptions:\r\n';
    let optArr = [];
    let nameMaxSize = 0;

    for(let name in options){
        let opt = options[name];
        let text = '--' + name + ' ' + (opt[2] ? '<' + opt[2] + '>' : '');
        nameMaxSize = Math.max(text.length, nameMaxSize);
        let short = opt[0] ? '-' + opt[0] + ',' : '   ';
        optArr.push({ summary: opt[1], text: text, short: short });
    }

    let indent = ' '.repeat(10 + nameMaxSize);
    for(let opt of optArr){
        let space = ' '.repeat(nameMaxSize - opt.text.length + 4);
        output += '  ' + opt.short + ' ' + opt.text + space + opt.summary
            .replace(/\s+/g, ' ').match(/.{1,64}/g).join('\r\n' + indent) + '\r\n';
    }

    return output;
}

function getCommandsHelp(commands){

    let output = '\r\nCommands:\r\n';

    let cmdArr = [];
    let nameMaxSize = 0;
    for(let name in commands){
        nameMaxSize = Math.max(name.length, nameMaxSize);
        cmdArr.push({ summary: commands[name].summary, name: name });
    }

    let indent = ' '.repeat(6 + nameMaxSize);
    for(let cmd of cmdArr){
        let space = ' '.repeat(nameMaxSize - cmd.name.length + 4);
        output += '  ' + cmd.name + space + cmd.summary.replace(/\s+/g, ' ')
            .match(/.{1,78}/g).join('\r\n' + indent) + '\r\n';
    }

    return output;
}

function getGlobalHelp(){
    let hasOpts = Object.keys(this.options).length > 0;
    let hasCmds = Object.keys(this.commands).length > 0;

    let output = `\r\nUsage: ${this.settings.name} `;

    if(hasOpts)
        output += '[OPTIONS] ';

    if(hasCmds)
        output += this.settings.requireCommand ? 'COMMAND ' : '[COMMAND] ';

    output += this.settings.noArgs ? '\r\n' : '[--] [ARGS]\r\n';

    if(this.settings.summary)
        output += `\r\n${this.settings.summary}\r\n`;

    if(hasOpts)
        output += getOptionsHelp(this.options);

    if(hasCmds)
        output += getCommandsHelp(this.commands) +
            `\r\nRun \'${this.settings.name} COMMAND --help\' for more ` +
            'information on a command.\r\n';

    return output;
}

function addDefaultOptions(context){
    context['help'] = ['h', 'Displays this help output'];
    context['version'] = ['v', 'Displays the installed version'];
}

function extractShorthands(options){
    let shorthands = {};
    for(let name in options)
        if(options[name][0] !== false)
            shorthands[options[name][0]] = name;
    return shorthands;
}

module.exports = class CLI {

    constructor(name, options, settings){
        this.settings = settings || {};
        this.settings.name = name;
        this.settings.summary = this.settings.summary || '';
        this.commands = {};
        this.options = options;
        addDefaultOptions(this.options);
        this.shorthands = extractShorthands(this.options);
    }

    execute(input){
        let args = (input || process.argv).slice(1);

        let tokens = args.map(parseLexicon);
        let data = buildData.bind(this)(tokens);
        if(typeof this.commands[data.cmd].callback == 'function')
            this.commands[data.cmd].callback(data);

        return data;
    }

    displayHelp(){

        let output = getGlobalHelp.bind(this)();
        console.log(output);

    }

    displayVersion(){

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
