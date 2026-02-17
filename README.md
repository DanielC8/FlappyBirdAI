# Flappy Bird AI

AI that learns to play Flappy Bird using genetic algorithms and neural networks. Includes a Python training pipeline and a browser-based visualization dashboard.

![Demo of AI learning to play Flappy Bird](flappydemotrain.gif)

## How It Works

1. **Initialize**: Create a population of 50 neural networks with random weights.
2. **Evaluate**: Each network plays Flappy Bird. Fitness = survival time + (score x 5).
3. **Select**: Top performers survive via tournament selection. Top 5 are copied unchanged (elitism).
4. **Breed**: Parents are combined using blend crossover weighted by fitness.
5. **Mutate**: Offspring weights are perturbed with Gaussian noise (std=0.1, clipped to [-3, 3]).
6. **Repeat**: Run for N generations. Best agents are exported for the web demo.

## Neural Network

```
Input (6)            Hidden (8, tanh)     Output (1)
─────────            ────────────────     ──────────
Gap distance    ──┐
Horiz. distance ──┤
Bird Y position ──┼──→  8 neurons  ──→  Jump (>0) / Fall (<=0)
Velocity        ──┤
Urgency factor  ──┤
Alignment flag  ──┘
```

Total weights: 65 (48 input-hidden + 8 hidden biases + 8 hidden-output + 1 output bias). Xavier initialization. Inputs are normalized to roughly [-1, 1].

## Project Structure

```
flappybird.py          - Pygame game engine (manual play + AI play)
genetic.py             - Neural network AI class
genetic_controller.py  - Genetic algorithm training loop
genetic_helper.py      - Helper functions for state extraction
export_weights.py      - Export trained models to JSON for web use
test_enhanced_ai.py    - Neural network unit tests
test_js_python_match.py - Verify JS/Python implementations match
web/
  index.html           - Dashboard interface
  game.js              - Canvas-based game engine
  ai.js                - JS neural network implementation
  main.js              - App controller, stats, UI
  best_weights.json    - Pre-trained model weights
data/                  - Training run CSVs
images/                - Game sprites (bird, pipes, background)
```

## Usage

### Install dependencies

```bash
pip install -r requirements.txt
```

### Train the AI

```bash
python genetic_controller.py
```

Default: 50 epochs, population of 50, 3 trials per fitness evaluation. Results are saved to `data/`.

Custom training:

```python
from genetic_controller import run_X_epochs

run_X_epochs(
    num_epochs=50,
    num_trials=3,
    pop_size=50,
    num_elite=5,
    aggregate='blend',
    logging_file="my_run"
)
```

### Export trained weights for web

```bash
python export_weights.py
# Select option 1 to export best weights from a training CSV
```

### Run the web visualization

Open `web/index.html` in a browser. The dashboard shows:
- Live AI gameplay on canvas
- Neural network activations in real time
- Score, high score, average score, survival time
- Model selector (Enhanced NN, Simple Linear, Random baseline)

### Play manually

```bash
python flappybird.py
```

Controls: Space/Up/Enter to jump, P to pause, Esc to quit.

## Key Files

### `genetic.py` - Genetic_AI class

- `__init__()`: Creates network with Xavier-initialized weights or from a provided genotype.
- `_forward_pass(state)`: Runs input through hidden layer (tanh) to output.
- `getMove(state)`: Normalizes raw game state into 6 features, computes forward pass, returns True (jump) or False (fall).

### `genetic_controller.py` - Training loop

- `run_X_epochs()`: Main training function. Evaluates population, selects parents, breeds next generation.
- `compute_fitness()`: Runs agent through multiple game trials, removes outlier scores.
- `cross()`: Crossover operator (uniform, blend, or single-point).
- `tournament_selection()`: Selects parent from random subset of top performers.

### `flappybird.py` - Game engine

- `Bird`: Player sprite with physics (gravity sink, cosine-smoothed climb).
- `PipePair`: Randomly generated pipe obstacles with sprite-based collision.
- `mains(agent)`: Game loop for AI play. Returns fitness score.
- `main()`: Game loop for manual (keyboard) play.

## Requirements

- Python 3
- pygame
- numpy
- pandas
- A modern browser for the web visualization

## License

MIT
