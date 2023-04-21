const commands = {
      hola: () => reply('Hola '+senderName),
      adios: () => reply('Adios '+senderName),
    restart:() =>{
        if(!isOwner){ return }
        eval(process.exit())
    },
    setlang: ()=> {
        console.log(strings.setlang)
        if(args[1]=="es"){
            strings=languajes.es
            config.lang="es";
        }
        if(args[1]=="en"){
            strings=languajes.en;
            config.lang="en";
        }
        reply(strings.setlang)
        writeJson('user/config.json', config)
    },
    setprefix:()=>{
        reply(strings.setprefix+args[1])
        prefix=args[1];
        config.prefix=args[1];
        writeJson('user/config.json', config)
    },
    ban:()=>{
        if(!isOwner){ return }
		victim=msg.message.extendedTextMessage.contextInfo.participant;
    	if(victim!=''){
	    	conn.groupParticipantsUpdate(from,[victim],'remove')
		    reply('Ban '+victim.split('@')[0])
    	} else if(body.length>4){
	    	mention=body.slice(6)
			victim=mention+'@s.whatsapp.net'
			conn.groupParticipantsUpdate(from,[victim],'remove')
    		reply('Ban: '+mention)
		} else {
			reply(strings.tagUser)
		}
    },
    add:()=>{
	    if(!isOwner) return 
        mention=body.slice(5)
	    var victim=mention+'@s.whatsapp.net'
    	conn.groupParticipantsUpdate(from,[victim],'add')
	    reply('Add: @'+mention)
    },
    demote:()=>{
    	if(!isOwner)return 
	    mention=body.slice(9)
    	var victim=mention+'@s.whatsapp.net'
    	conn.groupParticipantsUpdate(from,[victim],'demote')
	    reply('Demote: @'+mention)
    },
    promote:async()=>{
    	if(!isOwner)return 
	    mention=body.slice(10)
    	var victim=mention+'@s.whatsapp.net'
	    await conn.groupParticipantsUpdate(from,[victim],'promote')
    	reply('Promote: @'+mention)
    },
    info:()=>{
    	time=Math.round(process.uptime())
	    format=""
    	if(time>60 && time<3600){
		    time=Math.round(time/60)
	    	format=" Min"
    	} else{
	    	format=" Seg"
    	}
	    info=strings.time+ time+format +"\n"+strings.memory+Math.round((process.memoryUsage().rss)/1024/1024) + " mb\nNode "+process.version;
    	reply(info);
    }
}

module.exports={
    commands
}
