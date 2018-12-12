const Discord = require('discord.js');
fs = require('fs');

const client = new Discord.Client();
const usersList = [];
var loggedIN = false;
var FSbaseJson = [];
var bossJSON = [];
var env = "prod";
var FSPREMJson = [];
var FSPrEvntJson =[];
var FSEvntJson = [];
var premJson= [];
var Eventag = 0;

if(env == "prod"){
	var tokenID = "NTE4MDc2MjA1NTgxMjA1NTE0.DuLmog.u-ye76J1K7jzbF4vSmShwGl0Ae8";
	var serverID = "298188203087626240";
}
else{
	var tokenID = "NTAyMTM5NjgzMDkwOTg5MTAy.DqjmzA.EkwGAqu5-jKB2DqTLLbazJl78UY";
	var serverID = "227426327567925249";
}

fs.readFile('enchants.json', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  FSbaseJson = JSON.parse(data);
});
fs.readFile('enchantsPre.json','utf8',function(err,data) {
	if (err){
		return console.log(err);
	}
	FSPREMJson= JSON.parse(data);
});
fs.readFile('enchantsPrEvnt.json','utf8',function(err,data){
	if (err){
		return console.log(err);
	}
	FSPrEvntJson= JSON.parse(data);
});
fs.readFile('enchantsEven.json','utf8',function(err,data){
	if (err){
		return console.log(err);
	}
	FSEvntJson= JSON.parse(data);
});
fs.readFile('Listprem.json','utf8',function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  premJson=JSON.parse(data);
});

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  loggedIN = true;
});

client.on('message', msg => {
	if(msg.content.indexOf('!fs') >= 0){	  
		isInList(msg.member.user.username, "Listprem",function(err){
			if (err){
				processFSCommand(msg,1);
			}
			else{
				processFSCommand(msg,3);
			}
		});
	}
	if (msg.content.indexOf('!event') >= 0) {
		$argv = msg.content.split(' ');
    	if($argv.length >= 2 && $argv[1] == "on" || $argv[1] == "off"){
    		if($argv[1]== "on"){
    			Eventag = 1;
    			msg.reply("Event + 20% par failstack Activé.");
    		}
    		else{
    			Eventag = 0;
    			msg.reply("Event + 20% par failstack Déactivé.");
    		}
    	}
    }
})

//Gestion de la liste premium
client.on('message', msg => {
  if (msg.content =='!premium '|| msg.content == '!premium on'|| msg.content == "!premium off") {
    	$argv = msg.content.split(' ');
    	if($argv.length >= 2 && $argv[1] == "on" || $argv[1] == "off"){
	  		if($argv[1] == "on"){
	  			addToList("Listprem", msg.member.user.username, msg);		
	  		}
	  		else if($argv[1] == "off"){
	  			removeToList("Listprem", msg.member.user.username, msg);
	  		}
	  		else{
	  			msg.reply("Usage :!premium on ou off selon si vous voulez avoir les failstack premium ou normal");
	  		}
	  	}
	  	else {
	  			msg.reply("Usage :!premium on ou off selon si vous voulez avoir les failstack premium ou normal");
	  	}
	}
})


function getMembersList($guildID){
	// console.log(client.guilds);
	// Get the Guild and store it under the variable "list"
	var list = client.guilds.get($guildID);
	// Iterate through the collection of GuildMembers from the Guild getting the username property of each membere
	return list.members;
}

function isInList($name,$index,cb){
	
	fs.readFile('Listprem.json', 'utf8', function (err,data) {
	 
	  if (err) {
	    return console.log(err);
	  }
	  
	  data = JSON.parse(data);
	 
	  if(data[$index].contains($name)){
	  	cb(false);
	  }
	  else{
	  	cb(true);
	  }
	})
};

