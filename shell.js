console.log("SHELL by: mmppppss");
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
