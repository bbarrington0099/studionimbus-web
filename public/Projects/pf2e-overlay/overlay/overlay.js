const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("Connected to bot WebSocket");
ws.onerror = (err) => console.error("WebSocket error", err);
ws.onclose = () => {
    console.log("WebSocket closed, reconnecting in 2s...");
    setTimeout(() => location.reload(), 2000);
};

ws.onmessage = (event) => {
    try {
        const msg = JSON.parse(event.data);
        const card = document.querySelector(`.card[data-userid="${msg.userId}"]`);
        if (!card) return;

        if (msg.type === "speaking_start") {
            card.classList.add("speaking");
        } else if (msg.type === "speaking_end") {
            card.classList.remove("speaking");
        }
    } catch(e) { console.warn(e); }
};