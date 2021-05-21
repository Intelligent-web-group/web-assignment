let name = null;
let roomNo = null;
let socket = null;
let chat = io.connect('/chat');
let news = io.connect('/news');
const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

window.chat = chat

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
  let type= document.getElementById("myType").value;
  if (type) {
    let config = {
      'limit': 10,
      'languages': ['en'],
      'types': [type],
      'maxDescChars': 100,
      'selectHandler': selectItem,
    }
    KGSearchWidget(apiKey, document.getElementById("myInput"), config);
    document.getElementById('typeSet').innerHTML= 'of type: '+type;
    document.getElementById('widget').style.display='block';
    document.getElementById('typeForm').style.display= 'none';
  }
  else {
    alert('Set the type please');
    document.getElementById('widget').style.display='none';
    document.getElementById('resultPanel').style.display='none';
    document.getElementById('typeSet').innerHTML= '';
    document.getElementById('typeForm').style.display= 'block';
  }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
  let row= event.row;
  row.id = 'id: '+row.id;
  addToResults(row);
  storeAnnotationData({roomNo: roomNo, id:'id: '+row.id, name: row.name, rc: row.rc, gc: row.qc})
}

/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
  // it sets up the interface so that userId and room are selected
  document.getElementById('initial_form').style.display = 'block';
  document.getElementById('chat_interface').style.display = 'none';
  initChatSocket();
  initNewsSocket();

  //@todo here is where you should initialise the socket operations as described in teh lectures (room joining, chat message receipt etc.)
}

/**
 * called to init the chat history
 * @param roomNo
 * @returns {Promise<void>}
 * load the data in the indexedDB and show thr chat history when the user enter the room
 */

async function initChatHistory(roomNo) {
  window.roomNo = roomNo
  let data = await getCachedData(roomNo);
  console.log(data)
  if (data && data.length > 0) {
    for (let res of data)
        //chat.emit('chat', res.roomNo, res.name, res.message);
      writeOnChatHistory('<b>' + res.name + ':</b> ' + res.message);
  }
}

/**
 * called to init the chat history
 * @param roomNo
 * @returns {Promise<void>}
 * load the data in the indexedDB and show thr chat history when the user enter the room
 */

async function initAnnotation(roomNo) {
  window.roomNo = roomNo
  let data = await getAnnotationData(roomNo);
  console.log(data)
  if (data && data.length > 0) {
    for (let res of data)
        //chat.emit('chat', res.roomNo, res.name, res.message);
      addToResults(res)
  }
}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
  roomNo = Math.round(Math.random() * 10000);
  document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * it initialises the socket for /chat
 */

function initChatSocket() {
  chat.on('joined', function (room, userId) {
    if (userId === name) {
      hideLoginInterface(room, userId);
    } else {
      writeOnChatHistory('<b>' + userId + '</b>' + ' joined room ' + room);
    }
  });
  chat.on('chat', function (room, userId, chatText) {
    let who = userId
    if (userId === name) who = 'Me';
    writeOnChatHistory('<b>' + who + ':</b> ' + chatText);
  });

}

/**
 * init the news
 * if a new user enter the room or a user send a chat
 * the canvas will generate a new
 *
 */

function initNewsSocket() {
  news.on('joined', function (room, userId) {
    if (userId !== name) {
      writeOnNewsHistory('<b>' + userId + '</b>' + ' joined news room ' + room);
    }
  });

  news.on('news', function (room, userId, newsText) {
    writeOnNewsHistory('<b>' + userId + ':</b> ' + newsText);
  });
}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 * and store the data in indexedDB
 */
function sendChatText() {
  let chatText = document.getElementById('chat_input').value;
  // @todo send the chat message
  chat.emit('chat', roomNo, name, chatText);
  storeCachedData({roomNo: roomNo, name: name, message: chatText});
}

/**
 *
 * called to change the image on the canvas
 * If user wants to change the image, it will read the ImageUrl in the text field
 * and update to the imageUrl and change the image in Canvas
 *
 */

function changeImg() {
  let imageUrl = document.getElementById('chang_img_url').value;
  let tempImage = new Image()
  tempImage.src = imageUrl
  tempImage.crossOrigin = "anonymous"

  //updateCanvas(tempImage)
  tempImage.addEventListener('load', () => {
    // it takes time before the image size is computed and made available
    // here we wait until the height is set, then we resize the canvas based on the size of the image
    let poll = setInterval(function () {
      if (tempImage.naturalHeight) {
        clearInterval(poll);
        // resize the canvas
        let ratioX = 1;
        let ratioY = 1;
        // if the screen is smaller than the img size we have to reduce the image to fit
        if (tempImage.clientWidth > window.innerWidth)
          ratioX = window.innerWidth / tempImage.clientWidth;
        if (tempImage.clientHeight > window.innerHeight)
          ratioY = tempImage.clientHeight / window.innerHeight;
        let ratio = Math.min(ratioX, ratioY);
        // resize the canvas to fit the screen and the image
        console.log(tempImage.width)
        cvx.width = canvas.width = tempImage.naturalWidth * ratio;
        cvx.height = canvas.height = tempImage.naturalHeight * ratio;
        console.log(tempImage.naturalHeight)
        // draw the image onto the canvas
        drawImageScaled(tempImage, cvx, ctx);
        // hide the image element as it is not needed
        tempImage.style.display = 'none';
        const imageData = cvx.toDataURL('image/jpeg')
        $.post('/add', {roomNo: this.roomNo, imageData}, (res) => {
          this.chat.emit('updateImage', this.roomNo)
        })
      }
    }, 10);
  });

}

