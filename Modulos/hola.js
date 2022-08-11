
exports.menu = `que tal`

exports.time = `Tiempo activo:`+(process.uptime()/60)/60 + `Horas`

exports.shell = 
console.log("SHELL and NODE by: mmppppss");
console.log("CREDOTOS: Lucky-Vc")

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
        var query=d.toString();
                var cmd=query.slice(1);
        if(query[0]=='>'){
                a=JSON.stringify(eval(cmd), null, '\t')
                console.log(a);
        }
        if(query[0]=='$'){
                exec(cmd.trim(), (err, stdout, stderr) => {
                        if (err) {
                                console.error(`error: ${err}`);
                                return;
                        }
                console.log(`[out] ${stdout}`);
                console.log(`${stderr}`);
                });
        }
})