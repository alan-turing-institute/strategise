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