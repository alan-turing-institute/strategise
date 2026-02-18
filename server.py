import os
import glob
import sys
import subprocess
import tempfile
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
import pygambit as gbt
from draw_tree import generate_pdf

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'game_data')

def extract_python_code_from_text(text_content):
    """
    Extract Python code from a text file that contains formatted Python code blocks.
    Looks for lines between triple backticks (```python and ```)
    """
    # Find all code blocks between ```python and ```
    pattern = r'```python\n(.*?)\n```'
    matches = re.findall(pattern, text_content, re.DOTALL)
    
    if matches:
        # Join all code blocks with newlines
        return '\n\n'.join(matches)
    
    return ""

def find_output_file(game_id, output_base_path):
    """
    Find the 1.txt output file for a given game.
    Handles directory name conversions from dataset pathnames to output directory names.
    """
    # Convert underscores to spaces
    game_dir_name = game_id.replace('_', ' ')
    
    # Handle special cases
    # Nim (with_five_in_one_pile) -> Nim (with 5 in one pile)
    if 'five' in game_dir_name.lower():
        game_dir_name = game_dir_name.replace('five', '5')
    
    output_file = os.path.join(output_base_path, game_dir_name, 'Correct', '1.txt')
    
    if os.path.exists(output_file):
        return output_file
    
    # If not found, try listing available directories and do a fuzzy match
    output_parent = output_base_path
    if os.path.exists(output_parent):
        available_dirs = [d for d in os.listdir(output_parent) if os.path.isdir(os.path.join(output_parent, d))]
        
        # Try to find a matching directory (case-insensitive, ignoring punctuation)
        normalized_game_name = game_dir_name.lower().replace('-', ' ').replace(',', '').replace('(', '').replace(')', '')
        for dir_name in available_dirs:
            normalized_dir = dir_name.lower().replace('-', ' ').replace(',', '').replace('(', '').replace(')', '')
            if normalized_game_name in normalized_dir or normalized_dir in normalized_game_name:
                candidate_file = os.path.join(output_parent, dir_name, 'Correct', '1.txt')
                if os.path.exists(candidate_file):
                    return candidate_file
    
    return None

def get_dataset_games():
    """
    Load games from GameInterpreter/Dataset and their corresponding Python code
    from GameInterpreter/Output/Setting D/GPT-4o
    """
    games = []
    base_path = os.path.join(BASE_DIR, 'GameInterpreter')
    
    # Check both Imperfect and Perfect Information games
    game_types = [
        ('Imperfect Information Games', 'Imperfect Information Games'),
        ('Perfect Information Games', 'Perfect Information Games')
    ]
    
    for dataset_subdir, output_subdir in game_types:
        dataset_path = os.path.join(base_path, 'Dataset', dataset_subdir)
        output_base_path = os.path.join(base_path, 'Output', 'Setting D', 'GPT-4o', output_subdir)
        
        if not os.path.exists(dataset_path):
            continue
        
        # List all .txt files in the dataset
        dataset_files = glob.glob(os.path.join(dataset_path, '*.txt'))
        
        for desc_file in dataset_files:
            # Get game filename without extension
            filename = os.path.basename(desc_file)
            game_id = os.path.splitext(filename)[0]
            
            # Read description
            with open(desc_file, 'r') as f:
                description = f.read()
            
            # Extract Python code from the output file
            mock_code = ""
            output_game_path = find_output_file(game_id, output_base_path)
            
            if output_game_path and os.path.exists(output_game_path):
                try:
                    with open(output_game_path, 'r') as f:
                        output_content = f.read()
                        mock_code = extract_python_code_from_text(output_content)
                except Exception as e:
                    print(f"Error reading {output_game_path}: {e}", file=sys.stderr)
            
            # Only add game if we found the code
            if mock_code:
                # Use the directory name as the display name (convert underscores to spaces)
                display_name = game_id.replace('_', ' ')
                games.append({
                    "id": game_id,
                    "name": display_name,
                    "description": description,
                    "mockCode": mock_code,
                    "nashOutput": "Select an algorithm to compute."
                })
    
    return games

@app.route('/games', methods=['GET'])
def get_games():
    games = get_dataset_games()
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

@app.route('/compute-nash', methods=['POST'])
def compute_nash():
    data = request.json
    code = data.get('code', '')
    algorithm = data.get('algorithm', 'enumpure')

    try:
        # Execute the code to get the 'game' object
        local_scope = {}
        exec(code, {'gbt': gbt}, local_scope)
        game = local_scope.get('game')
        
        if game is None:
            game = local_scope.get('g')

        if not isinstance(game, gbt.Game):
            return jsonify({"error": "Code did not produce a 'game' variable of type pygambit.Game"}), 400

        # Select and run the solver
        solvers = {
            "enumpure": gbt.nash.enumpure_solve,
            "enummixed": gbt.nash.enummixed_solve,
            "lp": gbt.nash.lp_solve,
            "lcp": gbt.nash.lcp_solve,
            "liap": gbt.nash.liap_solve,
            "logit": gbt.nash.logit_solve,
            "simpdiv": gbt.nash.simpdiv_solve,
            "ipa": gbt.nash.ipa_solve,
            "gnm": gbt.nash.gnm_solve,
        }
        solver = solvers.get(algorithm)
        if not solver:
            return jsonify({"error": f"Unknown algorithm: {algorithm}"}), 400

        solver_output = solver(game)

        # External solvers return a result object with an .equilibria attribute.
        # Internal python solvers can return a list of profiles, or a single profile.
        if hasattr(solver_output, 'equilibria'):
            equilibria = solver_output.equilibria
        elif isinstance(solver_output, list):
            equilibria = solver_output
        else: # Assuming a single NashProfile object was returned
            equilibria = [solver_output]

        results = "\n".join([f"NE {i+1}: {eq}" for i, eq in enumerate(equilibria)])
        return jsonify({"results": results or "No equilibria found by this solver."})

    except Exception as e:
        print(f"Server error in /compute-nash: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)