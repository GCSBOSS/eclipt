
/*                                                                            o\
    Instances of this class represent the output data of processing a given
    arguments array for a given CLI definition.
\o                                                                            */
module.exports = class CLIInputData{

    constructor(cli, args){

        this.cli = cli;
        this.output = { args: [], data: {}, optCount: 0 };
        this.context = this.cli;

        this.applyDefaults();

        let preffix = '';
        while(args.length > 0 && preffix.indexOf(this.cli.settings.name) == -1)
            preffix = args.shift();

        this.args = args;
        if(this.args.length == 0)
            return this.output;

        this.allParsed = false;
        while(!this.allParsed)
            this.parseNext();

        // Is last token was an option and didn't get it's value.
        if(this.type == 'key')
            throw new Error('Missing value for option: ' + this.lastKey);

        return this.output;
    }

    /*                                                                  o\
        Apply the defined defaults for options in the current context.
    \o                                                                  */
    applyDefaults(){
        for(let name in this.context.options){
            let params = this.context.options[name];

            // If an arg default exists
            if(params[3])
                this.output.data[name] = params[3];

            // If the arg is a flag
            else if(!params[2])
                this.output.data[name] = false;
        }
    }

    /*                                                            o\
        Add all the remaining args as-is to the argument output.
    \o                                                            */
    flushArgs(){
        this.output.args = this.args;
        this.allParsed = true;
    }

    /*                                            o\
        Parse the first token in the args queue.
    \o                                            */
    parseNext(){

        let arg = this.args.shift();

        if(arg == '--')
            return this.flushArgs();

        let lastType = this.type;
        this.type = arg.charAt(0) == '-' ? 'key' : 'val';

        // String containing the current and the previous token type.
        let curlast = this.type + '-' + (lastType || 'opt');

        // Execute the proper function according to context/scenario.
        let scenarios = {
            'key-key': () => { throw new Error('Missing value for option: ' + this.lastKey) },
            'val-opt': () => this.putCommand(arg),
            'val-key': () => this.putValue(arg),
            'key-opt': () => this.putOption(arg),
            'key-val': () => this.putOption(arg)
        }
        scenarios[curlast]();

        this.allParsed = this.allParsed || this.args.length == 0;
    }

    /*                                               o\
        Parse option tokns. Eg.: --thing, -t, -abc.
    \o                                               */
    putOption(arg){
        let c2 = arg.charAt(1);
        if(arg.length == 2)
            this.putKey(this.context.shorthands[c2] || c2);

        // Parse short option.
        else if(c2 == '-')
            this.putKey(arg.substr(2));

        // Recurse to parse grouped short options: '-abc'.
        else
            arg.substr(1).split('').forEach(c => this.putOption('-' + c));
    }

    /*                                              o\
        Parse option that don't receive any value.
    \o                                              */
    putFlag(arg){
        this.output.data[arg] = true;
        this.type = 'opt';
        this.output.optCount++;
    }

    /*                                               o\
        Parse option tokns. Eg.: --thing, -t, -abc.
    \o                                               */
    putKey(arg){
        if(!(arg in this.context.options))
            throw new Error('Unknown option: ' + arg);

        if(!this.context.options[arg][2])
            return this.putFlag(arg);

        this.lastKey = arg;
    }

    /*                                                                  o\
        Parse tokens that might be commands. If command doesn't exist,
        finish the parsing by flushing all the rest as args.
    \o                                                                  */
    putCommand(arg){
        if(!this.output.cmd && arg in this.cli.commands){
            this.output.cmd = arg;
            this.cli.cmd = arg;
            this.context = this.cli.commands[arg];
            this.applyDefaults();
            return;
        }

        if(!this.output.cmd && this.cli.settings.requireCommand)
            throw new Error('Unknown command: ' + arg);

        // If command doesn't exist just parse the rest as args.
        this.args.unshift(arg);
        this.flushArgs();
    }

    /*                                        o\
        Parse values that pair with options.
    \o                                        */
    putValue(arg){
        let value = this.output.data[this.lastKey];
        if(Array.isArray(value))
            value.push(arg);
        else if(typeof value == 'string')
            this.output.data[this.lastKey] = [value, arg];
        else
            this.output.data[this.lastKey] = arg;
        this.type = 'opt';
        this.output.optCount++;
    }

}
