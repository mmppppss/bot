const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}


reply(`Hola ${pushname} como estas? :v`)