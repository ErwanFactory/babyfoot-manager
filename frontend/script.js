'use-strict';

/* BACKEND INFORMATIONS */

const backend_url = 'http://localhost:3000';
const routes = {
    matches: () => `${backend_url}/matches`,
    match: (matchId) => `${backend_url}/matches/${matchId}`
};

/* BACKEND INTERFACE */

// Get data from the given url and run the callback function when succeeded
const getData = (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(xhr.response);
        } else {
            console.error(`Error ${status} while getting data from the server (${url}) : ${xhr.response}`);
        }
    };
    xhr.send();
}

// Send to the given url a POST request with the given data as body and run the callback function when succeeded
const postData = (url, data, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', routes.matches(), true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 201) {
            callback(data);
        } else {
            console.error(`Error ${status} while POST sending data to the server (${url}) : ${xhr.response}`);
        }
    };
    xhr.send(JSON.stringify(data));
}

/* FORMS */

// Create a match between the entered player1 and player2
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

        postData(routes.matches(), data, renderMatch);
    }
}

/* HTML RENDERING */

// Generate an HTML Element which represents a match for the given player1, player2 and isFinished state.
const generateMatchHtmlElement = (player1, player2, isFinished) => {
    var li = document.createElement('li');
    li.classList = ['matches'];
    if (isFinished) {
        li.classList.add('finished-matches');
    }
    li.textContent = `${player1} vs ${player2}`;
    // var deleteButton = document.createElement('button');
    // deleteButton.type = 'button';
    // deleteButton.textContent = 'Supprimer';
    // li.appendChild(deleteButton);
    return li;
}

// Clear all child of the node with the given id
const clearAllNodeChild = (id) => {
    var node = document.getElementById(id);
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

// Render the match in the right list depending on its finished state
const renderMatch = (match) => {
    const matchNode = generateMatchHtmlElement(match.player1, match.player2, match.finished);
    if (match.finished) {
        document.getElementById('finished-matches').appendChild(matchNode);
    } else {
        document.getElementById('in-progress-matches').appendChild(matchNode);
    }
}

// Clear and render every matches in the right list
const updateMatches = (matches) => {
    clearAllNodeChild('in-progress-matches');
    clearAllNodeChild('finished-matches');
    matches.forEach(match => renderMatch(match));
}

// When the window is loaded, get all matches and render it
window.onload = getData(routes.matches(), updateMatches);