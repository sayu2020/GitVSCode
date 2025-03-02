// Function to send message and save it on the server
function sendMessage() {
    let userMessage = document.getElementById('user-input').value;
    chatCnt = chatCnt+1;
    // Check if the input box is empty
    if (userMessage.trim() === "") {
        // If input box is empty, check if a radio button is selected
        const selectedRadio = document.querySelector('input[name="option"]:checked');
        
        if (selectedRadio) {
            // Use the selected radio button value as the user message
            userMessage = selectedRadio.value;
            console.log('User message from radio: ', userMessage);  // Log the selected radio value
        } else {
            // If neither input nor radio is selected, don't send the message
            console.log('No message or radio selected');
            return;
        }
    }

    // Display the user message
    displayMessage(userMessage, 'user');

    const userPrompt = createPrompt(userMessage);

    getAssistantResponse(userMessage, userPrompt);

    // Clear the input box after sending the message
    document.getElementById('user-input').value = '';
}

// Function to send messages to the Flask server for saving
function createPrompt(userMessage){
    let userPrompt = userMessage;
    if(chatCnt == 3){
        userPrompt = 'My grade:' + userGreade + '\nSubject I want to study today:' + userSubject + '\nMy weakness:' + userMessage + '\nCan you make the study schedule for 2 hours Today? Please be supportive';
    }
    return userPrompt;
}

    // Fetch the assistant's response from the Flask server
function getAssistantResponse(userMessage, userPrompt){
    fetch('http://localhost:5000/get_openai_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_prompt: userPrompt })
    })
    .then(response => response.json())
    .then(data => {
        if (data.assistant_message) {
            // Display the assistant's response
            let assistantMessage = ''
            if(chatCnt == 1){
                assistantMessage = data.assistant_message + '\n\n What do you want to study today?';
                const options = ['Math', 'Physics', 'English'];
                displayMessage(assistantMessage, 'assistant');
                displaySelectMessage(options, 'user');
            }else if(chatCnt == 2){
                userSubject = userMessage;
                assistantMessage = 'OK! When was your most recent' + userSubject + 'exam?';
                displayMessage(assistantMessage, 'assistant');
            } else {
                assistantMessage = data.assistant_message;
                displayMessage(assistantMessage, 'assistant');
            }

            // Save both messages to the server
            saveMessageToServer(userMessage, assistantMessage);
        } else {
            console.error('Error:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to send messages to the Flask server for saving
function saveMessageToServer(userMessage, assistantMessage) {
    fetch('http://localhost:5000/save_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_message: userMessage, assistant_message: assistantMessage })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Show success message in the console
    })
    .catch(error => console.error('Error:', error));
}

// Currently not used
// Function to load and display the chat history from the server
function loadChatHistory() {
    fetch('http://localhost:5000/get_chat_history')
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
    messageDiv.innerHTML = `<p>${messageText.replace(/\n/g, "<br>")}</p>`;
    document.querySelector('.chat-box').appendChild(messageDiv);
}

// Function to display messages in the chat box
function displaySelectMessage(options, sender) {
    // Create the message div
    const messageDiv = document.createElement('div');
    
    // Create the chat box container where radio buttons will be placed
    const chatBox = document.querySelector('.chat-box');
    
    // Add appropriate class for the message
    messageDiv.classList.add('message', sender);
    
    // Add message text to the messageDiv
    // messageDiv.innerHTML = `<p>${messageText.replace(/\n/g, "<br>")}</p>`;
    
    // Append the message to the chat box
    chatBox.appendChild(messageDiv);
    
    // Create a container for the radio buttons inside the message
    const radioContainer = document.createElement('div');
    radioContainer.classList.add('radio-container');
    
    // Create radio buttons for each option
    options.forEach(option => {
        const label = document.createElement('label');
        const radioButton = document.createElement('input');
        
        // Set radio button attributes
        radioButton.type = 'radio';
        radioButton.name = 'option'; // Shared name to group options
        radioButton.value = option.toLowerCase().replace(/\s+/g, ''); // Clean value
        
        // Add the radio button to the label
        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(option));
        label.style.display = 'block';  // Optional: makes the labels appear on separate lines
        
        // Append the label (with radio button) to the radio container
        radioContainer.appendChild(label);
    });

    // Append the radio buttons container to the message div
    messageDiv.appendChild(radioContainer);

    // Add event listener for key press (for example, any key)
    window.addEventListener('keydown', function() {
        // Find the selected radio button
        const selectedRadio = document.querySelector('input[name="option"]:checked');
        
        if (selectedRadio) {
            // Get the selected option value
            const selectedOptionValue = selectedRadio.value;
            console.log('Selected option before disabling: ', selectedOptionValue);
        }

        // Disable all radio buttons after key press
        const radioButtons = document.querySelectorAll('input[name="option"]');
        radioButtons.forEach(radio => {
            radio.disabled = true;
        });
    });
}

// Show first message when the page is loaded
let chatCnt =0;
const userName = 'Kazuki';
const userGreade = '7th greade';
let userSubject = '';
const firstMessage = 'Hey, '+ userName +'! How was the school today?'
displayMessage(firstMessage, 'assistant');


// Add event listener for the "Enter" key
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent default Enter behavior (e.g., form submission)
        sendMessage();           // Send the message
    }
});

window.addEventListener('keydown', function(event) {
    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
        const selectedRadio = document.querySelector('input[name="option"]:checked');
        
        if (selectedRadio) {
            // Get the selected option value
            const selectedOptionValue = selectedRadio.value;
            console.log('Selected option before disabling: ', selectedOptionValue);
        }

        // Disable all radio buttons after key press
        const radioButtons = document.querySelectorAll('input[name="option"]');
        radioButtons.forEach(radio => {
            radio.disabled = true;
        });
    }
});


