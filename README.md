# game

Tool for translation of game theory natural language descriptions to code and visuals.

This is a code bundle for GameInterpreter Webapp.

## Example Games Data Source

The app loads example games from the GameInterpreter project structure:

### Game Descriptions
- **Location**: `GameInterpreter/Dataset/Imperfect Information Games/` and `GameInterpreter/Dataset/Perfect Information Games/`
- **Format**: Text files (*.txt) containing natural language game descriptions
- **Used by**: "Load Example..." dropdown in the app

### Generated Python Code
- **Location**: `GameInterpreter/Output/Setting D/GPT-4o/[Imperfect|Perfect] Information Games/<game_name>/Correct/1.txt`
- **Format**: Text files containing multiple Python code blocks (separated by ` ``` `)
- **Extraction**: The app uses the **second code block** from each file, which contains the complete game creation script

### Directory Structure Example
```
GameInterpreter/
├── Dataset/
│   ├── Imperfect Information Games/
│   │   ├── Bach_or_Stravinsky.txt
│   │   ├── Kuhn_Poker.txt
│   │   └── ...
│   └── Perfect Information Games/
│       ├── Centipede.txt
│       ├── Tic-Tac-Toe.txt
│       └── ...
└── Output/
    └── Setting D/GPT-4o/
        ├── Imperfect Information Games/
        │   ├── Bach or Stravinsky/
        │   │   └── Correct/1.txt
        │   ├── Kuhn Poker/
        │   │   └── Correct/1.txt
        │   └── ...
        └── Perfect Information Games/
            ├── Centipede/
            │   └── Correct/1.txt
            ├── Tic-Tac-Toe/
            │   └── Correct/1.txt
            └── ...
```

### Note on Code Processing
The extracted Python code automatically:
- Creates a game object named `g` compatible with `pygambit`
- Removes file write/save operations (to allow visualization and Nash computation)
- Is executable as-is for game tree visualization and equilibrium analysis

## Running the code

- Run `npm i` to install the JS dependencies.
- Run the following for Python:
    - `conda create -n gameint python=3.14`
    - `conda activate gameint`
    - `pip install -r requirements.txt`
- pdf2svg
    - Mac: `brew install pdf2svg`
- In two separate terminal tabs:
    - Run `python server.py` to start the Flask backend.
    - Run `npm run dev` to start the development server.