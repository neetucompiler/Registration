var msgsContainer = $('.messages-content')
var userInputField = $('#userInputText')
var carMake


AWS.config.region = 'eu-west-1'
AWS.config.accessKeyId = 'AKIAIWKA4ANUCART52HQ'
AWS.config.secretAccessKey = '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'

function pollySpeak(params) {
  if (!params['Text']) {
    console.log('Please provide \'Text\' to make polly speak')
    return
  }
  params = {
    OutputFormat: params['OutputFormat'] || 'mp3',
    Text: params['Text'],
    VoiceId: params['VoiceId'] || 'Geraint',
    SampleRate: params['SampleRate'] || '22050',
    TextType: params['TextType'] || 'text'
  }

  var polly = new AWS.Polly({
    apiVersion: '2016-06-10'
  })

  polly.synthesizeSpeech(params, function (err, data) {
    if (err) console.log(err, err.stack) // an error occurred
    var uInt8Array = new Uint8Array(data.AudioStream)
    var arrayBuffer = uInt8Array.buffer
    var blob = new Blob([arrayBuffer])
    var url = URL.createObjectURL(blob)

    $('#pollyAudio > source').attr('src', url)
    $('#pollyAudio')[0].load()
    $('#pollyAudio')[0].play()
  })
}

var mute = false
$('#pollyMute').click(function () {
  $('#pollyMute').css('display', 'none')
  $('#pollySpeak').css('display', 'block')
  mute = false
})
$('#pollySpeak').click(function () {
  $('#pollySpeak').css('display', 'none')
  $('#pollyMute').css('display', 'block')
  mute = true
})

function getBrowser() {
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

function playSound(filename) {
  $('<audio autoplay="autoplay"><source src="../assets/' + filename + '.mp3" type="audio/mpeg" /><source src="../assets/' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="../assets/' + filename + '.mp3" /></audio>').appendTo($('#sound'))
}

function setTimeStamp(customTimeStamp) {
  if ($.trim(customTimeStamp) === '') {
    $('<div class="timestamp">' + formatAMPM(new Date()) + '</div>').appendTo($('.message:last'))
    return false
  }
  $('<div class="timestamp">' + customTimeStamp + '</div>').appendTo($('.message:last'))
}

function setTyping() {
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    console.log('No element found with .mCSB_container')
    return false
  }
  $('<div class="message loading new"><figure class="avatar"><img src="../assets/icon.png" /></figure><span></span></div>').appendTo(correctElement)
  $('<div class="timestamp">Typing...</div>').appendTo($('.message:last'))
  updateScrollbar()
}

function disableUserInput(placeholderText) {
  placeholderText = placeholderText || 'Please Wait...' // Default text
  userInputField.blur() // Remove the focus from the user input field
  userInputField.val('') // Remove the text from the user input field
  userInputField.attr('disabled', 'true') // Disable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to ask the user to wait
  $('.message-box').addClass('disabledCursor')
  $('.message-submit').attr('disabled', 'true')
}

function enableUserInput(placeholderText) {
  placeholderText = placeholderText || 'Please Type!' // Default text
  userInputField.focus() // Remove the focus from the user input field
  userInputField.val('') // Remove the text from the user input field
  userInputField.removeAttr('disabled') // Enable the user input field
  userInputField.attr('placeholder', placeholderText) // Change the placeholder to prompt input from the user
  $('.message-box').removeClass('disabledCursor')
  $('.message-submit').removeAttr('disabled')
}

function insertUserMessage(msg) {
  if ($.trim(msg) === '') {
    return false
  }
  var correctElement = msgsContainer.find('.mCSB_container')
  if (!correctElement.length) {
    return false
  }
  $('<div class="message new message-personal">' + msg + '</div>').appendTo(correctElement)
  setTimeStamp()
  $('.message-input').val('')
  $('.message.loading').remove()
  $('.message.timestamp').remove()
  updateScrollbar()
}

function displayBotMessage(botMessage, timeout, choices) {
  if ($.trim(botMessage) === '') {
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
      $('<div class="message new"><figure class="avatar"><img src="../assets/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
      setTimeStamp()
      $('.message.loading').remove()
      $('.message.timestamp').remove()
      updateScrollbar()
      playSound('bing')
      // if (!mute) {
      //   pollySpeak({
      //     Text: botMessage
      //   })
      // }
    }, timeout)
  } else {
    $('<div class="message new"><figure class="avatar"><img src="../assets/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement)
    setTimeStamp()
    playSound('bing')
    if (!mute) {
      pollySpeak({
        Text: botMessage
      })
    }
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
        $(choicesBotMessage).appendTo(correctElement)
        playSound('bing')
        $('.message.loading').remove()
        $('.message.timestamp').remove()
        updateScrollbar()
      }, timeout)
    } else {
      $(choicesBotMessage).appendTo(correctElement)
      playSound('bing')
    }
    // $('<div class="timestamp">-- Please select your choice --</div>').appendTo('.chatBtnHolder:last');
    // setTimeStamp('-- Please select your choice --');
  }

  $('.message.loading').remove()
  $('.message.timestamp').remove()
  updateScrollbar()
}

