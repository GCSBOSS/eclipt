
module.exports = class CLIInputData{

    constructor(cli, args){

        this.phase = 0;
        this.cli = cli;
        this.output = {
            args: [],
            data: {}
        };
        this.context = this.cli;

        this.first = true;
        this.args = args;

        let arg;
        while(arg = args.shift()){
            let lastType = this.type;

            if(arg == '--' || this.phase > 1){
                this.output.args = args;
                break;
            }

            this.type = arg.charAt(0) == '-' ? 'key' : 'val';

            // Check for Command
            if(this.type == 'val' && this.phase == 0 && (this.first || lastType == 'opt')){
                if(!this.putCommand(arg))
                    break;
            }

            // Check for missing value.
            else if(lastType == 'key' && this.type != 'val')
                throw new Error('Missing value for option: ' + this.lastKey);

            // Check for key's value.
            else if(this.type == 'val' && lastType == 'key')
                this.putValue(arg);

            // If came here it's definitely a KEY
            else
                this.putOption(arg);

            this.first = false;
        }

        if(this.type == 'key')
            throw new Error('Missing value for option: ' + this.lastKey);
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
            this.output.command = arg;
            this.context = this.cli.commands[arg];
            return true;
        }

        if(this.cli.settings.requireCommand)
            throw new Error('Unknown command: ' + arg);

        this.output.args = [ arg, ...this.args ];
        return false;
    }

    putValue(arg){
        this.output.data[this.lastKey] = arg;
        this.type = 'opt';
    }

}
