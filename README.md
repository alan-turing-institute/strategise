# game

Tool for translation of game theory natural language descriptions to code and visuals.

This is a code bundle for GameInterpreter Webapp.

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