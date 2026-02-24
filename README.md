# game

Tool for translation of game theory natural language descriptions to code and visuals.

This is a code bundle for GameInterpreter Webapp.

Table of contents:
- [Running the app locally](#running-the-app-locally)
    - [Configure your LLM service](#configure-your-llm-service)
    - [Application setup](#application-setup)
- [Example Games Data Source](#example-games-data-source)
- [Testing](#testing)
    

# Running the app locally

To run the GameInterpreter pipeline with an LLM, choose your LLM service and follow one of configuration steps below.
You can then move on to the [Application setup](#application-setup) section.

## Configure your LLM service

### Gemini

1. Get an API key from Google AI Studio.
2. Create a `.env` file in the root directory.
3. Add your key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

### Claude

*NOT IMPLEMENTED*

### OpenAI

*NOT IMPLEMENTED*

### Local models

*NOT IMPLEMENTED*

Application setup
-----------------

To set up the application, either use Docker, or install the dependencides manually.

> Note: If you already have LaTeX installed then manual setup may be faster than waiting for the docker build.

### Option 1: Docker (Recommended)

Docker provides a consistent, isolated environment with all dependencies pre-installed. This is the easiest way to get started.
Follow the steps below; there's also more info on Docker and truobleshooting in [DOCKER.md](DOCKER.md).

**Prerequisites:**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop) for your OS.

**Steps:**

1. Build and start the application:
   - macOS:
        ```bash
        docker compose up --build
        ```
    - Linux
        ```bash
        docker-compose up --build
        ```  

2. Open your browser to `http://localhost:5173`

    - The backend API runs on `http://localhost:5000` (automatic)

3. To stop the containers:
   - macOS:
        ```bash
        docker compose down
        ```
    - Linux
        ```bash
        docker-compose down
        ```  

**Notes:**
- First build takes 2-3 minutes (installs LaTeX ~1.5GB)
- Subsequent runs are instant
- Code changes auto-reload in both frontend and backend
- No need to manually install LaTeX, pdf2svg, or Python dependencies

### Option 2: Manual Setup

**Prerequisites:**
- Run `npm i` to install the JS dependencies.
- Install LaTeX
    - macOS:
        - Install [MacTEX](https://www.tug.org/mactex/mactex-download.html)
        - or `brew install --cask mactex`
    - Ubuntu:
        - `sudo apt-get install texlive-full`
- Install "pdf2svg"
    - macOS:
        - `brew install pdf2svg`
    - Ubuntu:
        - `sudo apt install pdf2svg`
- Run the following for Python:
    - `conda create -n gameint python=3.14`
    - `conda activate gameint`
    - `pip install -r requirements.txt`

**Starting the application:**
- In two separate terminal tabs:
    - Run `python server.py` to start the Flask backend.
    - Run `npm run dev` to start the development server.

# Testing

The project includes a test suite for both the backend (Python/Flask) and frontend (React/Vite), which are automatically run by a GitHub Action on every push.

## Running Tests with Docker (Recommended)

You can run the tests within the Docker containers to ensure the environment is identical to the CI pipeline.

### Backend Tests

- macOS:
    ```bash
    docker compose run --rm api pytest
    ```
- Linux:
    ```bash
    docker-compose run --rm api pytest
    ```

### Frontend Tests

- macOS
    ```bash
    docker compose run --rm web npm test
    ```
- Linux
    ```bash
    docker-compose run --rm web npm test
    ```

## Running Tests Manually

### Frontend Tests

The frontend uses Vitest and React Testing Library.

**Prerequisites:**

Ensure you have installed the development dependencies:
```bash
npm install
```

**Running Tests:**

```bash
npm test
```

### Backend Tests

The backend uses Pytest.

**Prerequisites:**

Ensure you have installed the Python dependencies from `requirements.txt`.

**Running Tests:**

```bash
pytest
```

# Example Games Data Source

The app loads example games and pre-computed game codes from the [GameInterpreter V1 experiment](https://github.com/zczlsde/GameInterpreter) associated with [From Natural Language to Extensive-Form Game Representations](https://arxiv.org/html/2501.17282v1).

## Example Game Descriptions
- **Location**: From GameInterpreter V1 experiment [Dataset](https://github.com/zczlsde/GameInterpreter/tree/main/Dataset) e.g. `GameInterpreter/Dataset/Imperfect Information Games/` and `GameInterpreter/Dataset/Perfect Information Games/`
- **Format**: Text files (*.txt) containing natural language game descriptions
- **Used by**: "Load Example..." dropdown in the app

## Example pre-computed Python Code
- **Location**: From GameInterpreter V1 experiment [Setting D with GPT-4o](https://github.com/zczlsde/GameInterpreter/tree/main/Output/Setting%20D/GPT-4o) e.g. `GameInterpreter/Output/Setting D/GPT-4o/[Imperfect|Perfect] Information Games/<game_name>/Correct/1.txt`
- **Format**: Text files containing multiple Python code blocks (separated by ` ``` `)
- **Extraction**: The app loads all `.txt` files found in the `Correct` directory for a game. It uses the **second code block** from each file, which contains the complete game creation script.

## Directory Structure Example
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

## Note on Code Processing
The extracted Python code automatically:
- Creates a game object named `g` compatible with `pygambit`
- Removes file write/save operations (to allow visualization and Nash computation)
- Is executable as-is for game tree visualization and equilibrium analysis