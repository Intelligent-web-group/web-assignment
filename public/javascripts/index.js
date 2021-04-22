let name = null;
let roomNo = null;
let socket=null;
let chat= io.connect('/chat');
let news= io.connect('/news');

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
    initChatHistory()

    //@todo here is where you should initialise the socket operations as described in teh lectures (room joining, chat message receipt etc.)
}


/**
 * called by the HTML onload
 * showing any cached chat history data and declaring the service worker
 */
function initChatHistory(){
    if ('indexedDB' in window) {
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    loadData(false);
}

/**
 * given the chat history created by the user, it will retrieve all the data from
 * the server (or failing that) from the database
 * @param forceReload true if the data is to be loaded from the server
 */
function loadData(forceReload){
    var chatHistory=JSON.parse(localStorage.getItem('messages'));
    chatHistory=removeDuplicates(chatHistory);
    retrieveAllMessagesData(chatHistory, new Date().getTime(), forceReload);
}


/**
 * it cycles through chat history and requests the data from the server for each
 * user
 * @param chatHistory chat history the user has requested
 * @param date the date for the message(not in use)
 * @param forceReload true if the data is to be retrieved from the server
 */
function retrieveAllMessagesData(chatHistory, date, forceReload){
    refreshChatHistory();
    for (let index in chatHistory)
        loadMessageData(chatHistory[index], date, forceReload);
}

function loadMessageData(message, date, forceReload){

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


function initNewsSocket(){
    news.on('joined', function (room, userId) {
        if (userId !== name) {
            writeOnNewsHistory('<b>'+userId+'</b>' + ' joined news room ' + room);
        }
    });

    news.on('news', function (room, userId, newsText) {
        writeOnNewsHistory('<b>' + userId + ':</b> ' + newsText);
    });
}


/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    // @todo send the chat message
    chat.emit('chat', roomNo, name, chatText);
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    // The .serializeArray() method creates a JavaScript array of objects
    // https://api.jquery.com/serializearray/
    const formArray= $("form").serializeArray();
    const data={};
    for (let index in formArray){
        data[formArray[index].name]= formArray[index].value;
    }
    // const data = JSON.stringify($(this).serializeArray());
    sendAjaxQuery('/', data);
    // prevent the form from reloading the page (normal behaviour for forms)
    event.preventDefault()
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    let imageUrl= document.getElementById('image_url').value;
    //@todo join the room
    if ((!name)||(!roomNo)) {
    } else {
        initCanvas(socket, imageUrl);
        hideLoginInterface(roomNo, name);
        chat.emit('create or join', roomNo, name);
        news.emit('create or join', roomNo, name);
    }
}

function writeOnChatHistory(text) {
    let history = document.getElementById('chat_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}


function writeOnNewsHistory(text) {
    let history = document.getElementById('news_history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('news_input').value = '';
}

/**
 * it appends the given html text to the history div
 * this is to be called when the socket receives the chat message (socket.on ('message'...)
 * @param text: the text to append
 */
function writeOnHistory(text) {
    if (text==='') return;
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
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
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
        row.innerHTML = "<div class='card-block'>" +
            "<div class='row'>" +
            "<div class='col-xs-2'><h4 class='card-title'>" + dataR.name + "</h4></div>" +
            "<div class='col-xs-2'>:</div>" +
            "<div class='col-xs-2'>" + dataR.message + "</div>" +
            "<div class='col-xs-2'></div></div></div>";
    }
}

    function sendAjaxQuery(url, data) {
        $.ajax({
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            success: function (dataR) {
                // no need to JSON parse the result, as we are using
                // dataType:json, so JQuery knows it and unpacks the
                // object for us before returning it
                // in order to have the object printed by alert
                // we need to JSON.stringify the object
                document.getElementById('results').innerHTML = JSON.stringify(dataR);
            },
            error: function (response) {
                // the error structure we passed is in the field responseText
                // it is a string, even if we returned as JSON
                // if you want o unpack it you must do:
                // const dataR= JSON.parse(response.responseText)
                alert(response.responseText);
            }
        });
}


