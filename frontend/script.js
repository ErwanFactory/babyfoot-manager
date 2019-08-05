'use-strict';

const backend_url = 'http://localhost:3000';
const routes = {
    matches: '/matches',
    match: '/matches/'
}
const matchHtml = (player1, player2, finished) => {
    var li = document.createElement('li');
    li.classList = ['matches'];
    if (finished) {
        li.classList.add('finished-matches');
    }
    li.textContent = `${player1} vs ${player2}`;
    // var deleteButton = document.createElement('button');
    // deleteButton.type = 'button';
    // deleteButton.textContent = 'Supprimer';
    // li.appendChild(deleteButton);
    return li;
}

const getMatches = async (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(xhr.response);
        } else {
            console.error(`Error ${status} while getting data from the server : ${xhr.response}`);
        }
    };
    xhr.send();
}

const showMatches = (matches) => {
    matches.forEach(match => {
        const matchNode = matchHtml(match.player1, match.player2, match.finished);
        if (match.finished) {
            document.getElementById("finished-matches").appendChild(matchNode);
        } else {
            document.getElementById("in-progress-matches").appendChild(matchNode);
        }
    });
}

window.onload = getMatches(backend_url + routes.matches, showMatches);