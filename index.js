/* -- Modulos -- */
const fs = require('fs')
const P = require('pino')
const https = require('https');
const qrcode = require('qrcode-terminal')
const exec = require('child_process').exec
const util = require('util')
const ytdl = require('ytdl-core')
const { MAX_TOKEN, OPENAI_KEY } = require('./chatGPT.json');
const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType
} = require('@adiwajshing/baileys')
const { state, saveState } = useSingleFileAuthState('./user/session.json') //sesion actual
const conn = makeWASocket({
    logger: P({ level: 'silent' }),
	printQRInTerminal: true,
	auth: state,
})
/* -- Variables -- */

const config=JSON.parse(fs.readFileSync("user/config.json")) //configuraciones
var prefix = config.prefix //prefix de comandos
const ownerNumber = config.owner.map(k => k.number) //administradores del bot
const mainGroup=config.mainGroup;
const languajes=JSON.parse(fs.readFileSync("user/strings.json"));
const lang = config.lang //lenguaje
var strings =lang == "es"? languajes.es : lang == "en"? languajes.en : "";
const users=JSON.parse(fs.readFileSync("database/users.json")); //usuarios registrados
const noreg=[];
let reg=config.reg
let disable=config.disable;
/* -- Colores -- */
let wht='\033[00m'
let blk='\033[30m'
let red='\033[31m'
let grn='\033[32m'
let ylw='\033[33m'
let blu='\033[34m'
let pnk='\033[35m'

/* -- Conexion -- */

const connectToWA = () => {
	conn.ev.on('connection.update', (update) => {
    	const { connection, lastDisconnect } = update
	    if (connection === 'close') {
    		if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
		    	connectToWA()
	    	}
    	} else if (connection === 'open') {
		    console.log(`${red} ${strings.botConnect} ${wht}`)
            conn.sendMessage(mainGroup,{text:strings.botConnect});
	    }
	});
	
	conn.ev.on('creds.update', saveState)	
}

 
conn.ev.on('messages.upsert', async(msg) => {
	try {
		msg = msg.messages[0]
		if (!msg.message) return
			
		msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
		if (msg.key && msg.key.remoteJid === 'status@broadcast') console.log("status"+JSON.stringify(msg))

		const botNumber = conn.user.id.split(':')[0]
		const type = getContentType(msg.message)
		const content = JSON.stringify(msg.message)
		const from = msg.key.remoteJid
		const quoted = type == 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
		const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : ''	
	var isCmd= body.startsWith(prefix)
       // const isCmd = body.startsWith("@"+botNumber)
        var isCmd2 = body.includes(botNumber); 
	//	const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() ||
        
      const command= isCmd2 ? body.replace("@"+botNumber+'','').replace(' ','').toLowerCase(): isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        isCmd= isCmd2 || isCmd ? true : false;
		const args = body.replace("@"+botNumber,'').trim().split(/ +/)
		const q = args.join(' ')
		const isGroup = from.endsWith('@g.us')
		const sender = msg.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (msg.key.participant || msg.key.remoteJid)
		const senderNumber = sender.split('@')[0]
		const senderName = msg.pushName || 'Sin Nombre'	
		const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const reply = async(txt) => {
            await conn.sendMessage(from, { text: txt }, { quoted: msg })
        }
        const react=(emoji)=>{
           conn.sendMessage(from, {react:{text:emoji, key:msg.key}})
}
        if(isCmd){
            if(disable.includes(command)){
                reply(strings.commandDisable)
                return
            }
            react("🦔")
        }
		if(isGroup){
            if(!users.includes(from)){
				reply(strings.newGroup);
				users.push(from);
				writeJson('database/users.json', users)
            }
			const group = await conn.groupMetadata(from);
            const participants =  JSON.constructor(group.participants);
			admins=[]
			for(participant of participants){
				if(participant.admin=='admin' || participant.admin=='superadmin' ){
					admins=admins.concat(participant.id);
				}
			}
        }
		for(i of noreg){
			if(sender==i.sender && body == i.code){
				reply(strings.regCompleted);
				users.push(sender);
				writeJson('database/users.json', users)
            }
		}
		if(reg && isCmd && !users.includes(sender)&& !noreg.includes(sender)){
            reply(strings.noRegister)
			noRegUser={sender : sender,code : genRandom(4)}
            noreg.push(sender)
            noreg.push(noRegUser)
			conn.sendMessage(sender,{text:strings.regCode+ noRegUser.code+"*"})
            return
        } else if(isCmd && noreg.includes(sender)&&!users.includes(sender)){
			reply(strings.noRegister)
	        return
        }

console.log(`${red}MSG:${grn}[${sender} | ${senderName}]:${ylw} ${body}`)
/* -- Comandos -- */

const commands = {
      hola: () => reply('Hola '+senderName),
      adios: () => reply('Adios '+senderName),
    restart:() =>{
        if(!isOwner){ return }
        eval(process.exit())
    },
    setlang: ()=> {
        console.log(strings.setlang)
        if(args[1]=="es"){
            strings=languajes.es
            config.lang="es";
        }
        if(args[1]=="en"){
            strings=languajes.en;
            config.lang="en";
        }
        reply(strings.setlang)
        writeJson('user/config.json', config)
    },
    setprefix:()=>{
        reply(strings.setprefix+args[1])
        prefix=args[1];
        config.prefix=args[1];
        writeJson('user/config.json', config)
    },
    ban:()=>{
        if(!admins.includes(sender)){
            reply(strings.onlyAdm)
            return
        }
		victim=msg.message.extendedTextMessage.contextInfo.participant;
    	if(victim!=''){
	    	conn.groupParticipantsUpdate(from,[victim],'remove')
		    reply('Ban '+victim.split('@')[0])
    	} else if(body.length>4){
	    	mention=body.slice(6)
			victim=mention+'@s.whatsapp.net'
			conn.groupParticipantsUpdate(from,[victim],'remove')
    		reply('Ban: '+mention)
		} else {
			reply(strings.tagUser)
		}
    },
    add:()=>{
	    if(!isOwner) return 
        mention=body.slice(5)
	    var victim=mention+'@s.whatsapp.net'
    	conn.groupParticipantsUpdate(from,[victim],'add')
	    reply('Add: @'+mention)
    },
    demote:()=>{
    	if(!isOwner)return 
	    mention=body.slice(9)
    	var victim=mention+'@s.whatsapp.net'
    	conn.groupParticipantsUpdate(from,[victim],'demote')
	    reply('Demote: @'+mention)
    },
    promote:async()=>{
    	if(!isOwner)return 
	    mention=body.slice(10)
    	var victim=mention+'@s.whatsapp.net'
	    await conn.groupParticipantsUpdate(from,[victim],'promote')
    	reply('Promote: @'+mention)
    },
    info:()=>{
    	time=Math.round(process.uptime())
	    format=""
    	if(time>60 && time<3600){
		    time=Math.round(time/60)
	    	format=" Min"
    	} else{
	    	format=" Seg"
    	}
	    info=strings.time+ time+format +"\n"+strings.memory+Math.round((process.memoryUsage().rss)/1024/1024) + " mb\nNode "+process.version;
    	reply(info);
    },
    mp3:()=>{
        ytmp3(args[1],from,msg)
    },
    mp4:()=>{
        ytmp4(args[1],from,msg)
    },
    arcsearch:()=>{
        let jsonData ={};
        let textData="";
        const search = body
        const url = `https://archive.org/advancedsearch.php?q=${search}&fl%5B%5D=description&fl%5B%5D=identifier&fl%5B%5D=title&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=5&page=1&output=json&callback=callback&save=yes#raw`;
        reply(url)
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
            conn.sendMessage(from,{ text:"==="+textData})
            reply(textData)
        });
        }).on("error", (err) => {
            reply("Error: " + err.message);
            jsonData=err.message
        });
    }
}

