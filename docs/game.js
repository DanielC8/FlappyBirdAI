// Flappy Bird Game Engine
class FlappyBirdGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game constants
        this.GRAVITY = 0.5;
        this.JUMP_FORCE = -8;
        this.PIPE_SPEED = 2;
        this.PIPE_GAP = 120;
        this.PIPE_WIDTH = 80;
        this.BIRD_SIZE = 20;
        
        // Game state
        this.reset();
        
        // Colors
        this.colors = {
            background: '#87CEEB',
            bird: '#FFD700',
            pipe: '#228B22',
            pipeTop: '#32CD32',
            ground: '#8B4513'
        };
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    reset() {
        this.bird = {
            x: 100,
            y: this.height / 2,
            velocity: 0,
            previousY: this.height / 2
        };
        
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
        this.startTime = Date.now();
        
        // Add first pipe
        this.addPipe();
    }
    
    addPipe() {
        const minHeight = 50;
        const maxHeight = this.height - this.PIPE_GAP - minHeight - 50;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        const bottomHeight = this.height - topHeight - this.PIPE_GAP - 50; // Account for ground
        
        this.pipes.push({
            x: this.width,
            topHeight: topHeight,
            bottomY: topHeight + this.PIPE_GAP,
            bottomHeight: bottomHeight,
            passed: false
        });
    }
    
    jump() {
        this.bird.velocity = this.JUMP_FORCE;
    }
    
    update() {
        if (this.gameOver) return;
        
        this.frameCount++;
        
        // Update bird
        this.bird.previousY = this.bird.y;
        this.bird.velocity += this.GRAVITY;
        this.bird.y += this.bird.velocity;
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.PIPE_SPEED;
            
            // Remove pipes that are off screen
            if (pipe.x + this.PIPE_WIDTH < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Check for scoring
            if (!pipe.passed && pipe.x + this.PIPE_WIDTH < this.bird.x) {
                pipe.passed = true;
                this.score++;
            }
            
            // Check for collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                return;
            }
        }
        
        // Add new pipes
        if (this.frameCount % 120 === 0) {
            this.addPipe();
        }
        
        // Check ground/ceiling collision
        if (this.bird.y < 0 || this.bird.y + this.BIRD_SIZE > this.height - 50) {
            this.gameOver = true;
        }
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.BIRD_SIZE;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.BIRD_SIZE;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.PIPE_WIDTH;
        
        // Check if bird is in pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    getGameState() {
        // Find the next pipe - match Python logic exactly
        let nextPipe = null;
        for (const pipe of this.pipes) {
            if (pipe.x + this.PIPE_WIDTH > this.bird.x) {
                nextPipe = pipe;
                break;
            }
        }
        
        if (!nextPipe) {
            return null;
        }
        
        // Calculate state values - match Python exactly
        const gapCenter = nextPipe.topHeight + (this.height - nextPipe.topHeight - nextPipe.bottomHeight) / 2;
        const birdCenter = this.bird.y + this.BIRD_SIZE / 2;
        const gapDistance = gapCenter - birdCenter;
        const horizontalDistance = nextPipe.x - this.bird.x;
        
        return {
            gapDistance: gapDistance,
            horizontalDistance: horizontalDistance,
            birdY: this.bird.y,
            velocity: this.bird.velocity,
            bias: 1,
            nextPipe: nextPipe
        };
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw pipes
        this.pipes.forEach(pipe => this.drawPipe(pipe));
        
        // Draw bird
        this.drawBird();
        
        // Draw ground
        this.ctx.fillStyle = this.colors.ground;
        this.ctx.fillRect(0, this.height - 50, this.width, 50);
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}`, this.width / 2, 40);
        
        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, this.height / 2);
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Bird body
        this.ctx.fillStyle = this.colors.bird;
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + this.BIRD_SIZE/2, this.bird.y + this.BIRD_SIZE/2, this.BIRD_SIZE/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + this.BIRD_SIZE/2 + 3, this.bird.y + this.BIRD_SIZE/2 - 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + this.BIRD_SIZE/2 + 4, this.bird.y + this.BIRD_SIZE/2 - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.BIRD_SIZE, this.bird.y + this.BIRD_SIZE/2);
        this.ctx.lineTo(this.bird.x + this.BIRD_SIZE + 8, this.bird.y + this.BIRD_SIZE/2 - 2);
        this.ctx.lineTo(this.bird.x + this.BIRD_SIZE + 8, this.bird.y + this.BIRD_SIZE/2 + 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipe(pipe) {
        // Top pipe
        this.ctx.fillStyle = this.colors.pipe;
        this.ctx.fillRect(pipe.x, 0, this.PIPE_WIDTH, pipe.topHeight);
        
        // Top pipe cap
        this.ctx.fillStyle = this.colors.pipeTop;
        this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.PIPE_WIDTH + 10, 20);
        
        // Bottom pipe
        this.ctx.fillStyle = this.colors.pipe;
        this.ctx.fillRect(pipe.x, pipe.bottomY, this.PIPE_WIDTH, this.height - pipe.bottomY - 50);
        
        // Bottom pipe cap
        this.ctx.fillStyle = this.colors.pipeTop;
        this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.PIPE_WIDTH + 10, 20);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Simple cloud shapes
        const cloudY = 80;
        const cloudPositions = [150, 350, 500];
        
        cloudPositions.forEach((x, i) => {
            const offset = (this.frameCount * 0.2 + i * 100) % (this.width + 100);
            this.drawCloud(x + offset - 100, cloudY + Math.sin(this.frameCount * 0.01 + i) * 10);
        });
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    getSurvivalTime() {
        return ((Date.now() - this.startTime) / 1000).toFixed(1);
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    start() {
        this.gameLoop();
    }
}