function updateScrollbar() {
  msgsContainer.mCustomScrollbar('update').mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  })
}

function formatAMPM(date) {
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours || 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime
}

var setTimeoutID
$('#minim-chat').click(function () {
  $('#minim-chat').css('display', 'none')
  $('#maxi-chat').css('display', 'block')
  // var height = (j(".chat").outerHeight(true) - 46) * -1;
  // j(".chat").css("margin", "0 0 " + height + "px 0");
  $('.chat').css('margin', '0 0 ' + -($('.chat').outerHeight() - $('.chat-title').outerHeight()) + 'px 0')
  setTimeoutID = setTimeout(function () {
    $('#animHelpText').css('display', 'block')
  }, 1500)
})
$('#maxi-chat').click(function () {
  $('#minim-chat').css('display', 'block')
  $('#maxi-chat').css('display', 'none')
  $('.chat').css('margin', '0')
  $('#animHelpText').css('display', 'none')
  clearTimeout(setTimeoutID)
})

var botDialogs = {}
var botDialogsLength

var getJson = $.getJSON('../assets/data_back.json', function (data) {
  $(data).each(function (index, val) {
    botDialogs[val['id']] = val
  })
  botDialogsLength = data.length
})

getJson.error(function (jqxhr, textStatus, error) {
  var err = textStatus + ', ' + error
})

getJson.success(function () {
  msgsContainer.mCustomScrollbar()

  var browser = getBrowser()
  userDataLogger('BrowserName', browser.name)
  userDataLogger('BrowserVersion', browser.version)
  insertBotMessage(1) // Start the botDialogs
})

var nextResponses = []
var choices = []
var botMsgType
var userMsgType, userIptVar
var fnName, correctAnswer
var retryPrompt