/**
 * called to update the image to Canvas
 */

window.chat.on('updateImage', () => {
  $.get(`/get/${window.roomNo}`, (res) => {
    let response = {
      imageData: false
    }
    if (res) {
      response = JSON.parse(res)
    }
    if (response.imageData) {
      let imageUrl = response.imageData
      updateImg(imageUrl)
    }


  })
})

/**
 * called to show the image on the canvas
 * called to
 * @param data
 *
 */

function updateImg(data) {
  let imageUrl = data;
  let tempImage = new Image()
  tempImage.src = imageUrl
  tempImage.crossOrigin = "anonymous"

  //updateCanvas(tempImage)
  tempImage.addEventListener('load', () => {
    // it takes time before the image size is computed and made available
    // here we wait until the height is set, then we resize the canvas based on the size of the image
    let poll = setInterval(function () {
      if (tempImage.naturalHeight) {
        clearInterval(poll);
        // resize the canvas
        let ratioX = 1;
        let ratioY = 1;
        // if the screen is smaller than the img size we have to reduce the image to fit
        if (tempImage.clientWidth > window.innerWidth)
          ratioX = window.innerWidth / tempImage.clientWidth;
        if (tempImage.clientHeight > window.innerHeight)
          ratioY = tempImage.clientHeight / window.innerHeight;
        let ratio = Math.min(ratioX, ratioY);
        // resize the canvas to fit the screen and the image
        console.log(tempImage.width)
        cvx.width = canvas.width = tempImage.naturalWidth * ratio;
        cvx.height = canvas.height = tempImage.naturalHeight * ratio;
        console.log(tempImage.naturalHeight)
        // draw the image onto the canvas
        drawImageScaled(tempImage, cvx, ctx);
        // hide the image element as it is not needed
        tempImage.style.display = 'none';
      }
    }, 10);
  });

}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
  roomNo = document.getElementById('roomNo').value;
  name = document.getElementById('name').value;
  let imageUrl = document.getElementById('image_url').value;
  $.get(`/get/${roomNo}`, (res) => {
    let response = {
      imageData: false
    }
    if (res) {
      response = JSON.parse(res)
    }
    if (response.imageData) {
      imageUrl = response.imageData
    }
    //@todo join the room
    const data = JSON.stringify({roomNo: roomNo, name: name, imageUrl: imageUrl})
    sendAjaxQuery("/", data)
    if ((!name) || (!roomNo)) {
    } else {
      initCanvas(socket, imageUrl);
      hideLoginInterface(roomNo, name);
      chat.emit('create or join', roomNo, name);
      news.emit('create or join', roomNo, name);
      initChatHistory(roomNo);
      initAnnotation(roomNo);
    }
  })

}
/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */

function writeOnChatHistory(text) {
  let history = document.getElementById('chat_history');
  let paragraph = document.createElement('p');
  paragraph.innerHTML = text;
  history.appendChild(paragraph);
  document.getElementById('chat_input').value = '';
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnNewsHistory(text) {
  // let history = document.getElementById('news_history');
  // let paragraph = document.createElement('p');
  // paragraph.innerHTML = text;
  // history.appendChild(paragraph);
  // document.getElementById('news_input').value = '';
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
  if (text === '') return;
  let history = document.getElementById('history');
  let paragraph = document.createElement('p');
  paragraph.innerHTML = text;
  history.appendChild(paragraph);
  // scroll to the last element
  history.scrollTop = history.scrollHeight;
  document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
  document.getElementById('initial_form').style.display = 'none';
  document.getElementById('chat_interface').style.display = 'block';
  document.getElementById('who_you_are').innerHTML = userId;
  document.getElementById('in_room').innerHTML = ' ' + room;
}


function sendAjaxQuery(url, data) {
  $.ajax({
    url: url ,
    data: data,
    dataType: 'json',
    type: 'POST',
    success: function (dataR) {
      // no need to JSON parse the result, as we are using
      // dataType:json, so JQuery knows it and unpacks the
      // object for us before returning it
      var ret = dataR;
      // in order to have the object printed by alert
      // we need to JSON stringify the object
      document.getElementById('results').innerHTML= JSON.stringify(ret);
    },
    error: function (xhr, status, error) {
      alert('Error: ' + error.message);
    }
  });
}
/**
 * given the sum data retrieved in the database, it returns all the numbers that have summed to a value X
 * @param dataR the data returned by the db
 */
function addToResults(dataR) {
  if (document.getElementById('results') != null) {
    const row = document.createElement('div');
    // appending a new row
    document.getElementById('results').appendChild(row);
    // formatting the row by applying css classes
    row.classList.add('card');
    row.classList.add('my_card');
    row.classList.add('bg-faded');
    // the following is far from ideal. we should really create divs using javascript
    // rather than assigning innerHTML
    row.innerHTML = "<div class='resultPanel'>" +
        "<h3 class='result-name'>" + dataR.name + "</h3>" +
        "<h4 class='result-id'>" + dataR.id + "</h4>" +
        "<div class='result-description'>" + dataR.rc + "</div>" +
        "<div class='result-url'>" + dataR.gc + "</div>" +
        "<div class='link'>" +
        "<a href='"+dataR.gc+"' target = '_blank'>Link to homepage</a >" +
        "</div>"
        "<div class='col-xs-7'></div></div>";
  }
}


