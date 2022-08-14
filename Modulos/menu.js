
exports.menu = var teks = `Hola ${pushname}`

var footer = `jajaja`

var buttons = [
  {urlButton: {displayText: 'link', url: 'https://hola.com'}},
	{quickReplyButton: {displayText: '⎙ Lucky-Cv', id: prefix + 'creador'}}
]
replyTempImg(teks, footer, buttons, fs.readFileSync('./lucky.jpg'))




