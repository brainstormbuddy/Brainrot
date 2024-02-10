from flask import Flask, jsonify, request
import whisper

app = Flask(__name__)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    data = request.json
    audio_path = data.get('audio_path')  # Use the correct key to get the audio path
    
    # Load and transcribe the audio
    audio = whisper.load_audio(audio_path)
    model = whisper.load_model("tiny", device="cpu")
    result = whisper.transcribe(model, audio, language="en")
    
    # Return the transcription result as JSON
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)  # Run in debug mode