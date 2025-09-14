# 🐦 Flappy Bird AI Web Visualization

A real-time web-based visualization of AI agents learning to play Flappy Bird using neural networks and genetic algorithms.

## 🚀 Features

- **Real-time AI Gameplay**: Watch AI agents play Flappy Bird in your browser
- **Neural Network Visualization**: See the AI's decision-making process in real-time
- **Multiple AI Models**: Compare different AI approaches (Enhanced Neural Network, Simple Linear, Random)
- **Performance Statistics**: Track scores, survival times, and learning progress
- **Responsive Design**: Works on desktop and mobile devices

## 🎮 How to Use

1. **Open the Game**: Open `index.html` in your web browser
2. **Select AI Model**: Choose from the dropdown menu:
   - **Enhanced Neural Network**: Advanced AI with 6 inputs, 8 hidden neurons
   - **Simple Linear Model**: Basic linear decision making
   - **Random AI**: Baseline random behavior
3. **Start Playing**: Click "Start AI" to watch the AI play
4. **Monitor Performance**: View real-time statistics and neural network activity

## 🧠 AI Visualization

The interface shows:
- **Decision Indicator**: Current AI decision (JUMP/FALL)
- **Neural Network**: Real-time neuron activation
- **Input Features**: 
  - Gap Distance (vertical alignment with pipe opening)
  - Pipe Distance (horizontal distance to next pipe)
  - Bird Y Position (current height)
  - Velocity (movement speed and direction)
  - Urgency Factor (how close the next pipe is)
  - Alignment Indicator (whether bird is well-positioned)

## 📊 Performance Metrics

- **Score**: Pipes successfully passed
- **High Score**: Best performance across all games
- **Games Played**: Total number of attempts
- **Average Score**: Mean performance over recent games
- **Survival Time**: How long the AI survived

## 🔧 Using Your Trained Models

To use weights from your Python training:

1. **Export Weights**: Run the export script:
   ```bash
   python export_weights.py
   ```

2. **Load in Browser**: The web app will automatically try to load `best_weights.json`

3. **Manual Export**: Add this to your Python code:
   ```python
   import json
   
   def export_weights(agent, filename='web/best_weights.json'):
       weights_data = {
           'weights': agent.genotype.tolist(),
           'fitness': agent.fit_score,
           'architecture': {
               'num_features': 6,
               'hidden_size': 8,
               'total_weights': len(agent.genotype)
           }
       }
       
       with open(filename, 'w') as f:
           json.dump(weights_data, f, indent=2)
   ```

## 🏗️ Architecture

### Game Engine (`game.js`)
- Canvas-based Flappy Bird implementation
- Physics simulation (gravity, collision detection)
- Pipe generation and movement
- Score tracking

### AI System (`ai.js`)
- Neural network implementation in JavaScript
- Multiple AI model types
- State preprocessing and normalization
- Decision making logic

### Visualization (`main.js`)
- Real-time neural network visualization
- Performance statistics tracking
- Game controls and UI management
- Local storage for persistent stats

## 🎯 AI Input Features

The enhanced AI uses 6 normalized input features:

1. **Gap Distance** (-1 to 1): Vertical distance to pipe opening center
2. **Horizontal Distance** (0 to 1): Distance to next pipe
3. **Bird Height** (0 to 1): Current Y position
4. **Velocity** (-1 to 1): Current movement speed
5. **Urgency Factor** (0 to 1): Proximity-based urgency
6. **Alignment** (0 or 1): Binary indicator of good positioning

## 🔬 Model Comparison

| Model Type | Complexity | Performance | Learning Speed |
|------------|------------|-------------|----------------|
| Enhanced Neural Network | High | Best | Fast |
| Simple Linear | Low | Moderate | Medium |
| Random | None | Poor | None |

## 🛠️ Customization

You can modify the AI behavior by:
- Adjusting neural network architecture in `ai.js`
- Changing input feature calculations
- Modifying game physics in `game.js`
- Adding new visualization elements

## 📱 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires modern browser with Canvas and ES6 support.

## 🐛 Troubleshooting

**AI not performing well?**
- Try exporting weights from a well-trained Python model
- Check that the neural network architecture matches (6 inputs, 8 hidden, 1 output)

**Visualization not updating?**
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

**Performance issues?**
- Close other browser tabs
- Try a different browser
- Reduce game speed if needed

## 🤝 Contributing

Feel free to enhance the visualization:
- Add new AI models
- Improve the neural network display
- Add training visualization
- Implement real-time learning

## 📄 License

This project uses the same license as the original Flappy Bird AI implementation.
