
function parseLexicon(arg){
    if(arg == '--')
        return { type: '--' };

    if(arg.charAt(0) == '-')
        return { type: '-a', data: arg.replace(/^\-+/, '') };

    return { type: 'aa', data: arg };
}

function analyzeToken(output, token, pos){

    let justHadOptOrFlag = output.lastType in { opt: true, flag: true };

    // CHANGE PHASE
    if(output.phase < 2 && token.type == '--'){
        output.phase++;
        return output;
    }
    else if(justHadOptOrFlag && token.type == 'aa')
        output.phase++;
    else if(token.type == 'aa' && (justHadOptOrFlag || pos == 0))
        output.phase++;


    if(output.phase == 2){
        output.lastType = 'arg';
        output.arguments.push(token.data);
    }
    else if(output.phase == 1 && (justHadOptOrFlag || pos == 0) && token.type == 'aa'){

        if(!(token.data in output.commands)){
            output.phase = 2;
            token.type = 'arg';
            output.arguments.push(token.data);
        }
        else{
            output.command = token.data;
            output.options = output.commands[token.data];
        }

        output.lastType = 'command';
    }
    else if(token.type == '-a'){
        if(!(token.data in output.options))
            throw new Error('Unknown option: ' + token.data);

        output.lastType = !output.options[token.data][2] ? 'flag' : 'opty';
        output.result[token.data] = output.lastType == 'opty' ? output.options[token.data][3] : true;
        output.lastKey = token.data;
    }
    else if(token.type == 'aa' && output.lastType == 'opty'){
        output.result[output.lastKey] = token.data;
        output.lastType = 'opt';
    }

    return output;
}

function buildComps(context){

    console.log(context);

    let result = {};

    //for(let o in context.options){



    //    result[o]
    //}


}

module.exports = class CLI {

    constructor(options, commands){
        this.commands = commands || {};
        this.global = options;
    }

    setCommands(data){
        this.commands = data;
    }

    execute(input){
        let args = (input || process.argv).slice(1);

        let tokens = args.map(parseLexicon);

        let context = {
            commands: this.commands,
            options: this.global,
            phase: 0,
            arguments: [],
            result: {}
        };

        tokens.reduce(analyzeToken, context);

        return buildComps(context);
    }

}