function removeToList($index, $name, msg){
	fs.readFile('Listprem.json', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  
	  data = JSON.parse(data);
	  data[$index].remove($name);
	  fs.writeFile('Listprem.json', JSON.stringify(data), function (err) {
		  if (err) throw err;
		  console.log('User ' + $name + " removed to Listprem .");
  			msg.reply('Vous ne faites plus partit de la liste des premium !')

		});
	});
}
function addToList($index, $name, msg){
	fs.readFile('Listprem.json', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  
	  data = JSON.parse(data);
	  if(!data[$index].contains($name)){
	  	data[$index].push($name);
	  	fs.writeFile('Listprem.json', JSON.stringify(data), function (err) {
		  if (err) throw err;
		  	console.log('User ' + $name + " Saved to Listprem .");
  			msg.reply('Vous êtes maintenant dans la liste des premium ');
		})
	  }
	  else{
		  msg.reply('Vous êtes déja dans la liste des premium !');

	  }
	});
};


/* FailStack calculator */
function failSelect(type,lvlToUpgrade,nb_fs_bonus, FSJson) {
	var bonus_chance_fs = FSJson[type][lvlToUpgrade].increase_chance * nb_fs_bonus;
	var valueCapped = parseFloat(FSJson[type][lvlToUpgrade].base_chance+ (FSJson[type][lvlToUpgrade].increase_chance * FSJson[type][lvlToUpgrade].cap_fs)).toFixed(2);
	var capped_bonus_chance_fs = (valueCapped > 100 ? 100 : valueCapped);
	var capped_bonus_chance_fs = parseFloat(FSJson[type][lvlToUpgrade].base_chance+ (FSJson[type][lvlToUpgrade].increase_chance * FSJson[type][lvlToUpgrade].cap_fs)).toFixed(2);
	var chance = parseFloat(FSJson[type][lvlToUpgrade].base_chance + bonus_chance_fs).toFixed(2);
	return {"bonus_chance_fs":bonus_chance_fs,"capped_bonus_chance_fs":capped_bonus_chance_fs,"chance":chance};
}

/*failstak prem*/
//function failSelect(type,lvlToUpgrade,nb_fs_bonus) {
//
//				var bonus_chance_fs = FSPREMJson[type][lvlToUpgrade].increase_chance * nb_fs_bonus;
//				var capped_bonus_chance_fs = parseFloat(FSPREMJson[type][lvlToUpgrade].base_chance+ (FSPREMJson[type][lvlToUpgrade].increase_chance * FSPREMJson[type][lvlToUpgrade].cap_fs)).toFixed(2);
//				var chance = parseFloat(FSPREMJson[type][lvlToUpgrade].base_chance + bonus_chance_fs).toFixed(2);
//				return {"bonus_chance_fs":bonus_chance_fs,"capped_bonus_chance_fs":capped_bonus_chance_fs,"chance":chance};
//}


