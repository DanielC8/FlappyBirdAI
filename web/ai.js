// AI Neural Network Implementation
class NeuralNetwork {
    constructor(weights = null) {
        this.numFeatures = 6;
        this.hiddenSize = 8;
        this.totalWeights = (this.numFeatures * this.hiddenSize) + this.hiddenSize + this.hiddenSize + 1;
        
        if (weights) {
            this.weights = weights;
        } else {
            this.weights = this.xavierInit();
        }
        
        this.previousY = null;
    }
    
    xavierInit() {
        const limit = Math.sqrt(6.0 / (this.numFeatures + this.hiddenSize));
        const weights = [];
        for (let i = 0; i < this.totalWeights; i++) {
            weights.push((Math.random() * 2 - 1) * limit);
        }
        return weights;
    }
    
    tanh(x) {
        return Math.tanh(x);
    }
    
    forwardPass(state) {
        // Split weights
        const w1End = this.numFeatures * this.hiddenSize;
        const b1End = w1End + this.hiddenSize;
        const w2End = b1End + this.hiddenSize;
        
        // Reshape W1
        const W1 = [];
        for (let i = 0; i < this.numFeatures; i++) {
            W1[i] = [];
            for (let j = 0; j < this.hiddenSize; j++) {
                W1[i][j] = this.weights[i * this.hiddenSize + j];
            }
        }
        
        const b1 = this.weights.slice(w1End, b1End);
        const W2 = this.weights.slice(b1End, w2End);
        const b2 = this.weights[w2End];
        
        // Forward pass
        const hidden = [];
        for (let j = 0; j < this.hiddenSize; j++) {
            let sum = b1[j];
            for (let i = 0; i < this.numFeatures; i++) {
                sum += state[i] * W1[i][j];
            }
            hidden[j] = this.tanh(sum);
        }
        
        let output = b2;
        for (let j = 0; j < this.hiddenSize; j++) {
            output += hidden[j] * W2[j];
        }
        
        return { output, hidden };
    }
    
    getMove(gameState) {
        // Calculate velocity
        let velocity = 0;
        if (this.previousY !== null) {
            velocity = gameState.birdY - this.previousY;
        }
        this.previousY = gameState.birdY;
        
        // Enhanced state representation
        const enhancedState = [
            gameState.gapDistance / 256.0,                    // Normalized gap distance
            gameState.horizontalDistance / 568.0,             // Normalized horizontal distance
            gameState.birdY / 512.0,                         // Normalized bird height
            velocity / 10.0,                                 // Normalized velocity
            Math.min(gameState.horizontalDistance / 568.0, 1.0), // Urgency factor
            Math.abs(gameState.gapDistance) < 50 ? 1.0 : 0.0    // Binary: well-aligned with gap
        ];
        
        const result = this.forwardPass(enhancedState);
        return {
            decision: result.output > 0,
            output: result.output,
            hidden: result.hidden,
            inputs: enhancedState
        };
    }
}

// AI Controller Classes
class AIController {
    constructor(type = 'enhanced') {
        this.type = type;
        this.setupAI();
    }
    
    setupAI() {
        switch (this.type) {
            case 'enhanced':
                // Use pre-trained weights or random initialization
                this.ai = new NeuralNetwork();
                break;
            case 'simple':
                this.ai = new SimpleLinearAI();
                break;
            case 'random':
                this.ai = new RandomAI();
                break;
        }
    }
    
    getMove(gameState) {
        return this.ai.getMove(gameState);
    }
    
    reset() {
        if (this.ai.previousY !== undefined) {
            this.ai.previousY = null;
        }
    }
}

class SimpleLinearAI {
    constructor() {
        // Simple linear weights (similar to original implementation)
        this.weights = [-0.5, 0.1, -0.3, 0.8];
        this.previousY = null;
    }
    
    getMove(gameState) {
        const state = [
            gameState.gapDistance,
            gameState.horizontalDistance,
            gameState.birdY,
            gameState.bias
        ];
        
        let output = 0;
        for (let i = 0; i < this.weights.length; i++) {
            output += this.weights[i] * state[i];
        }
        
        return {
            decision: output > 0,
            output: output,
            hidden: [output], // Fake hidden layer for visualization
            inputs: state.map(x => x / 100) // Normalize for visualization
        };
    }
}

class RandomAI {
    constructor() {
        this.previousY = null;
    }
    
    getMove(gameState) {
        const decision = Math.random() < 0.1; // 10% chance to jump
        
        return {
            decision: decision,
            output: decision ? 1 : -1,
            hidden: [Math.random(), Math.random(), Math.random(), Math.random()], // Random for visualization
            inputs: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5] // Neutral inputs
        };
    }
}

// Pre-trained weights (you can replace these with actual trained weights)
const PRETRAINED_WEIGHTS = {
    enhanced: [
        // These would be actual weights from your trained model
        // For now, using random initialization that tends to work reasonably well
        -0.2, 0.3, -0.1, 0.4, 0.2, -0.3, 0.1, 0.5,
        0.3, -0.2, 0.4, -0.1, 0.2, 0.3, -0.4, 0.1,
        -0.1, 0.2, 0.3, -0.2, 0.4, 0.1, -0.3, 0.2,
        0.2, -0.1, 0.3, 0.4, -0.2, 0.1, 0.3, -0.4,
        0.1, 0.2, -0.3, 0.4, 0.2, -0.1, 0.3, 0.2,
        -0.2, 0.1, 0.4, -0.3, 0.2, 0.3, -0.1, 0.4,
        // Hidden biases
        0.1, -0.2, 0.3, 0.1, -0.1, 0.2, -0.3, 0.4,
        // Output weights
        0.5, -0.3, 0.2, 0.4, -0.1, 0.3, -0.2, 0.1,
        // Output bias
        0.0
    ]
};

// Function to load pre-trained weights
function loadPretrainedAI(type = 'enhanced') {
    if (PRETRAINED_WEIGHTS[type]) {
        return new NeuralNetwork(PRETRAINED_WEIGHTS[type]);
    }
    return new NeuralNetwork(); // Random initialization
}
