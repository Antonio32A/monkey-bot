const Discord = require("discord.js");

module.exports.run = async (bot, message, args, db, guild) => {
  console.log(`Running command ${this.cmd.name}`);
  const config = require("../config.json");
  const fs = require("fs");

  let discordID = message.author.id;

  try {
    let bananaData;
    try {
      bananaData = JSON.parse(fs.readFileSync("bananas.json"));
    } catch (e) {
      fs.writeFileSync("bananas.json", '{}');
      bananaData = {};
    }

    let bananasDoc;
    let t60bananas;
    

    db.collection('users').where('discordId','==',discordID).get()
    .then(snapshot => {
    if(snapshot.docs.length > 1){
        return {
            status: true,
            message: ":x: Error: User is paired to more than one command - very bad, shouldn't happen.",
        };
    }else if(snapshot.docs.length < 1){
        return {
            status: true,
            message: ":x: Could not find user. Make sure your accounts are paired.",
        };
    }else{
        //get that users bananas subcollection
        bananasDoc = snapshot.docs[0].ref.collection('bananas').doc('bananas');
        bananasDoc.get().then(snapshot2 => {
            let data = snapshot2.data();
            t60bananas = data.t60bananas; // <-
        })

        //bananasDoc.set({t60bananas: 0}, {merge: true});
    }
    })


    let userData = bananaData[message.author.id];
    let milisNow = Date.now();
    if (userData === undefined) {
      //no user found, add a new one
      bananaData[message.author.id] = {
        balance: 1,
        lastCollect: milisNow,
      };
      //success show balance
      fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
      let nextReset = addDays(milisNow, 1);
      nextReset.setHours(0);
      nextReset.setMinutes(0);
      nextReset.setSeconds(0);
      nextReset.setMilliseconds(0);

      let dateDiff = Math.floor((nextReset - milisNow) / 1000);
      
      let th = Math.floor(dateDiff / 3600);
      let tm = Math.floor((dateDiff % 3600) / 60);
      let ts = Math.floor((dateDiff % 3600) % 60);
        
      let timeLeftString = "";
      if (th > 0) {
        timeLeftString = th === 1 ? `${th} hour` : `${th} hours`;
      } else if (tm > 0) {
        timeLeftString =
          tm === 1 ? `${tm} minute` : `${tm} minutes`;
      } else if (ts > 0) {
        timeLeftString =
          ts === 1 ? `${ts} second` : `${ts} seconds`;
      }
      let embed = new Discord.MessageEmbed()
      .setColor("#e2b714")
      .setTitle(`${message.author.username}'s Bananas`)
      .setThumbnail(
        "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
      )
        .setDescription(`Banana collected! Come back in ${timeLeftString} for more.`)
        .addField("Bananas",1)
        .setFooter("www.monkeytype.com");
      
      message.channel.send(embed);

      if (bananasDoc !== undefined && t60bananas !== undefined && t60bananas !== 0)  {
        message.channel.send(`:partying_face: Surprise bananas! You've got ${t60bananas} bananas as a bonus!`);
        bananaData[message.author.id].balance += t60bananas;
        fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
        bananasDoc.set({t60bananas: 0}, {merge: true});
        return {
            status: true,
            message: ''
        }
    }
      
      return {
        status: true,
        message: ''
      }
    } else {
      //else user found incrementing and setting last collect data
      //check if user already collected today
      let cD = new Date(userData.lastCollect);
      let mN = new Date(milisNow);
      if (
        cD.getUTCFullYear() === mN.getUTCFullYear() &&
        cD.getUTCMonth() === mN.getUTCMonth() &&
        cD.getUTCDate() === mN.getUTCDate()
      ) {
        //same day, show error
        let nextReset = addDays(cD, 1);
        nextReset.setHours(0);
        nextReset.setMinutes(0);
        nextReset.setSeconds(0);
        nextReset.setMilliseconds(0);

        let dateDiff = Math.floor((nextReset - milisNow) / 1000);
        
        let th = Math.floor(dateDiff / 3600);
        let tm = Math.floor((dateDiff % 3600) / 60);
        let ts = Math.floor((dateDiff % 3600) % 60);
          
        let timeLeftString = "";
        if (th > 0) {
          timeLeftString = th === 1 ? `${th} hour` : `${th} hours`;
        } else if (tm > 0) {
          timeLeftString =
            tm === 1 ? `${tm} minute` : `${tm} minutes`;
        } else if (ts > 0) {
          timeLeftString =
            ts === 1 ? `${ts} second` : `${ts} seconds`;
        }
        let embed = new Discord.MessageEmbed()
        .setColor("#e2b714")
        .setTitle(`${message.author.username}'s Bananas`)
        .setThumbnail(
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        )
          .setDescription(`Too early! Come back in ${timeLeftString} to collect your banana.`)
          .addField("Bananas",userData.balance)
          .setFooter("www.monkeytype.com");
    

        message.channel.send(embed);

        if (bananasDoc !== undefined && t60bananas !== undefined && t60bananas !== 0)  {
            message.channel.send(`:partying_face: Surprise bananas! You've got ${t60bananas} bananas as a bonus!`);
            bananaData[message.author.id].balance += t60bananas;
            fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
            bananasDoc.set({t60bananas: 0}, {merge: true});
            return {
                status: true,
                message: ''
            }
        }

        return {
          status: true,
          message: ''
        }
      } else {
        //collect banana
        // bananaData[message.author.id] = {
        //   balance: userData.balance + 1,
        //   lastCollect: milisNow,
        // };
        bananaData[message.author.id].balance++;
        bananaData[message.author.id].lastCollect = milisNow;
        //success, show balance
        fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
        let nextReset = addDays(milisNow, 1);
        nextReset.setHours(0);
        nextReset.setMinutes(0);
        nextReset.setSeconds(0);
        nextReset.setMilliseconds(0);

        let dateDiff = Math.floor((nextReset - milisNow) / 1000);
        
        let th = Math.floor(dateDiff / 3600);
        let tm = Math.floor((dateDiff % 3600) / 60);
        let ts = Math.floor((dateDiff % 3600) % 60);
          
        let timeLeftString = "";
        if (th > 0) {
          timeLeftString = th === 1 ? `${th} hour` : `${th} hours`;
        } else if (tm > 0) {
          timeLeftString =
            tm === 1 ? `${tm} minute` : `${tm} minutes`;
        } else if (ts > 0) {
          timeLeftString =
            ts === 1 ? `${ts} second` : `${ts} seconds`;
        }
        let embed = new Discord.MessageEmbed()
        .setColor("#e2b714")
        .setTitle(`${message.author.username}'s Bananas`)
        .setThumbnail(
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        )
          .setDescription(`Banana collected! Come back in ${timeLeftString} for more.`)
          .addField("Bananas",userData.balance)
          .setFooter("www.monkeytype.com");
        
        message.channel.send(embed);

        if (bananasDoc !== undefined && t60bananas !== undefined && t60bananas !== 0)  {
            message.channel.send(`:partying_face: Surprise bananas! You've got ${t60bananas} bananas as a bonus!`);
            bananaData[message.author.id].balance += t60bananas;
            fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
            bananasDoc.set({t60bananas: 0}, {merge: true});
            return {
                status: true,
                message: ''
            }
        }

        return {
          status: true,
          message: ''
        }
      }
    }
  } catch (e) {
    return {
      status: false,
      message: "Something went wrong getting your banana balance: " + e.message,
    };
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

};

module.exports.cmd = {
  name: "banana",
  needMod: false,
  requiredChannel: "banana"
};
