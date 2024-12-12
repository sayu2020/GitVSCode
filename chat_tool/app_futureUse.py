from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

# Set up OpenAI API key
openai.api_key = 'your-api-key'

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Get response from OpenAI (replace 'gpt-3.5-turbo' with 'gpt-4' if you have access)
    response = openai.Completion.create(
        model="gpt-3.5-turbo",
        prompt=user_message,
        max_tokens=150
    )

    bot_message = response.choices[0].text.strip()
    return jsonify({"message": bot_message})

if __name__ == "__main__":
    app.run(debug=True)