if(isCmd){
    try{
        commands[command]();
    }catch(e){

        if (!args[1]) return reply(`*Ingrese una petición o una orden para usar la funcion ChatGPT*`)           

        /*try {
        const BotIA = await openai.createCompletion({ model: "text-davinci-003", prompt: body.replace(command, ''), temperature: 0, max_tokens: MAX_TOKEN, stop: ["IA:", "Human:"], top_p: 1, frequency_penalty: 0.2, presence_penalty: 0, })
        reply(BotIA.data.choices[0].text.trim())
        } catch (qe) {
         */
         try {
            try{
                pet=msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation + body.replaceAll(" ","%20").replace(prefix,"")
            } catch {
                pet=body.replaceAll(" ","%20").replace(prefix,"")
            }
         let tioress = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=BrunoSobrino&text=${pet}&user=${OPENAI_KEY}`)
         let hasill = await tioress.json()
         reply(`${hasill.result}`.trim())   
         } catch (qqe) {        
         reply("*Error en el servidor , no se obtuvieron respuestas de la IA...*\n\n*—◉ Error:*\n" + qqe)  
         } 
        console.log(command+" not found command")
    }
}
switch (command) {
case 'a':
    if(admins.includes(sender)){
        reply('es admin')
	}
break
case 'sender':
    reply(JSON.stringify(eval(`(sender)`),null,'\t'));
break
}//fin cases

if(body.startsWith("*🧮")){
	num=body.split('_')[1].split('÷')
	res=num[0]/num[1]
	bash(`termux-clipboard-set " ${res}"`)
    conn.sendMessage("120363025097260561@g.us",{text:""+res})
    conn.sendMessage(from,{text:"-claim"})
}	
if(body.startsWith("▢")){
	num=body.split('*')[1].split('÷')
	res=num[0]/num[1]
//	bash(`termux-clipboard-set " ${res}"`)
    reply(""+res)
}	
if(body.startsWith('$')){
	if(isOwner){
        cmd = body.slice(2);
		exec(cmd, (err, stdout) => {
			if (err) return reply(`[#] ${err}`);
			if (stdout) {
				reply(stdout);
			}
		});
	}else{
		reply(strings.onlyOwn)
    }
}
if(body.startsWith('<') && isOwner){
    cmd = body.slice(2)
    try {
        return reply(JSON.stringify(eval(`${cmd}`),null,'\t'))
    } catch (e) {
        reply(""+e)
    }
}
if(body.startsWith('>')){
	if(isOwner){
        cmd = body.slice(2);
		try{
			a=await JSON.stringify(eval(cmd),null,'\t')
			reply(a)
		} catch(e){
			reply('[#] '+e)
            console.log(e)
		}

	}else{                                                              reply(strings.onlyOwn)
	
    }
}
//errror
} catch (e) {
			const isError = String(e)
			
			console.log(isError)
		}
})


