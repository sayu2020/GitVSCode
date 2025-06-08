'use strict';

// Request notification permission
if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        } else {
            console.log('Notification permission denied.');
        }
    });
}

// Check if user is in Incognito or Private Browsing mode
function isIncognito() {
    return new Promise((resolve) => {
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) {
            resolve(false);  // If the API is unavailable, assume regular mode
            return;
        }

        fs(window.TEMPORARY, 100, () => {
            resolve(false);  // Not in incognito mode
        }, () => {
            resolve(true);   // In incognito mode
        });
    });
}

isIncognito().then((result) => {
    if (result) {
        alert('You are in Incognito or Private Browsing mode. Notification feature may not work.');
    } else {
        console.log('You are not in Incognito mode.');
    }
});

// Function to show the notification
function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    } else {
        console.log('Notification permission not granted.');
    }
}

// Function to get the milliseconds until a user-specified time
function getMillisecondsUntilUserTime(userTimeString) {
    const now = new Date();
    const userTime = new Date(userTimeString);  // Parse the user input time (e.g., '2025-01-13 15:00:00')

    // If the user time has already passed today, set it for tomorrow
    while (now > userTime){
        userTime.setDate(userTime.getDate() + 1);  // Set for tomorrow
    }

    console.log('Milliseconds until user time:', userTime - now);  // Log the value
    return userTime - now;
}

// Function to send message and save it on the server
async function sendMessage(userInfo) {
    let userMessage = document.getElementById('user-input').value;
    let userPrompt;
    let assistantMessage;
    let millisecondsUntilUserTime;
    let nextStudyDT;

    chatCnt = chatCnt + 1;

    // Check if the input box is empty
    if (userMessage.trim() === '') {
        // If input is selected, don't send the message
        return;
    }

    // Display the user message
    displayMessage(userMessage, 'user');

    if (chatCnt == 1) {
        userInfo.subject = userMessage;
        assistantMessage = 'When was your most recent ' + userInfo.subject + ' exam? ex)' + new Date().toLocaleDateString('ja-JP') ;
    } else if (chatCnt == 2) {
        userInfo.lastExamDate = userMessage;
        assistantMessage = 'What score did you get in the ' + userInfo.subject + ' exam?';
    } else if (chatCnt == 3) {
        userInfo.lastExamScore = userMessage;
        assistantMessage = "What was included in the exam?\n*If you don't know the name of the topic, you can write some example question!";
    } else if (chatCnt == 4) {
        userInfo.topic = userMessage;
        userPrompt = createPrompt(userMessage,userInfo);
        assistantMessage = await getAssistantResponse(userPrompt);
        assistantMessage = assistantMessage + '\nWhen are you available? ex)' + new Date().toLocaleDateString('ja-JP') + ' ' + new Date().toLocaleTimeString('ja-JP').substring(0,5);
    } else if (chatCnt == 5) {
        millisecondsUntilUserTime = getMillisecondsUntilUserTime(userMessage);
        // Set the notification to trigger at the user-specified time
        setTimeout(() => {
            showNotification(userName +'! Time to study'+ userInfo.subject+'!');
        }, millisecondsUntilUserTime);
        nextStudyDT = new Date(new Date().getTime() + millisecondsUntilUserTime);
        nextStudyDT = nextStudyDT.toLocaleDateString('ja-JP') + ' ' + nextStudyDT.toLocaleTimeString('ja-JP').substring(0,5);
        assistantMessage = 'Cool! See you at ' + nextStudyDT + '!';
    } else {
        userPrompt = userMessage;
        assistantMessage = await getAssistantResponse(userPrompt); 
    }

    // Display the assistant message
    await displayMessage(assistantMessage, 'assistant');

    // Save both messages to the server
    await saveMessageToServer(userMessage, assistantMessage); 

    // Clear the input box after sending the message
    document.getElementById('user-input').value = '';

    return userInfo;
}


// Function to send messages to the Flask server for saving
function createPrompt(userMessage,userInfo){
    let Prompt;
    if(chatCnt == 4){
        Prompt = 'My grade:' + userInfo.greade + '\nSubject I want to study today:' + userInfo.subject + '\nScore of the subject in the last exam:' + userInfo.lastExamScore + '\nTopic I want to study today:' + userInfo.topic + '\nTo improve my score, How many hours should I study? Please create study steps and schedules.';
    } else {
        Prompt = userMessage;
    }
    return Prompt;
}


// Fetch the assistant's response from the Flask server
async function getAssistantResponse(userPrompt) {
    let assistantMessage;
    try {
        const response = await fetch('http://localhost:5000/get_openai_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_prompt: userPrompt })
        });

        const data = await response.json();

        if (data.assistant_message) {
            assistantMessage = data.assistant_message;
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    return assistantMessage;
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

// Scroll to the bottom of the container
function scrollToBottom() {
    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to display messages in the chat box
function displayMessage(messageText, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = `<p>${messageText.replace(/\n/g, '<br>')}</p>`;
    document.querySelector('.chat-box').appendChild(messageDiv);
    scrollToBottom()
}


// Show first message when the page is loaded
let chatCnt =0;
let userInfo = {name: 'Kazuki', greade: '7th greade'};
displayMessage('Welcome back '+ userInfo.name +'!\nWhat do you want to study today?', 'assistant');

// Event listener for the 'Enter' key
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent default Enter behavior (e.g., form submission)
        sendMessage(userInfo);           // Send the message
    }
});




