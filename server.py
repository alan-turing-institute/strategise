import os
import glob
import sys
import subprocess
import tempfile
from flask import Flask, jsonify, request
from flask_cors import CORS
import pygambit as gbt
from draw_tree import generate_pdf

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'game_data')

@app.route('/games', methods=['GET'])
def get_games():
    games = []
    desc_path = os.path.join(DATA_DIR, 'descriptions')
    code_path = os.path.join(DATA_DIR, 'code')
    
    if not os.path.exists(desc_path):
        return jsonify([])

    # List all .txt files in descriptions
    # Prioritize markdown files, then txt
    files = glob.glob(os.path.join(desc_path, '*.md')) + glob.glob(os.path.join(desc_path, '*.txt'))
    seen_ids = set()

    for f in files:
        game_id = os.path.splitext(os.path.basename(f))[0]
        if game_id in seen_ids:
            continue
        seen_ids.add(game_id)
        
        # Read Description
        with open(f, 'r') as df:
            description = df.read()
            
        # Read Code (if exists)
        code_file = os.path.join(code_path, f"{game_id}.py")
        mock_code = ""
        if os.path.exists(code_file):
            with open(code_file, 'r') as cf:
                mock_code = cf.read()
                
        games.append({
            "id": game_id,
            "name": game_id.replace('_', ' ').title(),
            "description": description,
            "mockCode": mock_code,
            "nashOutput": "Select an algorithm to compute." # Placeholder
        })
        
    return jsonify(games)

@app.route('/visualize', methods=['POST'])
def visualize():
    data = request.json
    code = data.get('code', '')
    
    try:
        # Execute the code to get the 'game' object
        local_scope = {}
        # Inject gbt into globals to support code that assumes 'import pygambit as gbt' or uses gbt directly
        exec(code, {'gbt': gbt}, local_scope)
        game = local_scope.get('game')
        
        if game is None:
            game = local_scope.get('g')

        if not isinstance(game, gbt.Game):
            return jsonify({"error": "Code did not produce a 'game' variable of type pygambit.Game"}), 400

        # Generate visualization PDF using draw_tree
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, 'tree.pdf')
            generate_pdf(game, color_scheme="gambit", save_to=pdf_path)
            # Convert to SVG using pdf2svg
            svg_path = os.path.join(tmpdir, 'tree.svg')
            subprocess.run(['pdf2svg', pdf_path, svg_path], check=True)
            with open(svg_path, 'r') as svg_file:
                svg_content = svg_file.read()
            return jsonify({"svg": svg_content})
            
    except Exception as e:
        print(f"Server error in /visualize: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)