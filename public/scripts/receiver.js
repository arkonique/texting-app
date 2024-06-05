let messages = [];
let history = 0;
async function fetchInitialMessages() {
    try {
        const response = await fetch('/get');
        messages = await response.json();
        if (messages.length > 0) {
            document.getElementById('latestMessage').innerHTML = `<span>${messages[messages.length - 1]}</span>`;
            adjustFontSize();
            history = messages.length;
            
            for (let i = 0; i < messages.length; i++) {
                const histDiv = document.getElementById('history');
                const message = document.createElement('p');
                message.innerText = messages[i];
                histDiv.appendChild(message);
            }
            randomizePositions();

        } else {
            document.getElementById('latestMessage').innerHTML = '<span>I love you ❤️</span>';
            adjustFontSize();
            randomizePositions();
        }
    } catch (error) {
        console.error('Error fetching initial messages:', error);
        document.getElementById('latestMessage').innerText = 'Error fetching messages';
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Fetch initial messages when the page loads
    fetchInitialMessages();

    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`wss://${window.location.host}`);

    ws.onmessage = (event) => {
        document.getElementById('latestMessage').innerHTML = `<span>${event.data}</span>`;
        const histDiv = document.getElementById('history');
        const message = document.createElement('p');
        message.innerText = event.data;
        histDiv.appendChild(message);
        adjustFontSize();
        // reload
        window.location.reload();
        randomizePositions();
    };

    ws.onopen = () => {
        console.log('WebSocket connection established');
    };

    ws.onerror = (error) => {
        console.log('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
});


// Random top, left, and rotation values for the p elements in the history div
function randomizePositions() {
    const history = document.getElementById('history');
    const messages = Array.from(history.querySelectorAll('p'));
    const positions = [];
    const minDistance = 30; // Minimum distance between messages in percentage of viewport

    // If there are more than 10 messages, hide the older ones
    if (messages.length > 10) {
        messages.slice(0, messages.length - 10).forEach(message => {
            message.style.display = 'none';
        });
        messages.slice(-10).forEach(message => {
            message.style.display = 'block';
        });
    }

    // Get the last 10 messages
    const lastTenMessages = messages.slice(-10);

    lastTenMessages.forEach(message => {
        let top, left, isValidPosition;
        
        do {
            top = Math.random() * 110; // Range 0% to 80% to avoid edges
            left = Math.random() * 110; // Range 0% to 80% to avoid edges
            isValidPosition = positions.every(pos => {
                const distance = Math.sqrt(Math.pow(pos.top - top, 2) + Math.pow(pos.left - left, 2));
                return distance >= minDistance;
            });
        } while (!isValidPosition);

        //const rotation = Math.random() * 30 - 15; // Controlled rotation angle range -15 to 15 degrees
        const rotation = -45
        message.style.position = 'absolute';
        message.style.top = `${top}%`;
        message.style.left = `${left}%`;
        message.style.transform = `rotate(${rotation}deg)`;
        positions.push({ top, left });
    });
}


// Adjust font size of the latest message to fit 60% of the viewport width
function adjustFontSize() {
    const textElement = document.querySelector('#latestMessage span');
    const viewportWidth = window.innerWidth;
    const targetWidth = viewportWidth * 0.6; // 60% of viewport width
    let fontSize = 10; // Initial font size in pixels
    textElement.style.fontSize = `${fontSize}px`;

    while (textElement.offsetWidth < targetWidth) {
        fontSize++;
        textElement.style.fontSize = `${fontSize}px`;
    }
    console.log('Adjusted font size:', fontSize);
}

window.addEventListener('resize', adjustFontSize);
window.addEventListener('load', adjustFontSize);

