async function sendMessage() {
    const message = document.getElementById('message').value;
    if (message) {
        const response = await fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            popup('Message sent successfully');
        } else {
            popup('Failed to send message');
        }
    } else {
        popup('Please enter a message');
    }
}

// Press Enter to send message
document.getElementById('message').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Popup function to display alert instead of alert. Change text inside #status and set display to flex, opacity to 1, scale to 1
function popup(alerter) {
    const status = document.querySelector('#status');
    status.innerHTML = `
    <p>${alerter}</p>
    <button onclick="clearStatus()">OK</button>
    `
    status.style.display = 'flex';
    status.style.opacity = 1;
    status.style.transform = 'scale(1)';
    setTimeout(() => {
        status.style.opacity = 0;
        status.style.transform = 'scale(0)';
    }, 3000);
}

// clearStatus function to hide the alert
function clearStatus() {
    const status = document.querySelector('#status');
    status.style.opacity = 0;
    status.style.transform = 'scale(0)';
}
