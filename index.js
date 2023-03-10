/* -- Modulos -- */
const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const exec = require('child_process').exec
const util = require('util')

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
const prefix = config.prefix //prefix de comandos
const ownerNumber = config.owner.map(k => k.number) //administradores del bot

const users=JSON.parse(fs.readFileSync("database/users.json")); //usuarios registrados
const noreg=[];


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
		    console.log(`${red} -- BOT CONECTADO -- ${wht}`)
	    }
	});
	
	conn.ev.on('creds.update', saveState)	
	conn.ev.on('messages.upsert', async(msg, Fg) => {
		try {
			msg = msg.messages[0]
			if (!msg.message) return
			
			msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
			if (msg.key && msg.key.remoteJid === 'status@broadcast') return
			const type = getContentType(msg.message)
			const content = JSON.stringify(msg.message)
			const from = msg.key.remoteJid
			const quoted = type == 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
			const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : ''	
			const isCmd = body.startsWith(prefix)
			const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
			const args = body.trim().split(/ +/).slice(1)
			const q = args.join(' ')
			const isGroup = from.endsWith('@g.us')
			const sender = msg.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (msg.key.participant || msg.key.remoteJid)
			const senderNumber = sender.split('@')[0]
			const botNumber = conn.user.id.split(':')[0]
			const senderName = msg.pushName || 'Sin Nombre'	
			const isMe = botNumber.includes(senderNumber)
				const isOwner = ownerNumber.includes(senderNumber) || isMe;
				if(isGroup){
								const group = await conn.groupMetadata(from);
								const members =  JSON.constructor(group.participants);
				admins=[]
				for(member of members){
						if(member.admin=='admin'){
								admins=admins.concat(member.id);
						}
				}}
			const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: msg })}
				for(i of noreg){
						if(sender==i.sender && body == i.code){
								reply("Registro completo");
								users.push(sender);
								fs.writeFileSync('database/users.json', JSON.stringify(users, null, 2))
						}
				}
				if(isCmd && !users.includes(sender)&& !noreg.includes(sender)){
						reply("No estas Registrado como usuario, se envio un codigo de verificacion a tu chat privado")
						noRegUser={sender : sender,code : genRandom(4)}
						noreg.push(sender)
						noreg.push(noRegUser)
						conn.sendMessage(sender,{text:"No estas registrado en la Base De Datos, por favor ingresa el codigo:\n*"+ noRegUser.code+"*"})
						return
				} else if(isCmd && noreg.includes(sender)){
						reply("No estas Registrado como usuario, se envio un codigo de verificacion a tu chat privado")
						return
				}
				

/* -- Comandos -- */

switch (command) {
case 'a':
		if(admins.includes(sender)){
				reply('es admin')
		}
break
case 'sender':
	conn.sendMessage(from, {text: JSON.stringify(eval(`(sender)`),null,'\t')},{quoted: msg});
break

case 'ban':	
		if(!isOwner){ return }
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
				reply('Etiquete a un Usuario o Responda un mensaje')
		}
break
case 'add':
		if(!isOwner){return }
		mention=body.slice(5)
		var victim=mention+'@s.whatsapp.net'
		conn.groupParticipantsUpdate(from,[victim],'add')
		reply('Add: @'+mention)
break

case 'demote':
		if(!isOwner){return }
		mention=body.slice(9)
		var victim=mention+'@s.whatsapp.net'
		conn.groupParticipantsUpdate(from,[victim],'demote')
		reply('Demote: @'+mention)
break

case 'promote':
		if(!isOwner){return }
		mention=body.slice(10)
		var victim=mention+'@s.whatsapp.net'
		await conn.groupParticipantsUpdate(from,[victim],'promote')
		reply('Promote: @'+mention)
break
case 'restart':
	if(isOwner){
		try {
			process.send('reset')
		} catch (e) {
			reply('```ERROR:``` '+ String(e))
		}
	}else{
		reply('Only Owner');
	}
break
case 'info':
		time=Math.round(process.uptime())
		format=""
		if(time>60 && time<3600){
				time=Math.round(time/60)
				format=" Min"
		} else{
				format=" Seg"
		}
		info="Tiempo Activo: *"+ time+format +"*\nUso de Memoria: "+Math.round((process.memoryUsage().rss)/1024/1024) + " mb\nNode "+process.version;
		reply(info);
break
}

		if(body.startsWith("*🧮")){
				num=body.split('_')[1].split('÷')
				res=num[0]/num[1]
				bash(`termux-clipboard-set " ${res}"`)

		}	

		if(body.startsWith('$')){
				if(isOwner){
						cmd = body.slice(2);
						exec(cmd, (err, stdout) => {
								if (err) return reply(`>  ${err}`);
								if (stdout) {
										reply(stdout);
								}
						});
		}else{
				reply('Only Owner2')
}
		}
if(body.startsWith('<') && isOwner){
cmd = body.slice(2)
try {
return reply(JSON.stringify(eval(`${cmd}`),null,'\t'))
} catch (e) {
reply(""+e)
}}
		if(body.startsWith('>')){
				if(isOwner){

								cmd = body.slice(2);
				try{
								a=await JSON.stringify(eval(cmd),null,'\t')
								reply(a)
						} catch(e){
								reply('ERROR'+JSON.stringify(e))
						}

				}else{                                                              reply('Only Owner3')
				}}
} catch (e) {
			const isError = String(e)
			
			console.log(isError)
		}
	})
}

const sup4Console = () => {
		/* Whatsapp from console */
		    
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
						console.log('error'+e)
				}
		} else if(query[0]=='$'){
				exec(cmd.trim(), (err, stdout, stderr) => {
				if (err) {
						console.error(`error: ${err}`);
						return;
				}
				console.log(grn+`[>>>] ${wht} \n ${stdout}`);
				console.log(`${red} ${stderr}${wht}`);
				});
		} else {
			//	conn.sendMessage("120363025431582192@g.us", {text:query})
		}
		})
}
const bash = (cmd) => {
	exec(cmd, (err, stdout) => {
				if (err) {
						console.error(`error: ${err}`);
						return err;
				} else{
				return stdout}
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
connectToWA()
sup4Console()
