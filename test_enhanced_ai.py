#!/usr/bin/env python3
"""
Test script for the enhanced Flappy Bird AI
"""

from genetic import Genetic_AI
from genetic_controller import run_X_epochs
import numpy as np

def test_neural_network():
    """Test the neural network functionality"""
    print("Testing Enhanced Neural Network AI...")
    
    # Create an AI agent
    ai = Genetic_AI()
    print(f"AI created with {len(ai.genotype)} weights")
    print(f"Network structure: 6 inputs -> 8 hidden -> 1 output")
    
    # Test with sample game state
    test_state = [50, 200, 256, 1]  # gap_distance, horizontal_distance, bird_y, bias
    
    decision = ai.getMove(test_state)
    print(f"Test decision for state {test_state}: {'JUMP' if decision else 'FALL'}")
    
    # Test velocity tracking
    test_state2 = [30, 180, 240, 1]
    decision2 = ai.getMove(test_state2)
    print(f"Test decision for state {test_state2}: {'JUMP' if decision2 else 'FALL'}")
    print(f"Velocity calculated: {ai.previous_y - test_state2[2] if ai.previous_y else 'N/A'}")

def run_quick_training():
    """Run a quick training session to test the system"""
    print("\nRunning quick training session...")
    print("This will train for 3 epochs with small population to test the system")
    
    try:
        run_X_epochs(
            num_epochs=3,
            num_trials=2,
            pop_size=10,
            num_elite=2,
            aggregate='blend',
            logging_file="test_run"
        )
        print("Training completed successfully!")
    except Exception as e:
        print(f"Training failed with error: {e}")

if __name__ == "__main__":
    test_neural_network()
    
    user_input = input("\nWould you like to run a quick training test? (y/n): ")
    if user_input.lower() == 'y':
        run_quick_training()
    else:
        print("Skipping training test. You can run genetic_controller.py for full training.")
