//declaring some global variables
global.socketId;
global.sockets = [];


/////////////////////////////////////////////// CONSOLE BOT /////////////////////////////////////////////////////////
var Botkit = require(__dirname + '/node_modules/botkit/lib/CoreBot.js')
var readline = require('readline')


function TextBot(configuration) {
  // Create a core botkit bot
  var text_botkit = Botkit(configuration || {})
  text_botkit.middleware.spawn.use(function (bot, next) {
    text_botkit.listenStdIn(bot)
    next()
  })

  text_botkit.middleware.format.use(function (bot, message, platform_message, next) {
    // clone the incoming message
    for (var k in message) {
      platform_message[k] = message[k];
    }
    next()
  })

  text_botkit.defineBot(function (botkit, config) {
    var bot = {
      botkit: botkit,
      config: config || {},
      utterances: botkit.utterances,
    }

    bot.createConversation = function (message, cb) {
      botkit.createConversation(this, message, cb);
    }

    bot.startConversation = function (message, cb) {
      botkit.startConversation(this, message, cb);
    }

    bot.send = function (message, cb) {
      console.log('BOT:', message.text);
      if (cb) {
        cb()
      }
    }

    bot.reply = function (src, resp, cb) {
      var msg = {}

      if (typeof (resp) == 'string') {
        msg.text = resp
      } else {
        msg = resp
      }

      msg.channel = src.channel
      bot.say(msg, cb)
    }

    bot.findConversation = function (message, cb) {
      botkit.debug('CUSTOM FIND CONVO', message.user, message.channel);
      for (var t = 0; t < botkit.tasks.length; t++) {
        for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
          if (
            botkit.tasks[t].convos[c].isActive() &&
            botkit.tasks[t].convos[c].source_message.user == message.user
          ) {
            botkit.debug('FOUND EXISTING CONVO!');
            cb(botkit.tasks[t].convos[c]);
            return;
          }
        }
      }

      cb()
    }

    return bot
  })

  text_botkit.listenStdIn = function (bot) {
    text_botkit.startTicking()

    //ADDED BY AKASH START
    io.on('connection', function (socket) {
      console.log(socket.id)
      global.socketId = socket.id;
      global.sockets[socket.id] = socket;
      //console.log(global.sockets);
      console.log("A user connected");
      socket.on('disconnect', function () {
        console.log("User disconnected")
      })


      socket.on('chat message', function (data) {
        console.log("The id is " + global.socketId + " , " + socket.id + "<br><br>and the message received is " + data.msg)
        var message = {
          text: data.msg,
          user: 'user',
          channel: 'text',
          timestamp: Date.now(),
          sender: socket.id
        }







        console.log("THIS IS THE MESSAGE THAT IS BEING FORMED" + JSON.stringify(message, null, 2)) //WRITTEN BY AKASH
        text_botkit.ingest(bot, message, null)

      })
    })

    // var rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    // rl.on('line', function(line) {
    //     var message = {
    //         text: line,
    //         user: 'user',
    //         channel: 'text',
    //         timestamp: Date.now()
    //     };

    //Added by akash



    //});
  };
  return text_botkit;
}

module.exports = TextBot;



////////////////////////// MAIN APPLICATIONS CODE ///////////////////////////////////
var express = require('express');
var botkit = require('botkit');
var bodyparser = require('body-parser');
var session = require('express-session')
var luisMiddleware = require('botkit-middleware-luis');
var app = express();
var PORT = process.env.PORT || 4000;
var server = app.listen(PORT, () => {
  console.log("Bot listening...");
});
var io = require('socket.io').listen(server);
global.uni_flag = 0
// //defining some macros to bring delay in message display
// var macro = require('macro');
// macro.register();
// macro.define('global.sockets[message.raw_message.sender].emit', (event, message, node) => {
//     return setTimeout(function(){
//         global.sockets[message.raw_message.sender].emit('chat message', message);
//     }, 1000);
// });


app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'IkeaLuisBot',
  saveUninitialized: true
}));
app.use(bodyparser.urlencoded({
  extended: true
}));

//Authentication function with a basic session
auth = function auth(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else {
    return res.send("You are not authorized to access this area.\nPlease login with the correct credentials and try again.");
  }
};




