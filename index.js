/* -- Modulos -- */
const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType
} = require('@adiwajshing/baileys')
const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const exec = require('child_process').exec
const util = require('util')
const ffmpeg= require('fluent-ffmpeg')
const webp=require('webp-converter')

/* -- Variables -- */
const prefix = '.'
const ownerNumber = ['59167786908','59175581660','18563761199']


/* -- Colores -- */
let wht='\033[00m'
let blk='\033[30m'
let red='\033[31m'
let grn='\033[32m'
let ylw='\033[33m'
let blu='\033[34m'
let pnk='\033[35m'

/* -- Conexion -- */
const { state, saveState } = useSingleFileAuthState('./user/session.json')
const connectToWA = () => {
	const conn = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})
	whatConsola(conn)
    conn.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if (connection === 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				connectToWA()
			}
		} else if (connection === 'open') {
			console.log(`${red} -- BOT CONECTADO -- ${wht}`)
		}
	})
	
	conn.ev.on('creds.update', saveState)
	
	conn.ev.on('messages.upsert', async(mek, Fg) => {
		try {
			mek = mek.messages[0]
			if (!mek.message) return
			
			mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
		    //console.log(mek.message)
			if (mek.key && mek.key.remoteJid === 'status@broadcast') return
			const type = getContentType(mek.message)
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
		//	console.log(from)
			const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
			const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
			
			const isCmd = body.startsWith(prefix)
			const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
			
			const args = body.trim().split(/ +/).slice(1)
			const q = args.join(' ')
			const isGroup = from.endsWith('@g.us')
			const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
			const senderNumber = sender.split('@')[0]
			const botNumber = conn.user.id.split(':')[0]
			const pushname = mek.pushName || 'Sin Nombre'
			
			const isMe = botNumber.includes(senderNumber)
			const isOwner = ownerNumber.includes(senderNumber) || isMe
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
				await conn.sendMessage(from, { text: teks }, { quoted: mek })}
if(sender=="59172630302@s.whatsapp.net"){
	await conn.sendMessage(from,{sticker:{url:'juan.webp'}}, { quoted:mek })
}

if(sender=="59171020393@s.whatsapp.net"){
	await conn.sendMessage(from,{text:"Calla friki"}, { quoted:mek })
}

contac=['59175581660@s.whatsapp.net']
//"5212283413004-1625169641@g.us","59175581660@s.whatsapp.net","120363025431582192@g.us","59177318594@s.whatsapp.net","59171358485-1574473292@g.us"]
//contac=['19842074738']
if(contac.includes(sender)){
		emojis=["🍄","🎋","🪴","🐲","🌱","🦃","🦧","🐙","🦀","🦖","🐢","🦗","🦟","🪳","🪲","🪰","🐜","🐞","🐌","🦋","🐛","🪱","🐝","🐗","🦆","🐸","🎍","🍁"]
		reaction=emojis[Math.floor(Math.random() * emojis.length)]
		
		conn.sendMessage(from,{react:{text:reaction, key:mek.key}})
}
/* -- Comandos -- */

switch (command) {
case 'a':
	/*	const a = await conn.groupMetadata(from);
		const b = JSON.constructor(a.participants);
		admins = [];
		reply(typeof(c))
		for(i of b){
				if(i.admin=='admin'){
						admins=admins.concat(i.id);
				}
		}
		if(admins.includes(sender)){
				await reply('true')
		}

		reply(JSON.stringify(admins))*/
		if(admins.includes(sender)){
				reply('es admin')
		}
break
/*
case 'hola':
  if(!isAdmins && !isOwner && !isBot) return m.reply(msg.admin)
	reply(`Hola ${pushname} como estas? :D`)
break*/
case 'sender':
	conn.sendMessage(from, {text: JSON.stringify(eval(`(sender)`),null,'\t')},{quoted: mek});
break

case 'ban':	
		if(!isOwner){ return }
		victim=mek.message.extendedTextMessage.contextInfo.participant;
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


//Intento de sticker 
case 'sticker':
		/*
	ffmpeg()
	.input('./icon.png')
	.format('webp')
	.on('error', function(err){
		reply('error'+err)
	})
	.on('end', function(){
		conn.sendMessage(from,{sticker:{url:'./o.webp'}})
	})
	.on('exit', ()=>{
		reply('exit')
	})
	.save('o.webp')*/
    const result = webp.cwebp("icon.png","nodejs_logo.webp");
		result.then((response) => {
				reply(response);
		});
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

		/*  sjjdjdjdjddj
		 *
		 *
		 *
		 *
		 *  .> 
k=quoted.text.split('_')[1].split('÷')
k[0]/k[1]
conn.sendMessage(m.chat,{text:"h"},{quoted:quoted})



		*/

		if(body.startsWith("*🧮")){
				num=body.split('_')[1].split('÷')
				res=num[0]/num[1]
				bash(`termux-clipboard-set " ${res}"`)

		//		exec(`termux-clipboard-set "${res}`)
			//	conn.sendMessage("120363046053280525@g.us",{text:`$ termux-clipboard-set "${res}"`})
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

const whatConsola = (conn) => {
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
/*
function getAdmins(from){
		const group = conn.groupMetadata(from);
		const members =  JSON.constructor(group.participants);
		admins = []
		for(menber of members){
				if(i.admin=='admin'){
						admins=admins.concat(i.id);
				}
		}
		return admins;
}
*/
connectToWA()

