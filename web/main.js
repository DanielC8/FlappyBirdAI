// Main application controller
class FlappyBirdAIApp {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.game = new FlappyBirdGame(this.canvas);
        this.aiController = new AIController('enhanced');
        
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        
        // Statistics
        this.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            scores: []
        };
        
        this.setupEventListeners();
        this.updateUI();
        this.loadStats();
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Model selector
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.aiController = new AIController(e.target.value);
            this.resetGame();
        });
        
        // Keyboard controls (for manual testing)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRunning) {
                e.preventDefault();
                this.game.jump();
            }
        });
    }
    
    startGame() {
        if (this.isRunning && !this.isPaused) return;
        
        if (!this.isRunning) {
            this.resetGame();
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.aiController.reset();
        this.gameLoop();
        
        document.getElementById('startBtn').textContent = 'Running...';
        document.getElementById('startBtn').disabled = true;
    }
    
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            cancelAnimationFrame(this.animationId);
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else {
            this.gameLoop();
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
    }
    
    resetGame() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.game.reset();
        this.aiController.reset();
        this.updateUI();
        
        document.getElementById('startBtn').textContent = 'Start AI';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').textContent = 'Pause';
        
        // Clear AI visualization
        this.clearAIVisualization();
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Get current game state
        const gameState = this.game.getGameState();
        
        if (gameState && !this.game.gameOver) {
            // Get AI decision
            const aiResult = this.aiController.getMove(gameState);
            
            // Apply AI decision
            if (aiResult.decision) {
                this.game.jump();
            }
            
            // Update AI visualization
            this.updateAIVisualization(aiResult, gameState);
        }
        
        // Update game
        this.game.update();
        this.game.render();
        
        // Update UI
        this.updateUI();
        
        // Check if game is over
        if (this.game.gameOver) {
            this.handleGameOver();
            return;
        }
        
        // Continue game loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    handleGameOver() {
        this.isRunning = false;
        
        // Update statistics
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.game.score;
        this.stats.scores.push(this.game.score);
        
        if (this.game.score > this.stats.highScore) {
            this.stats.highScore = this.game.score;
        }
        
        // Keep only last 100 scores for average calculation
        if (this.stats.scores.length > 100) {
            this.stats.scores = this.stats.scores.slice(-100);
        }
        
        this.saveStats();
        this.updateUI();
        
        // Auto-restart after a short delay
        setTimeout(() => {
            if (!this.isPaused) {
                this.startGame();
            }
        }, 2000);
        
        document.getElementById('startBtn').textContent = 'Start AI';
        document.getElementById('startBtn').disabled = false;
    }
    
    updateUI() {
        // Update score displays
        document.getElementById('score').textContent = this.game.score;
        document.getElementById('highScore').textContent = this.stats.highScore;
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        
        // Calculate average score
        const avgScore = this.stats.scores.length > 0 
            ? (this.stats.scores.reduce((a, b) => a + b, 0) / this.stats.scores.length).toFixed(1)
            : '0';
        document.getElementById('avgScore').textContent = avgScore;
        
        // Update survival time
        document.getElementById('survivalTime').textContent = this.game.getSurvivalTime() + 's';
    }
    
    updateAIVisualization(aiResult, gameState) {
        // Update decision indicator
        const decisionEl = document.getElementById('decision');
        if (aiResult.decision) {
            decisionEl.textContent = '🚀 JUMP!';
            decisionEl.className = 'decision-indicator decision-jump';
        } else {
            decisionEl.textContent = '⬇️ FALL';
            decisionEl.className = 'decision-indicator decision-fall';
        }
        
        // Update input neurons
        if (aiResult.inputs) {
            aiResult.inputs.forEach((value, index) => {
                const neuron = document.getElementById(`input${index}`);
                if (neuron) {
                    neuron.textContent = value.toFixed(2);
                    neuron.className = 'neuron';
                    if (Math.abs(value) > 0.5) {
                        neuron.classList.add('active');
                    }
                }
            });
        }
        
        // Update hidden layer neurons
        if (aiResult.hidden) {
            const hiddenNeurons = document.querySelectorAll('#hiddenLayer .neuron');
            aiResult.hidden.forEach((value, index) => {
                if (hiddenNeurons[index]) {
                    hiddenNeurons[index].className = 'neuron';
                    if (Math.abs(value) > 0.3) {
                        hiddenNeurons[index].classList.add('active');
                    }
                }
            });
        }
        
        // Update output neuron
        const outputNeuron = document.getElementById('output');
        if (outputNeuron) {
            outputNeuron.className = 'neuron';
            if (aiResult.decision) {
                outputNeuron.classList.add('active');
            }
        }
    }
    
    clearAIVisualization() {
        // Clear decision
        document.getElementById('decision').textContent = 'Waiting...';
        document.getElementById('decision').className = 'decision-indicator';
        
        // Clear all neurons
        const neurons = document.querySelectorAll('.neuron');
        neurons.forEach(neuron => {
            neuron.className = 'neuron';
            if (neuron.id.startsWith('input')) {
                neuron.textContent = '0';
            }
        });
    }
    
    saveStats() {
        localStorage.setItem('flappyBirdAIStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('flappyBirdAIStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlappyBirdAIApp();
});

// Export trained weights from Python model (utility function)
function exportWeightsFromPython() {
    console.log(`
To export weights from your Python model, add this code to your genetic_controller.py:

import json

def export_best_agent_weights(agent, filename='best_weights.json'):
    weights_data = {
        'weights': agent.genotype.tolist(),
        'fitness': agent.fit_score,
        'architecture': {
            'num_features': 6,
            'hidden_size': 8,
            'total_weights': len(agent.genotype)
        }
    }
    
    with open(f'web/{filename}', 'w') as f:
        json.dump(weights_data, f, indent=2)
    
    print(f"Weights exported to web/{filename}")

# Call this after training:
# export_best_agent_weights(best_agent)
    `);
}

// Function to load weights from JSON file
async function loadWeightsFromFile(filename = 'best_weights.json') {
    try {
        const response = await fetch(filename);
        const data = await response.json();
        
        // Update the AI with new weights
        if (window.app) {
            window.app.aiController.ai = new NeuralNetwork(data.weights);
            console.log('Loaded trained weights with fitness:', data.fitness);
        }
        
        return data;
    } catch (error) {
        console.log('Could not load weights file:', error.message);
        console.log('Using random initialization instead.');
        return null;
    }
}
