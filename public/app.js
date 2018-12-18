const url = new URL(window.location.href);
const controllerId = url.searchParams.get("id") || `11225qra8257b9`;
document.getElementById("id").innerText = controllerId;

const connectOptions = {}; // { host: 'localhost', port: 9000, path: "/" }
const peer = new Peer(controllerId, connectOptions);

peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
});

peer.on('connection', (conn) => {
    console.log(`Got new connection`);
    subscribeToCanvasEvents(conn);
});

const canvas = document.getElementById("canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

function subscribeToCanvasEvents(conn) {
    canvas.addEventListener("pointermove", e => {
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