var msgsContainer = jQ('.messages-content')
var index = 0
var userInputField, car_make, car_model

function get_browser () {
  var ua = navigator.userAgent
  var tem
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || []
    return {
      name: 'IE',
      version: (tem[1] || '')
    }
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/)
    if (tem != null) {
      return {
        name: 'Opera',
        version: tem[1]
      }
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1])
  }
  return {
    name: M[0],
    version: M[1]
  }
}

function playSound (filename) {
  jQ('<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3" /></audio>').appendTo(jQ('#sound'))
}

function setTimeStamp (customTimeStamp) {
  if (jQ.trim(customTimeStamp) === '') {
    jQ('<div class="timestamp">' + formatAMPM(new Date()) + '</div>').appendTo(jQ('.message:last'))
    return false
  }
  jQ('<div class="timestamp">' + customTimeStamp + '</div>').appendTo(jQ('.message:last'))
}

function setTyping () {
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    console.log('No element found with .mCSB_container')
    return false
  }
  jQ('<div class="message loading new"><figure class="avatar"><img src="icon.png" /></figure><span></span></div>').appendTo(correctElement)
  jQ('<div class="timestamp">Typing...</div>').appendTo(jQ('.message:last'))
  updateScrollbar()
}

function disableUserInput (placeholderText) {
  placeholderText = placeholderText || 'Please Wait...' // Default text
  userInputField.blur() // Remove the focus from the user input field
  userInputField.val('') // Remove the text from the user input field
  userInputField.attr('disabled', 'true') // Disable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to ask the user to wait
  jQ('.message-box').addClass('disabledCursor')
  jQ('.message-submit').attr('disabled', 'true')
  // console.log("disabled user input");
}

function enableUserInput (placeholderText) {
  placeholderText = placeholderText || 'Please Type!' // Default text
  userInputField.focus() // Remove the focus from the user input field
  userInputField.removeAttr('disabled') // Enable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to prompt input from the user
  jQ('.message-box').removeClass('disabledCursor')
  jQ('.message-submit').removeAttr('disabled')
  // console.log("enabled user input");
}

function insertUserMessage (msg) {
  if (jQ.trim(msg) === '') {
    console.log('The msg parameter was empty or null')
    return false
  }
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    console.log('No element found with .mCSB_container')
    return false
  }
  jQ('<div class="message new message-personal">' + msg + '</div>').appendTo(correctElement)
  setTimeStamp()
  jQ('.message-input').val('')
  jQ('.message.loading').remove()
  jQ('.message.timestamp').remove()
  updateScrollbar()
}

function displayBotMessage (botMessage, timeout, choices) {
  if (jQ.trim(botMessage) === '') {
    return false
  }
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    return false
  }
  if (timeout) {
    setTimeout(function () {
      setTyping()
    }, timeout / 2)
    setTimeout(function () {
      jQ('<div class="message new"><figure class="avatar"><img src="icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
      setTimeStamp()
      jQ('.message.loading').remove()
      jQ('.message.timestamp').remove()
      updateScrollbar()
      playSound('bing')
    }, timeout)
  } else {
    jQ('<div class="message new"><figure class="avatar"><img src="icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
    setTimeStamp()
    playSound('bing')
  }

  // if the choices exists and has atleast 2 choices
  if (choices !== undefined && choices.length > 1) {
    var choicesBotMessage = '<div class="chatBtnHolder new">'
    for (var i = 0; i < choices.length; i++) {
      // choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + choices[i].replace(/'/g, "\\'") + '\')" value="' + choices[i] + '">' + choices[i] + '</button>';
      choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + i + '\')" value="' + choices[i] + '">' + choices[i] + '</button>'
    }
    choicesBotMessage += '</div>'
    if (timeout) {
      setTimeout(function () {
        jQ(choicesBotMessage).appendTo(correctElement)
        playSound('bing')
        jQ('.message.loading').remove()
        jQ('.message.timestamp').remove()
        updateScrollbar()
      }, timeout)
    } else {
      jQ(choicesBotMessage).appendTo(correctElement)
      playSound('bing')
    }
    // jQ('<div class="timestamp">-- Please select your choice --</div>').appendTo('.chatBtnHolder:last');
    // setTimeStamp('-- Please select your choice --');
  }

  jQ('.message.loading').remove()
  jQ('.message.timestamp').remove()
  updateScrollbar()
}

function updateScrollbar () {
  msgsContainer.mCustomScrollbar('update').mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  })
}

