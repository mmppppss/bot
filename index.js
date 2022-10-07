const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType
} = require('@adiwajshing/baileys')
const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')

const { state, saveState } = useSingleFileAuthState('./user/session.json')
const config = require('./user/config.json')

const connectToWA = () => {
	const bot= makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})
	
	bot.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if (connection === 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				connectToWA()
			}
		} else if (connection === 'open') {
			console.log('Conectado exitosamente')
		}
	})
	
	bot.ev.on('creds.update', saveState)
	
	bot.ev.on('messages.upsert', async(msg) => {
		try {
			msg = msg.messages[0]
			if (!msg.message) return
			
			msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
			if (msg.key && msg.key.remoteJid === 'status@broadcast') return //estados
			const type = getContentType(msg.message) //tipo de mensaje
			const content = JSON.stringify(msg.message) //contenido del mensaje
			const from = msg.key.remoteJid 
			
			const quoted = type == 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
			const body = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : ''
			/*
			const isCmd = body.startsWith(prefix)
			const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
			*/
			const args = body.trim().split(/ +/).slice(1)
			const q = args.join(' ')
			const isGroup = from.endsWith('@g.us')
			const sender = msg.key.fromMe ? (bot.user.id.split(':')[0]+'@s.whatsapp.net' || bot.user.id) : (msg.key.participant || msg.key.remoteJid)
			const senderNumber = sender.split('@')[0]
			const botNumber = bot.user.id.split(':')[0]
			const pushname = msg.pushName || 'Usuario'
			/*
			const isMe = botNumber.includes(senderNumber)
			*/
			const owner = isOwner(senderNumber)

			const reply = async(teks) => {
				await bot.sendMessage(from, { text: teks }, { quoted: msg })
			}
			

			switch (body) {
//Responde en caso de mensaje especifico

case 'hola':
reply(`Hola ${pushname}, ¿Como estas? :)`)
break

case 'ram':

	const template={
		text:'*Memoria Ram 8GB DDR4 Fury Black*\n*Fabricante:* Kingston\n*Velocidad del Reloj:* 3200 MHxz',
		footer:'CamiroCompuLoren',
		templateButtons:[
			{index:1, urlButton:{displayText:'Comprar',url:'google.com'}}
		]
	}
	const img='./media/img/ram1.jpg'
		if(isGroup){ chat=from } else { chat=sender}
	//	bot.sendMessage(chat,{image:{url:img},caption:'*Memoria Ram 8GB DDR4 Fury Black*\n*Fabricante:* Kingston\n*Velocidad del Reloj:* 3200 MHxz\nhttps://wa.me/p/7604298339641974/59176039720',footer:'CamiriCompuLoren',templateButtons:[{index:1,urlButton:{displayText:'Comprar', url:'https://wa.me/p/7604298339641974/59176039720'}}]})
//	bot.sendMessage(from, template )
	bot.sendMessage(chat,{image:{url:img},caption:'*Memoria Ram 8GB DDR4 Fury Black*\n*Fabricante:* Kingston\n*Velocidad del Reloj:* 3200 MHxz\nhttps://wa.me/p/7604298339641974/59176039720',footer:'CamiriCompuLoren'})
break


// ----------------------------------- //
			}

if(body.startsWwith('>')){
		try{
				out= await eval(body.slice(2))
				reply(JSON.stringify(out))
		} catch(e){
				reply('Error:'+e)
		}
}
		} catch (e) {
			const isError = String(e)
			console.log(isError)
		}
	})
}


isOwner=(n)=>{
		for(i of config.owner){
				if(i.number==n){
						return true
				}else{
						return false
				}
		}
}
connectToWA()


