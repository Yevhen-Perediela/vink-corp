document.addEventListener("DOMContentLoaded", () => {
    console.log("WebSocket script loaded");

    const chatLog = document.querySelector("#chat-log");
    const messageInput = document.querySelector("#chat-message-input");
    const sendButton = document.querySelector("#chat-message-submit");

    console.log("Chat elements:", { chatLog, messageInput, sendButton });

    let chatSocket = null;

    function connectWebSocket() {
        const wsUrl = 'ws://' + window.location.host + '/ws/chat/';
        console.log("Connecting to WebSocket:", wsUrl);

        chatSocket = new WebSocket(wsUrl);

        chatSocket.onopen = function() {
            console.log("WebSocket connection established");
        };

        chatSocket.onmessage = function(e) {
            console.log("Received message:", e.data);
            const data = JSON.parse(e.data);

            if (data.type === 'history') {
                console.log("Received message history:", data.messages);
                data.messages.forEach(msg => {
                    displayMessage(msg.message, msg.username, msg.timestamp);
                });
            } else {
                console.log("Received new message:", data);
                displayMessage(data.message, data.username);
            }
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
            setTimeout(connectWebSocket, 1000);
        };

        chatSocket.onerror = function(e) {
            console.error("WebSocket error:", e);
        };
    }

    function displayMessage(message, username, timestamp = null) {
        const messageElement = document.createElement('div');
        const currentUser = document.querySelector('#chat-message-input').dataset.username;

        const messageClass = username === window.username ? 'user' : 'other';
        messageElement.className = `chat-message-ws ${messageClass}`;

        messageElement.innerHTML = `
            <span class="message-username">${username}</span><br>
            <span class="message-text">${message}</span>
        `;

        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }


    if (sendButton) {
        sendButton.onclick = function() {
            const message = messageInput.value.trim();
            if (message) {
                console.log("Sending message:", message);
                sendMessage(message);
                messageInput.value = '';
            }
        };
    }

    if (messageInput) {
        messageInput.onkeyup = function(e) {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        };
    }

    function sendMessage(message) {
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            console.log("Sending message through WebSocket:", message);
            chatSocket.send(JSON.stringify({
                'message': message
            }));
        } else {
            console.error("WebSocket is not connected. State:", chatSocket ? chatSocket.readyState : "null");
        }
    }

    // Połącz się z WebSocket po załadowaniu strony
    connectWebSocket();

    // Eksport funkcji
    window.sendMessage = sendMessage;
});