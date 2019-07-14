
function compose(condition, out){
    return condition ? out : '';
}

/*                                                            o\
    Assemble list of options and values for a given context.
\o                                                            */
function getOptionsHelp(options){
    let output = '\r\nOptions:\r\n';
    let optArr = [];
    let nameMaxSize = 0;

    for(let name in options){
        let opt = options[name];
        let text = '--' + name + ' ' + compose(opt[2], '<' + opt[2] + '>');
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

/*                                                                  o\
    Assemble list of commands present on the given CLI definition.
\o                                                                  */
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

/*                                            o\
    Assemble help output globally for a CLi.
\o                                            */
function getGlobalHelp(cli){
    //let hasOpts = Object.keys(cli.options).length > 0; TODO consider making help optional.
    let hasCmds = Object.keys(cli.commands).length > 0;
    let output = `\r\nUsage: ${cli.settings.name} `;

    //if(hasOpts) TODO consider making help optional.
    output += '[OPTIONS] ';

    if(hasCmds)
        output += cli.settings.requireCommand ? 'COMMAND ' : '[COMMAND] ';

    output += compose(!cli.settings.noArgs, '[--] [ARGS]') + '\r\n';

    if(cli.settings.summary)
        output += `\r\n${cli.settings.summary}\r\n`;

    //if(hasOpts) TODO consider making help optional.
    output += getOptionsHelp(cli.options);

    if(hasCmds)
        output += getCommandsHelp(cli.commands) +
            `\r\nRun \'${cli.settings.name} COMMAND --help\' for more ` +
            'information on a command.\r\n';

    return output;
}

/*                                       o\
    Assemble help output for a command.
\o                                       */
function getCommandHelp(name, cmd, cli){
    //let hasOpts = Object.keys(cmd.options).length > 0; TODO consider making help optional.
    let output = `\r\nUsage: ${cli.settings.name} ${name} `;

    //if(hasOpts) TODO consider making help optional.
    output += '[OPTIONS] ';

    output += cmd.noArgs ? '\r\n' : '[--] [ARGS]\r\n';

    if(cmd.summary)
        output += `\r\n${cmd.summary}\r\n`;

    //if(hasOpts) TODO consider making help optional.
    output += getOptionsHelp(cmd.options);

    return output + '\r\n';
}

/*                                                                            o\
    Output the help of  given @cli definition. If a @command is given, it's
    used as context.
\o                                                                            */
module.exports = function getHelp(cli, command){
    return command
        ? getCommandHelp(command, cli.commands[command], cli)
        : getGlobalHelp(cli);
}
