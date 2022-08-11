
exports.menu = `que tal`

exports.time = `Tiempo activo:`+(process.uptime()/60)/60 + `Horas`

exports.shell = 
console.log("SHELL by: mmppppss");
console.log("Credito: Lucky-Cv");
const exec=require('child_process').exec;

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    exec(d.toString().trim(), (err, stdout, stderr) => {
  if (err) {
    console.error(`error: ${err}`);
    return;
  }

  console.log(`[out] ${stdout}`);
  console.log(`${stderr}`);
});



}); 
