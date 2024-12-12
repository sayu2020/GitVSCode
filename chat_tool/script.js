// Function to send message and save it on the server
function sendMessage() {
    const userMessage = document.getElementById('user-input').value;
    if (userMessage.trim() === "") return; // Don't send if input is empty

    // Display the user message
    displayMessage(userMessage, 'user');

    // Simulating the assistant's response (You can replace this with an actual AI model or other logic)
    const assistantMessage = "This is the assistant's response to: " + userMessage;
    displayMessage(assistantMessage, 'assistant');

    // Save both messages to the server
    saveMessageToServer(userMessage, assistantMessage);

    // Clear the input box after sending the message
    document.getElementById('user-input').value = '';
}

// Function to send messages to the Flask server for saving
function saveMessageToServer(userMessage, assistantMessage) {
    fetch('http://localhost:8080/save_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_message: userMessage, assistant_message: assistantMessage }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Show success message in the console
    })
    .catch(error => console.error('Error:', error));
}

// Function to load and display the chat history from the server
function loadChatHistory() {
    fetch('http://localhost:8080/get_chat_history')
        .then(response => response.json())
        .then(data => {
            data.forEach(chat => {
                displayMessage(chat.user_message, 'user');
                displayMessage(chat.assistant_message, 'assistant');
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to display messages in the chat box
function displayMessage(messageText, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = `<p>${messageText}</p>`;
    document.querySelector('.chat-box').appendChild(messageDiv);
}

// Load chat history when the page is loaded
loadChatHistory();

// Add event listener for the "Enter" key
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent default Enter behavior (e.g., form submission)
        sendMessage();           // Send the message
    }
});
