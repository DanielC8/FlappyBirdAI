import numpy as np
from copy import copy, deepcopy
import random
from genetic_helper import *


class Genetic_AI:
    def __init__(self, genotype=None, num_features=6, hidden_size=8, mutate=False, noise_sd=0.1):
        """
        Enhanced AI with a simple neural network architecture
        
        Args:
            genotype: Weight vector for the neural network
            num_features: Number of input features (default: 6)
            hidden_size: Number of hidden neurons (default: 8)
            mutate: Whether to apply mutation
            noise_sd: Standard deviation for mutation noise
        """
        self.num_features = num_features
        self.hidden_size = hidden_size
        
        # Calculate total weights needed: input->hidden + hidden biases + hidden->output + output bias
        total_weights = (num_features * hidden_size) + hidden_size + hidden_size + 1
        
        if genotype is None:
            # Xavier initialization for better training
            self.genotype = self._xavier_init(total_weights)
        else:
            if not mutate:
                self.genotype = genotype
            else:
                # Additive Gaussian mutation (more stable than multiplicative)
                mutation = np.random.normal(0, noise_sd, len(genotype))
                self.genotype = genotype + mutation
                # Clip to prevent extreme values
                self.genotype = np.clip(self.genotype, -3, 3)

        self.fit_score = 0.0
        self.fit_rel = 0.0
        self.previous_y = None  # Track bird's previous position for velocity calculation

    def _xavier_init(self, size):
        """Xavier initialization for neural network weights"""
        limit = np.sqrt(6.0 / (self.num_features + self.hidden_size))
        return np.random.uniform(-limit, limit, size)

    def __lt__(self, other):
        return self.fit_score < other.fit_score

    def _forward_pass(self, state):
        """Forward pass through the neural network"""
        # Split weights
        w1_end = self.num_features * self.hidden_size
        b1_end = w1_end + self.hidden_size
        w2_end = b1_end + self.hidden_size
        
        W1 = self.genotype[:w1_end].reshape(self.num_features, self.hidden_size)
        b1 = self.genotype[w1_end:b1_end]
        W2 = self.genotype[b1_end:w2_end]
        b2 = self.genotype[w2_end]
        
        # Forward pass
        hidden = np.tanh(np.dot(state, W1) + b1)  # Hidden layer with tanh activation
        output = np.dot(hidden, W2) + b2  # Output layer
        
        return output

    def getMove(self, state):
        """Enhanced decision making with neural network"""
        # Calculate bird velocity if we have previous position
        if self.previous_y is not None:
            velocity = state[2] - self.previous_y  # Current y - previous y
        else:
            velocity = 0
        
        self.previous_y = state[2]
        
        # Enhanced state representation
        enhanced_state = np.array([
            state[0] / 256.0,  # Normalized gap distance
            state[1] / 568.0,  # Normalized horizontal distance
            state[2] / 512.0,  # Normalized bird height
            velocity / 10.0,   # Normalized velocity
            min(state[1] / 568.0, 1.0),  # Urgency factor (closer pipe = more urgent)
            1.0 if abs(state[0]) < 50 else 0.0  # Binary: is bird well-aligned with gap?
        ])
        
        output = self._forward_pass(enhanced_state)
        return output > 0