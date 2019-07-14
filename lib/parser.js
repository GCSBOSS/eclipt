
module.exports = class CLIInputData{

    constructor(cli, args){

        this.cli = cli;
        this.output = { args: [], data: {} };
        this.context = this.cli;

        this.args = args;

        this.allParsed = false;
        while(!this.allParsed)
            this.parseNext();

        if(this.type == 'key')
            throw new Error('Missing value for option: ' + this.lastKey);

        return this.output;
    }

    flushArgs(){
        this.output.args = this.args;
        this.allParsed = true;
    }

    parseNext(){

        let arg = this.args.shift();
        if(arg == '--')
            return this.flushArgs();

        let lastType = this.type;
        this.type = arg.charAt(0) == '-' ? 'key' : 'val';
        let curlast = this.type + (lastType || 'opt');

        let scenarios = {
            keykey: () => { throw new Error('Missing value for option: ' + this.lastKey) },
            valopt: () => this.putCommand(arg),
            valkey: () => this.putValue(arg),
            keyopt: () => this.putOption(arg),
            keyval: () => this.putOption(arg)
        }

        scenarios[curlast]();

        this.allParsed = this.allParsed || this.args.length == 0;
    }

    putOption(arg){
        let c2 = arg.charAt(1);
        if(arg.length == 2)
            this.putKey(this.context.shorthands[c2] || c2);
        else if(c2 == '-')
            this.putKey(arg.substr(2));
        else
            arg.substr(1).split('').forEach(c => this.putOption('-' + c));
    }

    putFlag(arg){
        this.output.data[arg] = true;
        this.type = 'opt';
    }

    putKey(arg){
        if(!(arg in this.context.options))
            throw new Error('Unknown option: ' + arg);

        if(!this.context.options[arg][2])
            return this.putFlag(arg);

        this.output.data[arg] = this.context.options[arg][3];
        this.lastKey = arg;
    }

    putCommand(arg){
        if(arg in this.cli.commands){
            this.output.cmd = arg;
            this.context = this.cli.commands[arg];
            return true;
        }

        if(this.cli.settings.requireCommand)
            throw new Error('Unknown command: ' + arg);

        this.args.unshift(arg);
        this.flushArgs();
    }

    putValue(arg){
        this.output.data[this.lastKey] = arg;
        this.type = 'opt';
    }

}