//defining the type of bot
var controller = botkit.consolebot({
  debug: true,
  log: true
});


//Instantiating the bot
var bot = controller.spawn();

// io.on('connection', (socket) => {
//     console.log("A user connected "+socket.id);
//     socket.on('disconnect', () => {
//         console.log("User disconnected");
//     });
// });
//Giving the URL for the LUIS endpoint
var luisOptions = {
  serviceUri: "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e0d68c28-d9a8-4278-b8c1-d192d6faf300?subscription-key=00bf42aa30a24909814bb31ca41bcbd7&verbose=true&timezoneOffset=0&q="
};

//Declaring to use the luis middleware instead of the default middleware for message handling
controller.middleware.receive.use(luisMiddleware.middleware.receive(luisOptions));

controller.hears('.*', ['direct_message', 'message_received', 'direct_mention', 'mention'], luisMiddleware.middleware.hereIntent, function (bot, message) {
  bot.reply(message, "LUIS identified the intent");
  console.log("This is the message being received " + JSON.stringify(message, null, 2));
  // console.log("This is the top intent "+message.topIntent.intent.toLowerCase());
  if (message.topIntent) {
    var topIntent = message.topIntent.intent;


    //DEFINING RESPONSES FOR EACH OF THE INTENTS
    if (topIntent == 'Greeting') {
      //global.sockets[message.raw_message.sender].emit('chat message', "You have reached the greeting intent, you said "+session.message.text);
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"Well, hello there!", first:true, last:true});
    } else if (topIntent == 'pageNotLoading') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"Please follow these steps to recover PWA from not loading properly:<br><li>Go to Tools Menu in IE > Internet Options > Security > Trusted Sites > sites</li>", first:true});
      global.sockets[message.raw_message.sender].emit('chat message', '<a href="guide_images/1_scrn.png" target="_blank"><img src="guide_images/1_scrn.png" width="225" height="200"></a>');
      global.sockets[message.raw_message.sender].emit('chat message', '<li>In the pop up type the below URL’s and add them one by one:<br>a.<a style="color: rgb(239, 220, 52)" href="https://iweof.sharepoint.com/sites/pwa-purpo/" target="_blank">https://iweof.sharepoint.com/sites/pwa-purpo/</a><br>b.<a style="color: rgb(239, 220, 52)" href="https://iweof-myfiles.sharepoint.com/" target="_blank">https://iweof-myfiles.sharepoint.com/</a><br>c.<a style="color: rgb(239, 220, 52)" href="https://iweof.sharepoint.com/" target="_blank">https://iweof.sharepoint.com/</a><br>d.<a href="https://iweof-files.sharepoint.com/" style="color: rgb(239, 220, 52)" target="_blank">https://iweof-files.sharepoint.com/</a><br></li><li>Close the pop-ups</li><li>Now go to Tools >Internet Options > advanced tab.</li><li>Click on restore advanced settings.</li>');
      global.sockets[message.raw_message.sender].emit('chat message', "Try accessing PWA and check if the page loads as expected. If not make sure the trusted sites are added properly.");
      global.sockets[message.raw_message.sender].emit('chat message', "If problem persists click on Tools > Internet Options > advanced tab > Reset.");
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/1.1_scrn.png" target="_blank"><img src="guide_images/1.1_scrn.png" width="225" height="200"></a>', last: true});
    } else if (topIntent == 'cantEditActionPlan') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"This might resolve your issue.", first:true});
      global.sockets[message.raw_message.sender].emit('chat message', "The reason was that one step was missed from the process. After Building the Team and saving, the information needs to be Published (from the Action page).");
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"<br><li>The Build Team option can be found on the top menu / Project no matter on what page you are (Supplier Info, KPI Goal Setting, Actions, SWOT or Risk page). You can also land on the Build Team page by Ctrl+Shift+B.</li><br><li>Select the users from the left side and Add them to the right (to the project/APL).</li><br><li>Once you have selected and added the users click on Save & Close button on the top menu / Project tab.</li><br><li>Then go to Actions / Task tab on the top menu and click Publish.</li>", last:true});

      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/2_src.png" target="_blank"><img src="guide_images/2_src.png" width="225" height="200"></a>', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"If the BD/BDM has done all these steps and still you (Supply Planner / Production Engineer) can’t edit the Actions, then contact your APL facilitator to check your access rights in the tool.", last:true});
    } else if (topIntent == 'actionPlanFollowUp') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"The tool is not available for Suppliers now (it will happen in the future). But for now the KPIs and Actions can be exported as pdf from reports and shown to the supplier.", first:true, last:true});
    } else if (topIntent == 'BusinessDevSupplyPlannerDifference') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Business Developers and Business Development Managers have write access and Supply Planners and Production Engineers edit access.', first:true})
      global.sockets[message.raw_message.sender].emit('chat message', 'Business Developers and Business Development Managers Write access <li>Create Supplier Action Plans</li><li>Build Team</li><li>Register/Edit KPIs</li><li>Register/Edit Actions</li><li>Register/Edit SWOT</li><li>Register/Edit Risks</li>');
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Supply Planners and Production Engineers <li>Edit access</li><li>Register/Edit KPIs</li><li>Register/Edit Actions</li><li>Register/Edit SWOT</li><li>Register/Edit SWOT</li><li>Register/Edit Risks</li>Only for the Supplier Action Plans they have been added through the Build Team functionality', last:true});
    } else if (topIntent == 'KPIReport') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'In the reports you go to Sup View and you can add as filter either the BD name or the supplier numbers (all supplier numbers that a BD has) and that is how you see the KPIs for all the suppliers belonging to one BD. Same for Actions.', first:true, last:true});
    } else if (topIntent == 'multipleYearsAction') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Actions should have the start and end date during the Financial Year, and in these cases the action needs to be created again when a new Action Plan is created.', first:true, last:true});
    } else if (topIntent == 'maxCharacters') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'255 Characters.', first:true, last:true});
    } else if (topIntent == 'KPIGoalSettingDecimals') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'The system allows 2 decimals for all the KPI cells.', first:true, last:true});
    } else if (topIntent == 'CheckInCheckOut') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'When you create a new Action Plan you are the owner of that project and automatically, the Action Plan is Checked out to you (this means that you can edit it).<br><br>An Action Plan can be checked out to someone (or to you) for editing and this means that it is locked by that person (or you) for editing.', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', '<a href="guide_images/9_srn.png" target="_blank"><img src="guide_images/9_srn.png" width="225" height="200"></a>');
      global.sockets[message.raw_message.sender].emit('chat message', 'After you edit an Action Plan, you need to Check in the Action Plan so that it can be edited by other users (top menu / Project tab / Close).');
      global.sockets[message.raw_message.sender].emit('chat message', '<a href="guide_images/9.1_scrn.png" target="_blank"><img src="guide_images/9.1_scrn.png" width="225" height="200"></a>');
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'When you access the project again in order to check it out for editing go to the top menu / Project tab / Edit icon.', last:true});
    } else if (topIntent == 'checkpointStatus') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Checkpoint status is a functionality that can be used during the creation phase to check the KPIs on Business Navigation level. The field is optional.<br><br>For example: if the agreement is to have 2 check points before submitting to the next phase, select the 2 Checkpoints row in that box. When you are ready with your KPIs to be checked for the first time during the Creation Phase select the Ready for Checkpoint 1 (the 4th row in this example). And then for the second revision the 5th row in this case: Ready for checkpoint 2.', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/20_scrn.png" target="_blank"><img src="guide_images/20_scrn.png" width="225" height="200"></a>', last:true});
    } else if (topIntent == 'seeActionPlanWhenStatusClosed') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'When you open a Closed Action Plan and go to Actions you will land on this page. To view the Actions click on Actions Details.', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', '<a href="guide_images/11_scrn.png" target="_blank"><img src="guide_images/11_scrn.png" width="225" height="200"></a>');
      global.sockets[message.raw_message.sender].emit('chat message', 'The actions are visible when the Action Plan is closed but they can’t be edited anymore.');
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/11.1_scrn.png" target="_blank"><img src="guide_images/11.1_scrn.png" width="225" height="200"></a>', last:true});
    } else if (topIntent == 'cantPasteTextInAction') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'This functionality is not available in this version of the tool.', first:true, last:true});
    } else if (topIntent == 'warpText') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'This functionality is not available in this version of the tool.', first:true, last:true});
    } else if (topIntent == 'changeActionPlanOwner') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Yes, the Facilitator / Super User can change the owner of the APL at any stage. After the owner is changed and if he/she is responsible for some actions you need to add his name also in the Build team and then change the Action Responsible in the Actions page.', first:true, last:true});
    } else if (topIntent == 'changeActionResponsible') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'During the year you can change the members working on an Action Plan from Build Team. There users can be added or removed at any stage of the Action Plan (except when the Action Plan is in status closed).', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', 'After changing the names in the Build Team the Action responsible needs to be changed as well in the Actions page.');
      global.sockets[message.raw_message.sender].emit('chat message', '<a href="guide_images/12_scrn.png" target="_blank"><img src="guide_images/12_scrn.png" width="225" height="200"></a>');
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'The information about the Business Team Members shown on the Supplier Info page of the Action Plan is not related to the Build Team. That information comes from the Global KPI report and the data from that report is being updated almost every month.', last:true});
    } else if (topIntent == 'OTDSenderDirectSupplyNotShown') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Pay attention that the value entered in the las cell of each section is registered (click Tab, Enter or move to another cell and make sure the value is in the right format). If it doesn’t show in the right format it will not be saved.', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/16_scrn.png" target="_blank"><img src="guide_images/16_scrn.png" width="225" height="200"></a>', last:true});
    } else if (topIntent == 'addUsersToBuildTeam') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Yes, the Build Team functionality is per each Supplier Action Plan (not for all the suppliers under the same BDM).', first:true, last:true});

    } else if (topIntent == 'deleteActions') {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Yes, actions can be deleted no matter the stage of and Action Plan (Creation, Forecast or Follow-up). And actions can be deleted by all users that have write or edit access to the tool.<br><br><br><br>Instead of deleting Actions during the Financial Year we recommend to use the status Cancelled in Action Status field and to add comments on the reason the Action was cancelled. But if there is a need to delete an Action then this can be done from the Top menu / Task tab / Delete Action.', first:true});
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'<a href="guide_images/18_scrn.png" target="_blank"><img src="guide_images/18_scrn.png" width="225" height="200"></a>', last:true});
    } else if (topIntent == 'None') {
      //global.sockets[message.raw_message.sender].emit('chat message', "You have reached the greeting intent, you said "+session.message.text);
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Sorry, I do not understand. Please contact our support team at <u><a style="color: blue" href="http://www.ikea.com/gb/en/customer-service/contact-us/" target="_blank">Ikea Support</a></u>.', first:true, last:true});

    } else if (topIntent == 'Help') {
      //global.sockets[message.raw_message.sender].emit('chat message', "You have reached the greeting intent, you said "+session.message.text);
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"I am Ikea bot and I can help clear your doubts on any topic related to the dunctions in the company. Please feel free to ask anything that you like.", first:true});
      global.sockets[message.raw_message.sender].emit('chat message', {msg:"You can ask stuff like \"What is the difference between a supply manager and a business developer?\"; or<br>\"How can I delete actions?\";or<br>\"What is the maximum number of characters in the action descriptioon field?\"; or anything else.", last:true});

    } else {
      global.sockets[message.raw_message.sender].emit('chat message', {msg:'Sorry, I do not understand. Please contact our support team at <u><a style="color: blue" href="http://www.ikea.com/gb/en/customer-service/contact-us/" target="_blank">Ikea Support</a></u>.', first:true, last:true});
    }
  } else {
    global.sockets[message.raw_message.sender].emit('chat message', {msg:'Sorry, I do not understand. Please contact our support team at <u><a style="color: blue" href="http://www.ikea.com/gb/en/customer-service/contact-us/" target="_blank">Ikea Support</a></u>.', first:true, last:true});
  }

});

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/home', (req, res) => {
  res.sendFile(__dirname + "/home_backup.html");
});

app.post('/login', (req, res, next) => {
  //temporary fix for unknown error. Delete later
  req.session.admin = true;
  res.redirect('/home');
  //

  if (!req.body.password) {
    res.send("Login Failed. Please try again.");
  } else if (req.body.password === "teamIsAwesome") {
    req.session.admin = true;
    res.redirect('/home');
  } else {
    res.send("Login failed. Please try again.")
  }
});

app.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
})