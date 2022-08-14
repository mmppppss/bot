const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType
} = require('@adiwajshing/baileys')
const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const util = require('util')
const { exec } = require('child_process')

const { state, saveState } = useSingleFileAuthState('./session.json')

const { menu } = require('./Modulos/menu.js');
const { shell } = require('./Modulos/shell.js');
const { time } = require('./Modulos/time.js')

const prefix = '.'

const ownerNumber = [
  '34643694252', //Lucky-Cv
  '59167786908' //mmmppppss
  ]



const connectToWA = () => {
	const conn = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})
	
	conn.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if (connection === 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				connectToWA()
			}
		} else if (connection === 'open') {
			console.log('Bot conectado')
		}
	})
	
	conn.ev.on('creds.update', saveState)
	
	conn.ev.on('messages.upsert', async(mek, v) => {
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
			const pushname = mek.pushName || 'Sin nombre'
			const isMe = botNumber.includes(senderNumber)
			const isOwner = ownerNumber.includes(senderNumber) || isMe

   const a = (ruta, text) => {
     img = fs.readFileSync(ruta)
     conn.sendMessage(from, {image: img, caption:text}, {})

   }
   	
   const replyTempImg = (teks, footer, buttons = [], img) => {
			conn.sendMessage(from, { image: img, caption: teks, footer: footer, templateButtons: buttons })
		}
   
	
	const more = String.fromCharCode(8206);
	const readMore = more.repeat(4000);
	
			const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}
			
			switch (command) {


case 'menu':
  case 'help':
var teks = `_*Hola ${pushname}*_

*COMANDOS*
${prefix}status`

var footer = `jajaja`

var buttons = [
  {urlButton: {displayText: 'link', url: 'https://hola.com'}},
	{quickReplyButton: {displayText: '⎙ Lucky-Cv', id: prefix + type: 'status'}}
]
replyTempImg(teks, footer, buttons, fs.readFileSync('./lucky.jpg'))
break

case "status":
reply(`${time}`)
break




   default:
   
   if (isOwner) {
     
     if (body.startsWith('$')) {
						exec(body.slice(1), (err, stdout) => {
							if (err) return reply(err)
							if (stdout) return reply(stdout)
						})
					}
     
     if (body.startsWith('>')) {
						try {
						reply(util.format(await eval(`(async () => {${body.slice(1)}})()`)))
						} catch(e) {
							reply(util.format(e))
						}
					}
     
   }

			}
			
		} catch (e) {
			const isError = String(e)
			
			console.log(isError)
		}
	})



}

connectToWA()
