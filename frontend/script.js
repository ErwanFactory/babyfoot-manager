/* TYPES */
const EventTypes = {
    Create: 'create',
    Get: 'get',
    Finish: 'finish',
    Unfinish: 'unfinish',
    Delete: 'delete',
    Error: 'error'
};

const matchToHtmlString = (id, text, isFinished) => `
    <li class="matches ${isFinished ? 'finished-matches': ''}" id="${id}">
        <span class="mr-auto">${text}</span>
        <input type="checkbox" ${ isFinished ? 'checked':''} onchange="onCheckChange(event)">
        <button type="button" class="btn btn-link" onclick="onDeleteClick(event)">Supprimer</button> 
    </li>`;

/* SERVER INTERFACE */

const DOMAIN = 'ws://localhost:3000';
let socket;

const sendEvent = (event, value) => {
    socket.send(JSON.stringify({
        event: event,
        value: value
    }));
}

/* CONTROLLERS */

// Checks the form is good, if not inform the user, if it is : it sends the event of creation to the backend
function createMatch() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');

    if (player1.value === '') {
        player1.classList.add('is-invalid');
    } else if (player2.value === '') {
        player2.classList.add('is-invalid');
    } else {
        const data = {
            player1: player1.value,
            player2: player2.value
        }

        player1.value = '';
        player1.classList.remove('is-invalid');
        player2.value = '';
        player2.classList.remove('is-invalid');

        sendEvent(EventTypes.Create, data);
    }
}

// When the user trigger the finished checkbox, it sends the right event depending on the checkbox is checked or not
function onCheckChange(event) {
    const id = event.target.parentNode.id;
    sendEvent(event.target.checked ? EventTypes.Finish : EventTypes.Unfinish, { id: id });
}

// When the user click on the delete button, it sends the delete event
function onDeleteClick(event) {
    const id = event.target.parentNode.id;
    sendEvent(EventTypes.Delete, { id: id });
}

/* HTML RENDERING */

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function changeDisplayById(id, hide) {
    document.getElementById(id).style.display = hide ? 'none' : 'initial';
}

// Clears all child of the node with the given id
function clearAllNodeChild(id) {
    var node = document.getElementById(id);
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

// Generates an HTML Element which represents a match for the given player1, player2 and isFinished state.
function generateMatchHtmlElement(id, player1, player2, isFinished) {
    return htmlToElement(matchToHtmlString(id, `${player1} vs ${player2}`, isFinished));
}

// Update the value of the in progress match count
function updateInProgressMatchCount() {
    var inProgressMatchCount = document.getElementById('in-progress-matches').children.length;
    document.getElementById('in-progress-match-count').textContent = inProgressMatchCount;
}

// Adds and renders the match in the right list depending on its finished state
function addMatch(id, player1, player2, finished) {
    const matchNode = generateMatchHtmlElement(id, player1, player2, finished);
    if (finished) {
        document.getElementById('finished-matches').appendChild(matchNode);
    } else {
        document.getElementById('in-progress-matches').appendChild(matchNode);
        updateInProgressMatchCount();
    }
}

// Clears and renders every matches in the right list
function refreshMatches(matches) {
    clearAllNodeChild('in-progress-matches');
    clearAllNodeChild('finished-matches');
    matches.forEach(match => addMatch(match.id, match.player1, match.player2, match.finished));
}

// Updates match, with the given id, position in the DOM to show it as finished
function finishMatch(id) {
    var matchElement = document.getElementById(id);
    document.getElementById('in-progress-matches').removeChild(matchElement);
    matchElement.classList.add('finished-matches');
    matchElement.childNodes.forEach(c => {
        if (c.type === 'checkbox') {
            c.checked = true;
        }
    });
    document.getElementById('finished-matches').appendChild(matchElement);
    updateInProgressMatchCount();
}

// Updates match, with the given id, position in the DOM to show it as not finished
function unfinishMatch(id) {
    var matchElement = document.getElementById(id);
    document.getElementById('finished-matches').removeChild(matchElement);
    matchElement.classList.remove('finished-matches');
    matchElement.childNodes.forEach(c => {
        if (c.type === 'checkbox') {
            c.checked = false;
        }
    });
    document.getElementById('in-progress-matches').appendChild(matchElement);
    updateInProgressMatchCount();
}

// Remove the match element, with the given id, from the document
function removeMatch(id) {
    var matchElement = document.getElementById(id);
    matchElement.remove();
    updateInProgressMatchCount();
}

/* CLIENT BEHAVIOUR */

function tryReconnect() {
    changeDisplayById('disconnected-warning', false);
    tryConnect(DOMAIN);
};

function init() {
    changeDisplayById('disconnected-warning', true);
    sendEvent(EventTypes.Get, {});
    socket.onclose = tryReconnect;
}

function dispatchEvent(event) {
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

// Tries to connect to the server until the number of tries is exceeded.
function tryConnect(domain, tries = 10) {
    changeDisplayById('disconnected-warning', false);

    if (tries == 0) {
        // We notify the user that he must refresh to make other attempts to connect
        changeDisplayById('disconnected-warning', true);
        changeDisplayById('disconnected-danger', false);
        return;
    }
    socket = new WebSocket(domain);

    socket.onerror = () => {
        console.error(`[${tries} tries remaining] Could not connect to the server, next attempt in 5s...`);
        setTimeout(function () {
            tryConnect(domain, tries - 1);
        }, 5000);
    };

    socket.onopen = init;
    socket.onmessage = dispatchEvent;
}

tryConnect(DOMAIN);