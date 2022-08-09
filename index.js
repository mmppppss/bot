const {
	default: makeWASocket,
	useSingleFileAuthState,
	DisconnectReason,
	getContentType
} = require('@adiwajshing/baileys')

const fs = require('fs')
const P = require('pino')
const qrcode = require('qrcode-terminal')

	
