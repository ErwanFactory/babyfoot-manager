/* TYPES */ 
const EventTypes = {
    Create: 'create',
    Get: 'get',
    Finish: 'finish',
    Unfinish: 'unfinish',
    Delete: 'delete',
    Error: 'error'
};

/* SERVER INTERFACE */

const url = 'ws://localhost:3000';
let socket = new WebSocket(url);

const sendEvent = (event, value) => {
    socket.send(JSON.stringify({
        event: event,
        value: value
    }));
}

/* CONTROLLERS */

// Checks the form is good, if not inform the user, if it is : it sends the event of creation to the backend
const createMatch = () => {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');

    if (player1.value === '') {
        player1.className = 'error';
    } else if (player2.value === '') {
        player2.className = 'error';
    } else {
        const data = {
            player1: player1.value,
            player2: player2.value
        }

        player1.value = '';
        player1.className = '';
        player2.value = '';
        player2.className = '';

        sendEvent(EventTypes.Create, data);
    }
}

// When the user trigger the finished checkbox, it sends the right event depending on the checkbox is checked or not
const onCheckChange = (event) => {
    const id = event.target.parentNode.id;
    sendEvent(event.target.checked ? EventTypes.Finish : EventTypes.Unfinish, { id: id });
}

// When the user click on the delete button, it sends the delete event
const onDeleteClick = (event) => {
    const id = event.target.parentNode.id;
    sendEvent(EventTypes.Delete, { id: id });
}

/* HTML RENDERING */

// Clears all child of the node with the given id
const clearAllNodeChild = (id) => {
    var node = document.getElementById(id);
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

// Generates an HTML Element which represents a match for the given player1, player2 and isFinished state.
const generateMatchHtmlElement = (id, player1, player2, isFinished) => {
    var li = document.createElement('li');
    li.id = id;
    li.classList = ['matches'];
    if (isFinished) {
        li.classList.add('finished-matches');
    }

    li.textContent = `${player1} vs ${player2}`;

    // Finish Button
    var finishCheck = document.createElement('input');
    finishCheck.type = 'checkbox';
    finishCheck.checked = isFinished;
    finishCheck.onchange = onCheckChange;
    li.appendChild(finishCheck);

    // Delete Button
    var deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Supprimer';
    deleteButton.onclick = onDeleteClick;
    li.appendChild(deleteButton);
    return li;
}

// Adds and renders the match in the right list depending on its finished state
const addMatch = (id, player1, player2, finished) => {
    const matchNode = generateMatchHtmlElement(id, player1, player2, finished);
    if (finished) {
        document.getElementById('finished-matches').appendChild(matchNode);
    } else {
        document.getElementById('in-progress-matches').appendChild(matchNode);
    }
}

// Clears and renders every matches in the right list
const refreshMatches = (matches) => {
    clearAllNodeChild('in-progress-matches');
    clearAllNodeChild('finished-matches');
    matches.forEach(match => addMatch(match.id, match.player1, match.player2, match.finished));
}

// Updates match, with the given id, position in the DOM to show it as finished
const finishMatch = (id) => {
    var matchElement = document.getElementById(id);
    document.getElementById('in-progress-matches').removeChild(matchElement);
    matchElement.className = 'finished-matches';
    matchElement.childNodes.forEach(c => {
        if (c.type === 'checkbox') {
            c.checked = true;
        }
    });
    document.getElementById('finished-matches').appendChild(matchElement);
}

// Updates match, with the given id, position in the DOM to show it as not finished
const unfinishMatch = (id) => {
    var matchElement = document.getElementById(id);
    document.getElementById('finished-matches').removeChild(matchElement);
    matchElement.className = '';
    matchElement.childNodes.forEach(c => {
        if (c.type === 'checkbox') {
            c.checked = false;
        }
    });
    document.getElementById('in-progress-matches').appendChild(matchElement);
}

// Remove the match element, with the given id, from the document
const removeMatch = (id) => {
    var matchElement = document.getElementById(id);
    matchElement.remove();
}

/* CLIENT BEHAVIOUR */

// When the socket open, get data
socket.onopen = (e) => sendEvent(EventTypes.Get, {});

// When receiving a message from the backend
socket.onmessage = (event) => {
    var data = JSON.parse(event.data);

    if (data.event === EventTypes.Create) {
        addMatch(data.value.id, data.value.player1, data.value.player2, false);
    } else if (data.event === EventTypes.Get) {
        refreshMatches(data.value);
    } else if (data.event === EventTypes.Finish) {
        finishMatch(data.value.id);
    } else if (data.event === EventTypes.Unfinish) {
        unfinishMatch(data.value.id);
    } else if (data.event === EventTypes.Delete) {
        removeMatch(data.value.id);
    }
};

// If the connection is lost, warns the user
socket.onclose = (e) => {
    document.getElementById('disconnected-warning').style.display = 'initial';
};

socket.onerror = (error) => {
    console.error(`[error] ${error.message}`);
};
