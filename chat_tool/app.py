from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chats.db'  # SQLite for simplicity
db = SQLAlchemy(app)
CORS(app)

# Define the database model for chat history
class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_message = db.Column(db.String(500), nullable=False)
    assistant_message = db.Column(db.String(500), nullable=False)

# Create the database
with app.app_context():
    db.create_all()

# API route to save chat messages to the database
@app.route('/save_chat', methods=['POST'])
def save_chat():
    user_message = request.json.get('user_message')
    assistant_message = request.json.get('assistant_message')

    print(f"User Message: {user_message}, Assistant Message: {assistant_message}") 

    new_chat = ChatHistory(user_message=user_message, assistant_message=assistant_message)
    db.session.add(new_chat)
    db.session.commit()

    return jsonify({"message": "Chat saved!"}), 200

# API route to get chat history from the database
@app.route('/get_chat_history', methods=['GET'])
def get_chat_history():
    chats = ChatHistory.query.all()
    chat_history = [{"user_message": chat.user_message, "assistant_message": chat.assistant_message} for chat in chats]
    return jsonify(chat_history), 200

if __name__ == '__main__':
    app.run(debug=True)


