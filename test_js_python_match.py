#!/usr/bin/env python3
"""
Test script to verify JavaScript and Python neural network implementations match
"""

import json
import numpy as np
from genetic import Genetic_AI

def test_neural_network_match():
    """Test that Python and JavaScript implementations produce the same results"""
    
    # Load the weights from the JSON file
    try:
        with open('docs/best_weights.json', 'r') as f:
            data = json.load(f)
        weights = np.array(data['weights'])
        print(f"✅ Loaded {len(weights)} weights from best_weights.json")
        print(f"📊 Original fitness: {data['fitness']}")
    except FileNotFoundError:
        print("❌ best_weights.json not found!")
        return
    
    # Create AI with loaded weights
    ai = Genetic_AI(genotype=weights)
    
    # Test with some sample game states
    test_states = [
        [0, 200, 256, 1],      # Bird at center, pipe far
        [-50, 100, 200, 1],   # Bird below gap, pipe close
        [50, 150, 300, 1],    # Bird above gap, pipe medium distance
        [0, 50, 256, 1],      # Bird centered, pipe very close
    ]
    
    print("\n🧪 Testing neural network with sample states:")
    print("Format: [gap_distance, horizontal_distance, bird_y, bias]")
    print("=" * 60)
    
    for i, state in enumerate(test_states):
        # Get Python AI decision
        decision = ai.getMove(state)
        
        # Get the enhanced state that should be used
        velocity = 0  # First call, no previous position
        ai.previous_y = state[2]  # Set for next call
        
        enhanced_state = np.array([
            state[0] / 256.0,  # Normalized gap distance
            state[1] / 568.0,  # Normalized horizontal distance
            state[2] / 512.0,  # Normalized bird height
            velocity / 10.0,   # Normalized velocity
            min(state[1] / 568.0, 1.0),  # Urgency factor
            1.0 if abs(state[0]) < 50 else 0.0  # Binary: well-aligned with gap?
        ])
        
        # Get raw neural network output
        output = ai._forward_pass(enhanced_state)
        
        print(f"Test {i+1}: {state}")
        print(f"  Enhanced state: {enhanced_state}")
        print(f"  Raw output: {output:.6f}")
        print(f"  Decision: {'JUMP' if decision else 'FALL'}")
        print(f"  JavaScript should use: {enhanced_state.tolist()}")
        print()
    
    # Output JavaScript test code
    print("🔧 JavaScript test code (paste in browser console):")
    print("=" * 60)
    js_code = f"""
// Test with the same weights
const testWeights = {weights.tolist()};
const testAI = new NeuralNetwork(testWeights);

// Test states (same as Python)
const testStates = {test_states};

console.log('🧪 JavaScript Neural Network Test Results:');
testStates.forEach((state, i) => {{
    const gameState = {{
        gapDistance: state[0],
        horizontalDistance: state[1], 
        birdY: state[2],
        bias: state[3]
    }};
    
    const result = testAI.getMove(gameState);
    console.log(`Test ${{i+1}}: ${{state}}`);
    console.log(`  Enhanced state: ${{result.inputs}}`);
    console.log(`  Raw output: ${{result.output}}`);
    console.log(`  Decision: ${{result.decision ? 'JUMP' : 'FALL'}}`);
    console.log('');
}});
"""
    
    print(js_code)

if __name__ == "__main__":
    test_neural_network_match()
