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


/* -- Variables -- */
const prefix = '.'
const ownerNumber = ['59167786908','34643694252']


/* -- Colores -- */
let wht='\033[00m'
let blk='\033[30m'
let red='\033[31m'
let grn='\033[32m'
let ylw='\033[33m'
let blu='\033[34m'
let pnk='\033[35m'
/* -- Conexion -- */
const { state, saveState } = useSingleFileAuthState('./session.json')
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
	
	conn.ev.on('messages.upsert', async(mek) => {
		try {
			mek = mek.messages[0]
			if (!mek.message) return
			
			mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
			if (mek.key && mek.key.remoteJid === 'status@broadcast') return
			const type = getContentType(mek.message)
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			
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
			console.log(`${grn}${sender} : ${wht} ${body}`)
			const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}



/* -- Comandos -- */

switch (command) {
case 'kkk':
		const a = await conn.groupMetadata(from);
		const b= await JSON.stringify(a.participants)
		admins = [];
		reply(b)
		for (let i in b) {
				await reply(b[i])
		}
		//const b = await getGroupAdmins(a.participants)));
break

case 'hola':
	reply(`Hola ${pushname} como estas? :D`)
break
case 'sender':
	conn.sendMessage(from, {text: JSON.stringify(eval(`(sender)`),null,'\t')},{quoted: mek});
break
/*
case 'ban':
		mention=body.slice(6)
		var victim=mention+'@s.whatsapp.net'
		conn.groupParticipantsUpdate(from,[victim],'remove')
		reply('Ban: @'+mention)
break
case 'add':
		mention=body.slice(5)
		var victim=mention+'@s.whatsapp.net'
		conn.groupParticipantsUpdate(from,[victim],'add')
		reply('Add: @'+mention)
break

case 'demote':
		mention=body.slice(9)
		var victim=mention+'@s.whatsapp.net'
		conn.groupParticipantsUpdate(from,[victim],'demote')
		reply('Demote: @'+mention)
break

case 'promote':
		mention=body.slice(10)
		var victim=mention+'@s.whatsapp.net'
		await conn.groupParticipantsUpdate(from,[victim],'promote')
		reply('Promote: @'+mention)
break
*/

/* Intento de sticker 
case 's':
		ffmpeg()
						.input('./icon.png')
						.format('webp')
						.save('o.webp')
						.on('error', function(err){
								reply('error'+err)
						})
						.on('end', function(){
								conn.sendMessage(from,{sticker:{url:'./o.webp'}})})

break
		*/
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
				reply('Only Owner')
}
		}
/*
 if (body.startsWith('>')) {
						try {
						reply(util.format(await eval(`(async () => {${body.slice(1)}})()`)))
						} catch(e) {
							reply(util.format(e))
						}
					}
		*/
		if(body.startsWith('>')){
				if(isOwner){
						try{
								cmd = body.slice(2);
								a=JSON.stringify(eval(cmd),null,'\t')
								reply(a)
						} catch(e){
								reply('ERROR'+JSON.stringify(e))
						}

				}else{                                                              reply('Only Owner')
				}
		}
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
				a=JSON.stringify(eval(cmd), null, '\t')
				console.log(a);
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
				conn.sendMessage("120363025431582192@g.us", {text:query},{})
		}
		})
}


connectToWA()

