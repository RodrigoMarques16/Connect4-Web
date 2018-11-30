const host = "twserver.alunos.dcc.fc.up.pt"
const port = 8008;

function makeRequest(method, command, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4)
            return
        callback(JSON.parse(xhr.responseText))
    }
    xhr.open(method, `http://${host}:${port}/${command}`);
    xhr.send(JSON.stringify(data));
    console.log(`sent ${command} to server`);
}

function getListener(nick, game, callback) {
    eventSource = new EventSource(`http://${host}:${port}/update?nick=${nick}&game=${game}`);
    eventSource.onmessage = callback;
    return eventSource;
}