function formatAMPM (date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

var setTimeoutID
jQ('#minim-chat').click(function () {
  jQ('#minim-chat').css('display', 'none')
  jQ('#maxi-chat').css('display', 'block')
  // var height = (j(".chat").outerHeight(true) - 46) * -1;
  // j(".chat").css("margin", "0 0 " + height + "px 0");
  jQ('.chat').css('margin', '0 0 -354px 0')
  setTimeoutID = setTimeout(function () {
    jQ('#animHelpText').css('display', 'block')
  }, 1500)
})
jQ('#maxi-chat').click(function () {
  jQ('#minim-chat').css('display', 'block')
  jQ('#maxi-chat').css('display', 'none')
  jQ('.chat').css('margin', '0')
  jQ('#animHelpText').css('display', 'none')
  clearTimeout(setTimeoutID)
})

var botDialogs = {},
  botDialogsLength

var getJson = jQ.getJSON('data_back.json', function (data) {
  jQ(data).each(function (index, val) {
    botDialogs[val['id']] = val
  })
  botDialogsLength = data.length
})

getJson.error(function (jqxhr, textStatus, error) {
  var err = textStatus + ', ' + error
  console.log('Request Failed: ' + err)
})

getJson.success(function () {
  userInputField = jQ('#userInputText')
  msgsContainer.mCustomScrollbar()

  var browser = get_browser()
  // console.log("Browser Name: " + browser.name);
  // console.log("Browser Version: " + browser.version);

  insertBotMessage(1) // Start the botDialogs
})

var nextResponses = [],
  choices = [],
  botMsgType,
  userMsgType, userIptVar,
  fnName, correct_answer,
  retryPrompt

// recurring function
function insertBotMessage (id) {
  if (id > 0 && id <= botDialogsLength) { // check if the id is valid
    botMsgType = botDialogs[id].botMessageType // determine the botMsgType
    userMsgType = getUserMessageType(botDialogs[id]) // determine the userMsgType
    retryPrompt = botDialogs[id].retryPrompt ? getRandom(botDialogs[id].retryPrompt) : 'Please enter the correct input.' // determine the retryPrompt
    switch (botMsgType) {

      case 'text':
        displayBotMessage(getRandom(botDialogs[id].botMessage), 2000)
        determineNextResponses(botDialogs[id])
        enableUserInput('Please type!')
        break

      case 'confirm':
        choices = ['yes', 'no']
        displayBotMessage(getRandom(botDialogs[id].botMessage), 2000, choices)
        determineNextResponses(botDialogs[id])
        disableUserInput('Please select yes/no above')
        break

      case 'choice':
        returnChoices(botDialogs[id].choice)
        displayBotMessage(getRandom(botDialogs[id].botMessage), undefined, choices)
        determineNextResponses(botDialogs[id])
        disableUserInput('Please select your Choice above')
        break

      case 'dialog':
        displayBotMessage(botDialogs[id].botMessage)
        determineNextResponses(botDialogs[id])
        insertBotMessage(nextResponses[0])
        break

      case 'autocomplete':
        enableUserInput('Please type!')
        displayBotMessage(botDialogs[id].botMessage)
        determineNextResponses(botDialogs[id])
        break

      case 'year':
        enableUserInput('Please pick DD-MM-YYYY!')
        displayBotMessage(botDialogs[id].botMessage)
        determineNextResponses(botDialogs[id])
        break

      default:
        console.log('Unknown botMsgType !!')
        break
    }
    if (botDialogs[id].imageURL) {

    }
  } else {}
}

function getRandom (arrayResp) {
  var retResponse
  if (jQ.isArray(arrayResp)) { // its an array
    retResponse = arrayResp[Math.floor((Math.random() * arrayResp.length))]
  } else { // its not an array
    retResponse = arrayResp
  }
  return retResponse
}

function getUserMessageType (botDialog) {
  var retUserMsgType
  if (botDialog.userMessageType && botMsgType !== 'dialog') {
    retUserMsgType = botDialog.userMessageType // determine the userMsgType
    if (/<fn>/.test(retUserMsgType)) {
      fnName = retUserMsgType.split('<fn>')[1]
      retUserMsgType = 'function'
    } else {
      fnName = undefined
    }
  } else {
    retUserMsgType = undefined
  }
  return retUserMsgType
}

function returnChoices (choicesArray) {
  choices = []
  for (var i = 0; i < choicesArray.length; i++) {
    choices.push(getRandom(choicesArray[i].option))
  }
}

function determineNextResponses (botMessage) {
  nextResponses = []
  switch (botMsgType) {
    case 'text':
      nextResponses[0] = botMessage.nextResponse
      userIptVar = botMessage.userInputVar
      break

    case 'choice':
      for (var i = 0; i < botMessage.choice.length; i++) {
        nextResponses.push(botMessage.choice[i].nextResponse)
      }
      break

    case 'confirm':
      nextResponses = botMessage.nextResponse
      break

    case 'dialog':
      nextResponses[0] = botMessage.nextResponse
      break

    case 'autocomplete':
      message_content = botMessage.botMessage
      userIptVar = botMessage.userInputVar

      if (message_content.match(/car do you drive/g)) {
        jQ('#userInputText').autocomplete({
          source: function (request, response) {
            var results = jQ.ui.autocomplete.filter(Object.keys(Cars), request.term)
            response(results.slice(0, 10))
          },
          multiple: true,
          maxResults: 10,
          mustMatch: true,
          position: {
            my: 'left bottom-15',
            at: 'left bottom-15',
            of: '#userInputText',
            collision: 'fit'
          },
          messages: {
            noResults: '',
            results: function () {}
          }
        })
      } else if (message_content.match(/model/g)) {
        jQ('#userInputText').autocomplete({
          source: function (request, response) {
            var results = jQ.ui.autocomplete.filter(Cars[car_make], request.term)
            response(results.slice(0, 10))
          },
          maxResults: 10,
          multiple: true,
          mustMatch: true,
          position: {
            my: 'left bottom-15',
            at: 'left bottom-15',
            of: '#userInputText',
            collision: 'flip'
          },
          messages: {
            noResults: '',
            results: function () {}
          }
        })
      } else if (message_content.match(/question/g)) {
        jQ('#userInputText').autocomplete({
          source: function (request, response) {
            var results = jQ.ui.autocomplete.filter(Object.keys(faq), request.term)
            response(results.slice(0, 10))
          },
          maxResults: 10,
          multiple: true,
          mustMatch: true,
          position: {
            my: 'left bottom-15',
            at: 'left bottom-15',
            of: '#userInputText',
            collision: 'flip'
          },
          select: function (event, ui) {
            if (ui.item.value in faq) {
              correct_answer = faq[ui.item.value]
            }
          },
          messages: {
            noResults: '',
            results: function () {}
          }
        })
      }

      nextResponses[0] = botMessage.nextResponse
      break

    case 'year':
      userIptVar = botMessage.userInputVar
      jQ('#userInputText').datepicker({
        changeMonth: true,
        changeYear: true
      })

      nextResponses[0] = botMessage.nextResponse
      break

    default:
      console.log('Unknown botMsgType 2 !!')
      break
  }
}

function choiceClick (selectedChoice) {
  msgsContainer.find('.chatBtn').attr('disabled', true) // disable all the buttons in the messages window
  insertUserMessage(choices[selectedChoice])
  insertBotMessage(nextResponses[selectedChoice])
}

function isValidEmail (email) {
  var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/
  return re.test(email)
}

function isValidString (str) {
  if (str !== undefined && str !== null && str !== '' && jQ.trim(str) !== '') {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str)
  } else {
    return false
  }
}

