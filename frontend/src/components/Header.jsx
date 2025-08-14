import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import logoImage from '../content/images/logo.png';

const Header = () => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);

  // Particle animation for the header
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 20;
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Create particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        // GEMS Orange color with random opacity
        this.color = `rgba(242, 146, 19, ${Math.random() * 0.5 + 0.1})`;
        this.shape = Math.floor(Math.random() * 3); // 0: circle, 1: square, 2: hexagon
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        
        if (this.shape === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === 1) {
          // Square
          ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(
              this.x + this.size * Math.cos((Math.PI / 3) * i),
              this.y + this.size * Math.sin((Math.PI / 3) * i)
            );
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      // Clear canvas with slight opacity to create trails
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connect particles with lines if close enough
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(242, 146, 19, ${0.2 - distance * 0.002})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative py-12 overflow-hidden">
      {/* Background particle animation */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className={`relative flex items-center justify-center h-16 w-16 
            rounded-full ${theme === 'dark' ? 'bg-dark-surface' : 'bg-white'} 
            shadow-lg mr-3 overflow-hidden group`}
          >
            <img 
              src={logoImage} 
              alt="GEMS Logo" 
              className="h-12 w-12 object-contain transition-transform duration-700 
              group-hover:scale-110 relative z-10"
            />
            
            {/* Orange glow effect */}
            <div className="absolute inset-0 bg-gems-orange opacity-0 group-hover:opacity-10 
              transition-opacity duration-700 rounded-full"></div>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold relative 
            ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
            <span className="relative">
              GEMS 
              <span className="text-gems-orange">AI</span> 
              Search
              
              {/* Underline effect */}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-gradient 
                rounded-full transform scale-x-0 group-hover:scale-x-100 
                transition-transform origin-left duration-500"></span>
            </span>
          </h1>
        </div>
        
        <p className={`text-${theme === 'dark' ? 'dark-text-secondary' : 'gray-600'} 
          max-w-3xl mx-auto text-lg mb-6`}>
          Search your GEMS database using natural language. Ask about companies, clients, 
          sites, bookings, candidates, timesheets, and more in plain English.
        </p>
      </div>
    </div>
  );
};

export default Header;
