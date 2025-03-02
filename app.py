from flask import Flask, request, jsonify, send_file, render_template
import os
from werkzeug.utils import secure_filename
import pandas as pd
import json
from csv_enhancer import CSVEnhancer, generate_config_from_description

app = Flask(__name__, static_folder='./dist', static_url_path='/')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULT_FOLDER'] = 'results'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read CSV headers to display in the UI
        df = pd.read_csv(filepath)
        columns = df.columns.tolist()
        
        return jsonify({
            'success': True,
            'filename': filename,
            'columns': columns
        })
    
    return jsonify({'error': 'Invalid file format'}), 400

@app.route('/api/generate-config', methods=['POST'])
def generate_config():
    data = request.json
    description = data.get('description', '')
    columns = data.get('columns', [])
    
    # Generate configuration based on natural language description
    config = generate_config_from_description(description, columns)
    
    return jsonify({'config': config})

@app.route('/api/process', methods=['POST'])
def process_file():
    data = request.json
    filename = data.get('filename')
    config = data.get('config')
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    result_path = os.path.join(app.config['RESULT_FOLDER'], f"enhanced_{filename}")
    
    # Initialize the enhancer with the configuration
    enhancer = CSVEnhancer(config)
    
    # Process the file (this would be done asynchronously in a real app)
    enhancer.process_file(filepath, result_path)
    
    return jsonify({
        'success': True,
        'result_file': f"enhanced_{filename}"
    })

@app.route('/api/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['RESULT_FOLDER'], filename),
                     as_attachment=True)

# Handle React routing
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True) 