function processFSCommand(msg,fstype){
	$argv = msg.content.split(' ');
	if($argv.length >= 3){
		if(parseInt($argv[1]) != "NaN" && parseInt($argv[2]) != "NaN"){
			var lvlToUpgrade = parseInt($argv[1]) + 1;
			var FSJson = [];
				
				if ( (fstype + Eventag) == 1){
					FSJson = FSbaseJson ;
				}
				else if ((fstype + Eventag)== 2){
					FSJson =FSEvntJson;
				}
				else if ((fstype + Eventag) == 3){
					FSJson = FSPREMJson;
				}
				else if((fstype + Eventag) == 4){
					FSJson = FSPrEvntJson;
				}
				if(FSJson['armors'][lvlToUpgrade] && FSJson['weapons'][lvlToUpgrade]){
					console.log(FSJson['armors'][lvlToUpgrade]);
					var nb_fs_bonus  = {'weapons':$argv[2],'armors':$argv[2],'jewels':$argv[2]};
					if(nb_fs_bonus.armors > FSJson['armors'][lvlToUpgrade].cap_fs){
						nb_fs_bonus.armors = FSJson['armors'][lvlToUpgrade].cap_fs;
					}
					if(nb_fs_bonus.weapons > FSJson['weapons'][lvlToUpgrade].cap_fs){
						nb_fs_bonus.weapons = FSJson['weapons'][lvlToUpgrade].cap_fs;
					}
					if(lvlToUpgrade <=5 && nb_fs_bonus.jewels > FSJson['jewels'][lvlToUpgrade].cap_fs){
						nb_fs_bonus.jewels = FSJson['jewels'][lvlToUpgrade].cap_fs;
					}
				
					var weaponsData = failSelect('weapons',lvlToUpgrade,nb_fs_bonus.weapons, FSJson);
					var armorsData = failSelect('armors',lvlToUpgrade,nb_fs_bonus.armors, FSJson);
					if (lvlToUpgrade<=5){
						var jewelsData = failSelect('jewels',lvlToUpgrade,nb_fs_bonus.jewels, FSJson);
					}


					// msg.reply("````It's very easy to make some words **bold** and other words *italic* with Markdown. You can even [link to Google!](http://google.com)")
					//msg.reply("![alternate text](https://sourceforge.net/images/icon_linux.gif) Bot FS \n Chance to upgrade to +" + lvlToUpgrade + " => " + parseFloat(chance).toFixed(2) + "% | Max FS : " + FSJson['armors'][lvlToUpgrade].cap_fs + "```");

					const embed = new Discord.RichEmbed()
				  embed.setTitle("Résultats : ")
				  if(lvlToUpgrade == 20){
				  	embed.setAuthor("BDO FS Calculator", "https://cdn.discordapp.com/emojis/413963892574912521.gif")
				  }
				  else{
				  	embed.setAuthor("BDO FS Calculator", "https://i.imgur.com/lj2V3Mu.png")
				  }
				  /*
				   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
				   */
				  embed.setColor(0x00AE86)
				  embed.setDescription("Calculez vos failstack sans soucis !")
				  embed.setFooter("© Btx & Protoxs les pgms", client.user.avatarURL)
				  // embed.setImage("http://i.imgur.com/yVpymuV.png")
				  if(lvlToUpgrade == 20){
				  embed.setThumbnail("https://cdn.discordapp.com/emojis/453193821535338506.gif")

				  }
				  else{
				  embed.setThumbnail("https://i.imgur.com/lj2V3Mu.png")
				  	
				  }
				  /*
				   * Takes a Date object, defaults to current date.
				   */
				
				  embed.setURL("https://imgur.com/a/D5ngu")
				  
// affichage Armure
				 embed.addField("Armure", "Chance d'amélioration au niveau +" + lvlToUpgrade + " (FS Actuels : " + $argv[2] + ") ");
				  embed.addField("*"+ armorsData.chance +"%* de chance de réussite ", "Max FS : ** " + FSJson['armors'][lvlToUpgrade].cap_fs + "** | Taux de réussite au MAX FS : " + armorsData.capped_bonus_chance_fs + "%  | ( **" + FSJson['armors'][lvlToUpgrade].increase_chance + "%** par FS) ", true);
// affichage Arme
				embed.addField("Arme", "Chance d'amélioration au niveau +" + lvlToUpgrade + " (FS Actuels : " + $argv[2] + ") ");
				embed.addField("*"+ weaponsData.chance +"%* de chance de réussite ", "Max FS : ** " + FSJson['armors'][lvlToUpgrade].cap_fs + "** | Taux de réussite au MAX FS : " + weaponsData.capped_bonus_chance_fs + "%  | ( **" + FSJson['armors'][lvlToUpgrade].increase_chance + "%** par FS) ", true);

// Affichage Bijou  
				  if (lvlToUpgrade <=5){
					embed.addField("Bijou", "Chance d'amélioration au niveau +" + lvlToUpgrade + " (FS Actuels : " + $argv[2] + ") ");
					embed.addField("*"+ jewelsData.chance +"%* de chance de réussite ", "Max FS : ** " + FSJson['armors'][lvlToUpgrade].cap_fs + "** | Taux de réussite au MAX FS : " + jewelsData.capped_bonus_chance_fs + "%  | ( **" + FSJson['armors'][lvlToUpgrade].increase_chance + "%** par FS) ", true);
				  }
  				embed.setTimestamp(Date.now)
				  msg.reply({embed}); 
			}
		}
		else{
			msg.reply("Warn : arguments need to be numbers.\nUsage : !fs [actualLevel] [actual_fs]");
		}
	}
	else{
		msg.reply("Usage : !fs [actualLevel] [actual_fs]");

	}
};
client.login(tokenID);