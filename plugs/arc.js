const https = require('https');

let jsonData ={};
let textData="";
function archiveSearch(se){
const search = se
const url = `https://archive.org/advancedsearch.php?q=${search}&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=title&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=5&page=1&output=json&callback=callback&save=yes#raw`;

https.get(url, (response) => {
  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    text=""
    jsonData=JSON.parse(data.split('"docs":')[1].replace("}})",""))
    //console.log(jsonData)
    j=0;
    for(i of jsonData){
      textData+=("```[#] "+j+"```\n*Nombre:* "+i.title+"\n*Descripcion:* "+i.description+"\n")
        j++;
    }

  });
}).on("error", (err) => {
  return("Error: " + err.message);
    jsonData=err.message
});
}
function archiveDown(link){
    url=`https://archive.org/details/${link}&output=json`
https.get(url, (response) => {
  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    text=""
    jsonData=JSON.parse(data)
    name=JSON.stringify(jsonData.files).split(":")[0].replaceAll('"','').replace('{','')
    downLink=jsonData.server+jsonData.dir+name
    type=name.split(".")[1]
    jsonData={
        archName:name,
        archUrl:downLink,
        archType:type
    }
  });
}).on("error", (err) => {
  return("Error: " + err.message);
    jsonData=err.message
});
}
function getJson(){
    return jsonData
}
function getText(){
    return textData
}
module.exports={
    archiveSearch, 
    archiveDown,   
    getJson,
    getText   
}
