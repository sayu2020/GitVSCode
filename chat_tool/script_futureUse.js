async function sendMessage() {
    const userInput = document.getElementById("userInput").value;

    if (userInput.trim() !== "") {
        // Display user message
        displayMessage(userInput, "user");

        // Clear the input field
        document.getElementById("userInput").value = "";

        // Call the backend API to get a bot response
        const botReply = await getBotResponse(userInput);
        displayMessage(botReply, "bot");
    }
}

async function getBotResponse(userMessage) {
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        return data.message || "Sorry, something went wrong.";
    } catch (error) {
        console.error("Error:", error);
        return "Sorry, there was an error connecting to the server.";
    }
}