////////

const sup4Console = () => {
    /* Whatsapp for console */
	console.log(ylw+` -- `+grn+`SHELL`+ylw+` and`+grn+` NODE`+ylw+ ` by: `+red+`mmppppss`+ylw+` -- ${wht}`);
	var stdin = process.openStdin();
	stdin.addListener("data", function(d) {
        var query=d.toString();
        var cmd=query.slice(1);
		if(query[0]=='>'){
			try{
				a=JSON.stringify(eval(cmd), null, '\t')
				console.log(a);
			} catch(e){
				console.log('[#] '+e)
			}
		} else if(query[0]=='$'){
			exec(cmd.trim(), (err, stdout, stderr) => {
			if (err) {
				console.error(`[#]  ${err}`);
				return;
			}
			console.log(grn+`[>>>] ${wht} \n ${stdout}`);
			console.log(`${red} ${stderr}${wht}`);
		    });
		}
	})
}
const bash = (cmd) => {
	exec(cmd, (err, stdout) => {
    	if (err) {
	        console.error(`[#] ${err}`);
            return err;
        } else{
            return stdout
        } 
    });
}


function genRandom(num) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let result = "";
	for (let i = 0; i < num; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
    return result;
}
function writeJson(file, data){
    try{
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return 1;
    } catch(e){
        return e;
    }
}
function banUser(user){

}
function joinGroup(link){
    var code=link.split("/")[3];
    conn.groupAcceptInvite(code);
}
function broadcast(type, txt){
    for(id of users){
        if(type=="groups" && id.endsWith("@g.us")){
            conn.sendMessage(id,{text:txt})
        }
        if(type=="all"){
            conn.sendMessage(id,{text:txt})
        }
    }
}
const ytmp3 = async (Link, fromId, quotedMsg) => {
    try {
        let info = await ytdl.getInfo(Link)
        info=info.player_response.videoDetails
        info=`_${info.title}_\n\nby:_${info.author}_ \n\n\n${info.shortDescription}` 
        let mp3File = './download/'+genRandom(4)+'ytdl.mp3'
        console.log('Downloading audio')
        ytdl(Link, { filter: 'audioonly' })
            .pipe(fs.createWriteStream(mp3File))
            .on('finish', async () => {
                await conn.sendMessage(fromId, { audio: fs.readFileSync(mp3File), mimetype: 'audio/mpeg', caption:info }, { quoted: quotedMsg })
                fs.unlinkSync(mp3File)
            })
    } catch (err) {
        console.log(`${err}`)
        await conn.sendMessage(fromId, { text:"Error :("}, { quoted: quotedMsg })
    }
}

const ytmp4 = async (Link, fromId, quotedMsg) => {
    try {
        let info = await ytdl.getInfo(Link)
        info=info.player_response.videoDetails
        info=`_${info.title}_\n\nby:_${info.author}_ \n\n\n${info.shortDescription}` 
        let mp4File = './download/'+ genRandom(4)+'ytdl.mp4'
        console.log('Downloading audio')
        ytdl(Link)
            .pipe(fs.createWriteStream(mp4File))
            .on('finish', async () => {
                await conn.sendMessage(fromId, { video: fs.readFileSync(mp4File), gifPlayback: false, mimetype:'video/mp4', caption:info}, { quoted: quotedMsg })
                fs.unlinkSync(mp4File)
            })
    } catch (err) {
        console.log(`${err}`)
        await conn.sendMessage(fromId, { text:"Error :("}, { quoted: quotedMsg })
    }
}


connectToWA()
sup4Console()
