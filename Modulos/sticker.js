const reply = async(teks) => {
				await conn.sendMessage(from, { text: teks }, { quoted: mek })
			}

reply(`Hola como estas? :v`)