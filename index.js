require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const fetch = require('node-fetch')
const _find = require('lodash/find')
const _sort = require('lodash/sortBy')
const fs = require('fs')
const cron = require('node-cron');
const TOKEN = process.env.TOKEN;
const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  "mongodb://localhost:27017/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect();
const database = client.db('ctwg');
const notifications = database.collection('notification');
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    msg.channel.send('pong');

  } else if (msg.content.startsWith('!kick')) {
    if (msg.mentions.users.size) {
      const taggedUser = msg.mentions.users.first();
      msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
    } else {
      msg.reply('Please tag a valid user!');
    }
  }
});

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
async function run() {
    
    // Query for a movie that has the title 'Back to the Future'
    //const query = {};
    const notification = await notifications.find({status: false}).toArray()
    //console.log(notification);
  return notification
}
async function insert(query) {
  const notification = await notifications.insertOne(query)
  return notification
}


cron.schedule('5,10,15,20,25,30,35,40,45,50,55,59 * * * * *', async() => {
  //console.log('running every 5 sec');
  const notification = await run()
  if(notification){
    notification.forEach((ele) => {
      //const wordCount = messageContent.length
      fetch('https://api.bitkub.com/api/market/ticker').then(res => res.json())
      .then(json => {
        const strCoin = ele.coin.toUpperCase()
        const strSearch  = 'THB_'.concat(strCoin)
        //console.log(strSearch);
        let findFlag = false
        for (const [key, value] of Object.entries(json)) {
          if(strSearch === key ) {
            findFlag = true
              // msg.reply(strSearch+ ': '+ numberWithCommas( value.last ) + ' THB');
              if(value.last >= parseFloat(ele.price) ){
                const channel = bot.channels.get(ele.channelId)
                channel.send(`Hi, <@${ele.user}>` + strSearch+ ': '+ numberWithCommas( value.last ) + ' THB')
                notifications.findOneAndUpdate({_id: ele._id}, {$set: {status: true}})
              }
          }
        }
        
      })
    })
  }
  
});


bot.on('message', msg => {
  //!price btc
  let messageContent = msg.content.split(' ')
  if (msg.content.startsWith('!price')) {
    console.log(msg.channel);
    const wordCount = messageContent.length
    fetch('https://api.bitkub.com/api/market/ticker').then(res => res.json())
    .then(json => {
      const strCoin = wordCount === 2 ? messageContent[1].toUpperCase() :  messageContent[2].toUpperCase()
      const strSearch  = 'THB_'.concat(strCoin)
      console.log(strSearch);
      let findFlag = false
      for (const [key, value] of Object.entries(json)) {
        if(strSearch === key ) {
          findFlag = true
          if(wordCount ===2 ){

            msg.reply(strSearch+ ': '+ numberWithCommas( value.last ) + ' THB');
          }else {
            msg.reply(messageContent[1]+ ' '+ messageContent[2] + ' = ' + numberWithCommas(value.last* parseFloat(messageContent[1]))+ ' THB');
          }
         
        }
      }
      if(!findFlag){
        msg.reply('ไม่พบเหรียญ ที่คุณต้องการค้นหา กรุณากด 7 มาครับ');
      }
    })
    
    //msg.channel.send('price');

  } else if(msg.content.startsWith('อยากมี')) {
    const message = [
      'คุณบอกว่าคุณอยากมี แล้วคุณได้พยายามทำอะไรเพื่อที่จะมีมันหรือยัง',
      'เราอยากมีเดี๋ยวเรามีได้ ขอพระเจ้าก็ได้ครับเดียวเราก็ได้มี'
    ]
    msg.reply(message[getRandomInt(2)]);
   
  }
  else if(msg.content.startsWith('fuck')) {
    msg.reply('เหม็นสาปคนจน');
  }
  else if(msg.content.startsWith('7')) {
    msg.reply('คุณมีกระเป๋า wallet หรือยัง');
  }
  else if(msg.content.startsWith('ยัง')) {
    msg.reply('คุณต้อง motivate ก่อน persivate ตัวเองก่อน');
  }
  else if(msg.content.startsWith('idiot bot')) {
    msg.reply('เหม็นสาปคนจน');
  }
  else if(msg.content.startsWith('idiot')) {
    msg.reply('เหม็นสาปคนจน');
  }
  else if(msg.content.startsWith('CTWG')) {
    msg.reply('Make Peace , Make Money');
  }
  else if(msg.content.startsWith('ใครจะเป็นเศรษฐี')) {
    msg.reply('ฉันนะสิ ฉันนะสิ');
  }
  else if(msg.content.startsWith('?')) {
    msg.reply('จน');
  }
  else if(msg.content.startsWith('RRAD')) {
    msg.reply('\nRead graph \nResearch \nAnalysis \nDecision');
  }
  else if(msg.content.startsWith('rrad')) {
    msg.reply('\nRead graph \nResearch \nAnalysis \nDecision');
  }
  else if(msg.content.startsWith('เสียดาย')) {
    fetch('https://api.bitkub.com/api/market/ticker').then(res => res.json())
    .then(json => {
      const btc = 'THB_DOGE'
      for (const [key, value] of Object.entries(json)) {
        if(btc === key ) {
          msg.reply('1DOGE = '+ numberWithCommas( value.last ) + ' THB' +'\n');
        }
        
      }
    })
  }
  else if(msg.content.startsWith('แจ้งเตือนเมื่อ')) {
    let messageContent = msg.content.split(' ')
    const user = msg.author.id
    const channelId = msg.channel.id
    const coin = messageContent[1]
    const price = messageContent[3]
    const query= {
      'user': user,
      'channelId': channelId,
      'coin': coin,
      'price': price,
      'status': false
    }
    const notification = insert(query)
    if(notification){
      msg.reply('ตั้งเวลาแจ้งเตือนสำเร็จ');
    }else {
      msg.reply('ตั้งเวลาแจ้งเตือนไม่สำเร็จ');
    }
  }
  // else if(msg.content.startsWith('!create wallet')) {
  //   const  obj = {
  //     name: msg.author.username,
  //     vol: 0
  //   }
  //   fs.readFile('./data.json', function (err, data) {
  //     let json = JSON.parse(data)
  //     json.push(obj)
  
  //     fs.writeFile("./data.json", JSON.stringify(json))
  //     msg.reply('ยินดีด้วยคุณมีกระเป๋า wallet แล้ว');
  // })
  //   // let data = JSON.stringify(obj);
  //   // if(msg.author.username){

  //   //   fs.writeFileSync('./data.json', data , 'utf-8');
  //   //   msg.reply('ยินดีด้วยคุณมีกระเป๋า wallet แล้ว');
  //   // }
    
  // }
  else if(msg.content.startsWith('!my btc wallet')) {
    msg.reply('คุณมี ' + getRandomInt(1000000) + ' BTC');
    // if(msg.author.username === 'FirsticZ'){
    //   msg.reply('คุณมี ' + getRandomInt(1000000) + ' BTC');
    // }else {
    //   msg.reply('คุณไม่มีกระเป๋า wallet');
    // }
    
  }
  

});
