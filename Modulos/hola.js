const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}

reply(`hola como estas?:v`)