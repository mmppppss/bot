const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}
			
const pushname = mek.pushName || 'Sin Nombre'


reply(`Hola ${pushname} como estas? :v`)