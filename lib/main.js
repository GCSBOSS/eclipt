
function parseLexicon(arg){
    if(arg == '--')
        return { type: '--' };

    if(arg.charAt(0) == '-')
        return { type: '-a', name: arg.replace(/^\-+/, '') };

    return { type: 'aa', data: arg };
}

function analyzeTokenOld(output, token, pos){

    let lastOutIndex = output.comps.length - 1;
    let prevOut = output.comps[lastOutIndex];
    let context = output.options;

    let justHadOptOrFlag = prevOut && (prevOut.type == 'opt' || prevOut.type == 'flag');
    let justHadOpty = prevOut && prevOut.type == 'opty';

    // CHANGE PHASE
    if(output.phase < 2 && token.type == '--')
        output.phase++;
    else if(justHadOptOrFlag && token.type == 'aa')
        output.phase++;
    else if(token.type == 'aa' && (justHadOptOrFlag || pos == 0))
        output.phase++;


    if(output.phase == 2){
        token.type = 'arg';
        token.data = token.data || token.name || '--';
        output.comps.push(token);
    }
    else if(output.phase == 1 && (justHadOptOrFlag || pos == 0) && token.type == 'aa'){
        token.type = 'command';
        token.name = token.data;
        delete token.data;

        if(!(token.name in output.commands)){
            output.phase = 2;
            token.type = 'arg';
            token.data = token.name;
            delete token.name;
        }
        else{
            output.hasCommand = true;
            output.options = output.commands[token.name];
        }

        output.comps.push(token);
    }
    else if(token.type == '-a'){
        if(!(token.name in context))
            throw new Error('Unknown option: ' + token.name);
        token.type = !output.options[token.name][2] ? 'flag' : 'opty';
        output.comps.push(token);
    }
    else if(token.type == 'aa' && justHadOpty){
        output.comps[lastOutIndex].type = 'opt';
        output.comps[lastOutIndex].value = token.data;
    }

    return output;
}

function analyzeToken(output, token, pos){

    let lastOutIndex = output.comps.length - 1;
    let context = output.options;

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
        token.type = 'arg';
        token.data = token.data || token.name || 'undefined';
        output.comps.push(token);
        output.lastType = 'arg';
        output.arguments.push(token.data);
    }
    else if(output.phase == 1 && (justHadOptOrFlag || pos == 0) && token.type == 'aa'){
        token.type = 'command';
        token.name = token.data;
        delete token.data;

        if(!(token.name in output.commands)){
            output.phase = 2;
            token.type = 'arg';
            token.data = token.name;
            delete token.name;
            output.arguments.push(token.data);
        }
        else{
            output.command = token.name;
            output.options = output.commands[token.name];
        }

        output.lastType = 'command';
        output.comps.push(token);
    }
    else if(token.type == '-a'){
        if(!(token.name in context))
            throw new Error('Unknown option: ' + token.name);
        token.type = !output.options[token.name][2] ? 'flag' : 'opty';
        output.result[token.name] = token.type == 'opty' ? output.options[token.name][3] : true;

        output.lastType = token.type;
        output.comps.push(token);
    }
    else if(token.type == 'aa' && output.lastType == 'opty'){
        let name = output.comps[lastOutIndex].name;
        output.comps[lastOutIndex].type = 'opt';
        output.comps[lastOutIndex].value = token.data;
        output.result[name] = token.data;
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
            comps: [],
            arguments: [],
            result: {}
        };
        let { comps } = tokens.reduce(analyzeToken, context);

        return buildComps(context);
    }

    setCommand(name, command){
        this.commands[name] = command;
    }

    loadCommands(dir){
        let files = fs.readdirSync(dir);
        for(let f of files)
            commands[f.replace(/\..+$/)] = require(dir + '/' + f);
    }

}