// recurring function
function insertBotMessage(id) {
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
        enableUserInput('Hint: What is / How to')
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

function getRandom(arrayResp) {
  var retResponse
  if ($.isArray(arrayResp)) { // its an array
    retResponse = arrayResp[Math.floor((Math.random() * arrayResp.length))]
  } else { // its not an array
    retResponse = arrayResp
  }
  return retResponse
}

function getUserMessageType(botDialog) {
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

function returnChoices(choicesArray) {
  choices = []
  for (var i = 0; i < choicesArray.length; i++) {
    choices.push(getRandom(choicesArray[i].option))
  }
}

function determineNextResponses(botMessage) {
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
      var messageContent = botMessage.botMessage
      userIptVar = botMessage.userInputVar

      if (messageContent.match(/car do you drive/g)) {
        $('#userInputText').autocomplete({
          source: function (request, response) {
            var results = $.ui.autocomplete.filter(Object.keys(Cars), request.term)
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
      } else if (messageContent.match(/model/g)) {
        $('#userInputText').autocomplete({
          source: function (request, response) {
            var results = $.ui.autocomplete.filter(Cars[carMake], request.term)
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
      } else if (messageContent.match(/question/g)) {
        $('#userInputText').autocomplete({
          source: function (request, response) {
            var results = $.ui.autocomplete.filter(Object.keys(faq), request.term)
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
              correctAnswer = faq[ui.item.value]
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
      $('#userInputText').datepicker({
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

function choiceClick(selectedChoice) {
  msgsContainer.find('.chatBtn').attr('disabled', true) // disable all the buttons in the messages window
  insertUserMessage(choices[selectedChoice])
  insertBotMessage(nextResponses[selectedChoice])
}

function isValidEmail(email) {
  var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/
  return re.test(email)
}

function isValidString(str) {
  if (str !== undefined && str !== null && str !== '' && $.trim(str) !== '') {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str)
  } else {
    return false
  }
}

function isValidNumber(str) {
  return !isNaN(str)
}

function isValidDate(str) {
  $('#userInputText').datepicker('destroy')
  return true
}

function isValidCarRegNo(carRegNo) {
  if (carRegNo !== undefined && carRegNo !== null && carRegNo !== '' && $.trim(carRegNo) !== '') {
    var vehicleNo = carRegNo.split('-')
    if (vehicleNo.length === 4) {
      if (vehicleNo[0].length === 2 && vehicleNo[1].length === 2 && vehicleNo[2].length === 2 && vehicleNo[3].length === 4 &&
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

function isValidCar(car) {
  if (car !== undefined && car !== null && car !== '' && $.trim(car) !== '') {
    if (Cars.hasOwnProperty(car)) {
      carMake = car
      $('#userInputText').autocomplete('destroy')
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function isValidCarModel(model) {
  if (model !== undefined && model !== null && model !== '' && $.trim(model) !== '' && carMake !== undefined && carMake !== null) {
    if (Cars[carMake].indexOf(model) >= 0) {
      $('#userInputText').autocomplete('destroy')
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function generateRandomName() {
  var randomGender = Math.floor(Math.random() * 2)
  var males = ['Sathish', 'Robert', 'Dhanish', 'Parker', 'Zeeshan', 'Vinay', 'Rathod', 'Vijayan', 'Aashish', 'Bharath', 'Ajith', 'Nithin', 'Ramesh']
  var females = ['Aarthi', 'Aswathy', 'Swathy', 'Trisha', 'Gayathri', 'Nivethitha', 'Shruthi', 'Yamini', 'Preethi', 'Dharini', 'Sindhuja']
  var randomName
  if (randomGender === 1) {
    randomName = 'Mr.' + males[Math.floor(Math.random() * males.length)]
  } else {
    randomName = ((Math.random() < 0.5) ? 'Mrs.' : 'Ms.') + females[Math.floor(Math.random() * females.length)]
  }
  return randomName
}

function validate() {
  var userInputText = userInputField.val()
  switch (userMsgType) {
    case 'text':
      if (isValidString(userInputText)) {
        userDataLogger(userIptVar, userInputText)
        insertUserMessage(userInputText)
        insertBotMessage(nextResponses[0])
        retryPrompt = ''
      } else {
        displayBotMessage(retryPrompt)
      }
      break

    case 'number':
      if (isValidNumber(userInputText)) {
        userDataLogger(userIptVar, userInputText)
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
          userDataLogger(userIptVar, userInputText)
          insertUserMessage(userInputText)
          insertBotMessage(nextResponses[0])
          retryPrompt = ''
        } else {
          if (!$('.message.new:last').text().match(/car make/g)) {
            displayBotMessage(retryPrompt)
          }
        }
      } else {
        console.log('There was no function with the function name "' + fnName + '" defined.')
      }
      break

    case 'year':
      if (isValidDate(userInputText)) {
        userDataLogger(userIptVar, userInputText)
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
        displayBotMessage(correctAnswer)
        correctAnswer = 'Please select your question from the given list.'
      }, 500)
      break

    default:
      console.log('userMsgType not found: ' + userMsgType)
      break
  }
  return false
}

var logger = {}
// store user data in a varible to display
function userDataLogger(inputKey, inputValue) {
  logger[inputKey] = inputValue
  console.log(logger)
}

$('#generalForm').bind('submit', validate)

$(document).ready(function () {
  var clickDisabled = false
  $('.buy-insurance-btn').click(function () {
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