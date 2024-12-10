import random

def random_response():
    # 応答の候補
    responses = [
        '私はランダムに応答するチャットボットです',
        '本当はここにopenAIのAPIを利用したいです',
        'クレカが止まっているのでAPIを動かせませんでした；；',
        'Flask-SocketIOでリアルタイムに情報を反映しています'
    ]
    return responses[random.randint(0, len(responses)-1)]