function isValidNumber (str) {
  return !isNaN(str)
}

function isValidDate (str) {
  jQ('#userInputText').datepicker('destroy')
  return true
}

function isValidCarRegNo (carRegNo) {
  if (carRegNo !== undefined && carRegNo !== null && carRegNo !== '' && jQ.trim(carRegNo) !== '') {
    var vehicleNo = carRegNo.split('-')
    if (vehicleNo.length == 4) {
      if (vehicleNo[0].length == 2 && vehicleNo[1].length == 2 && vehicleNo[2].length == 2 && vehicleNo[3].length == 4 &&
        isNaN(vehicleNo[0]) && isNaN(vehicleNo[2]) && !isNaN(vehicleNo[1]) && !isNaN(vehicleNo[3])) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

function isValidCar (car) {
  console.log('inside isValidCar')
  if (car !== undefined && car !== null && car !== '' && jQ.trim(car) !== '') {
    if (Cars.hasOwnProperty(car)) {
      car_make = car
      jQ('#userInputText').autocomplete('destroy')
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function isValidCarModel (model) {
  if (model !== undefined && model !== null && model !== '' && jQ.trim(model) !== '' && car_make !== undefined && car_make !== null) {
    if (Cars[car_make].indexOf(model) >= 0) {
      jQ('#userInputText').autocomplete('destroy')
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function generateRandomName () {
  var randomGender = Math.floor(Math.random() * 2)
  var males = ['Sathish', 'Robert', 'Dhanish', 'Parker', 'Zeeshan', 'Vinay', 'Rathod', 'Vijayan', 'Aashish', 'Bharath', 'Ajith', 'Nithin', 'Ramesh']
  var females = ['Aarthi', 'Aswathy', 'Swathy', 'Trisha', 'Gayathri', 'Nivethitha', 'Shruthi', 'Yamini', 'Preethi', 'Dharini', 'Sindhuja']
  var randomName
  if (randomGender == 1) {
    randomName = 'Mr.' + males[Math.floor(Math.random() * males.length)]
  } else {
    randomName = ((Math.random() < 0.5) ? 'Mrs.' : 'Ms.') + females[Math.floor(Math.random() * females.length)]
  }
  return randomName
}

function validate () {
  var userInputText = userInputField.val()
  switch (userMsgType) {

    case 'text':
      if (isValidString(userInputText)) {
        console.log('valid text')
        assignCarVariable(userIptVar, userInputText)

        insertUserMessage(userInputText)
        insertBotMessage(nextResponses[0])
        retryPrompt = ''
      } else {
        displayBotMessage(retryPrompt)
      }
      break

    case 'number':
      if (isValidNumber(userInputText)) {
        console.log('valid number')
        assignCarVariable(userIptVar, userInputText)

        insertUserMessage(userInputText)
        insertBotMessage(nextResponses[0])

        retryPrompt = ''
      } else {
        displayBotMessage(retryPrompt)
      }
      break

    case 'function':
      if (typeof window[fnName] === 'function') {
        if (window[fnName](userInputText)) { // Test if the user defined function validates true for the userInput given.
          console.log('The function "' + fnName + '" returned true.')
          assignCarVariable(userIptVar, userInputText)
          insertUserMessage(userInputText)
          insertBotMessage(nextResponses[0])
          retryPrompt = ''
        } else {
          if (!jQ('.message.new:last').text().match(/car make/g)) {
            displayBotMessage(retryPrompt)
          }
        }
      } else {
        console.log('There was no function with the function name "' + fnName + '" defined.')
      }
      break

    case 'year':
      if (isValidDate(userInputText)) {
        assignCarVariable(userIptVar, userInputText)
        insertUserMessage(userInputText)
        insertBotMessage(nextResponses[0])

        retryPrompt = ''
      } else {
        displayBotMessage(retryPrompt)
      }
      break

    case 'autocomplete':
      insertUserMessage(userInputText)
      setTimeout(function () {
        displayBotMessage(correct_answer)
        correct_answer = 'Please select your question from the given list.'
      }, 500)
      break

    default:
      console.log('userMsgType not found: ' + userMsgType)
      break
  }
  return false
}

cars = {}
// store user input in a varible to display
function assignCarVariable (uInputVar, uInputText) {
  cars[uInputVar] = uInputText
  console.log(cars)
}

jQ('#generalForm').bind('submit', validate)

jQ(document).ready(function () {
  var clickDisabled = false
  jQ('.buy-insurance-btn').click(function () {
    if (clickDisabled) {
      return
    }
    insertBotMessage(4)
    clickDisabled = true
    setTimeout(function () {
      clickDisabled = false
    }, 10000)
  })
})
