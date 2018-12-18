const url = new URL(window.location.href);
const controllerId = url.searchParams.get("id") || `11225qra8257b9`;
document.getElementById("id").innerText = controllerId;

const canvas = document.getElementById("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const cursor = document.getElementById("cursor");
cursor.width = cursor.clientWidth;
cursor.height = cursor.clientHeight;
const cursorCtx = cursor.getContext("2d");
const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    {
        urls: "turn:turn.anyfirewall.com:443?transport=tcp",
        username: "webrtc",
        credential: "webrtc"
    },
];
const connectOptions = {
    config: {iceServers},
    iceServers,
    debug: 3, // 0
}; // { host: 'localhost', port: 9000, path: "/" }
const peer = new Peer(controllerId, connectOptions);

peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
});

let hasConnection = false;

function onClose() {
    hasConnection = false;
    canvas.style.backgroundColor = `indianred`;
    $('#qr').show();
    clearCursor();
}

peer.on('connection', (conn) => {
    console.log(`Got new connection`);

    canvas.style.backgroundColor = `orange`;
    subscribeToCanvasEvents(conn);
    conn.on('open', () => {
        hasConnection = true;
        canvas.style.backgroundColor = `lightsteelblue`;
        $('#qr').hide();
    });
    conn.on('error', onClose)
    conn.on('close', onClose);
});

function subscribeToCanvasEvents(conn) {
    canvas.addEventListener("pointermove", e => {
        if (hasConnection) { drawCursor(e.offsetX, e.offsetY) };
        conn.send({ event: `pointermove`, data: { offsetX: e.offsetX, offsetY: e.offsetY } });
    });

    canvas.addEventListener("pointerdown", e => {
        conn.send({ event: `pointerdown`, data: { offsetX: e.offsetX, offsetY: e.offsetY } });
    });

    canvas.addEventListener("pointerup", e => {
        conn.send({ event: `pointerup`, data: { offsetX: e.offsetX, offsetY: e.offsetY } });
    });

    canvas.addEventListener("wheel", e => {
        conn.send({ event: `wheel`, data: { deltaY: e.deltaY, offsetX: e.offsetX, offsetY: e.offsetY } });
    });
}

const width = cursor.width;
const rightColor = `red`;
const leftColor = rightColor;
let size = 30;

function clearCursor() {
    cursorCtx.clearRect(0, 0, cursor.width, cursor.height);
}

function drawCursor(x1, y1) {
    clearCursor();
    _drawCursor(x1 % width, y1, leftColor);
    _drawCursor(x1 % width + width, y1, rightColor);
    function _drawCursor(x, y, color) {
        cursorCtx.strokeStyle = color;
        cursorCtx.lineWidth = 2;
        cursorCtx.beginPath();
        cursorCtx.ellipse(x, y, size / 2, size / 2, 0, 0, 2 * Math.PI);
        cursorCtx.stroke();
        cursorCtx.closePath();
    }
}

jQuery(function () {
    onClose();
});