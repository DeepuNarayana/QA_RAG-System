from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/v1/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    prompt = data.get('prompt') or data.get('input') or ""
    # Very small deterministic response for local testing
    response_text = f"Mock LLM response for prompt: {prompt[:200]}"
    return jsonify({
        'id': 'mock-1',
        'object': 'text_completion',
        'created': 0,
        'model': 'mock-llm-1',
        'choices': [
            {
                'text': response_text,
                'index': 0,
                'logprobs': None,
                'finish_reason': 'stop'
            }
        ],
        'usage': {
            'prompt_tokens': len(prompt.split()),
            'completion_tokens': len(response_text.split()),
            'total_tokens': len(prompt.split()) + len(response_text.split())
        }
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
