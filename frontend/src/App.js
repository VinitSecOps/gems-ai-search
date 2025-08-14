import React from 'react';
import GEMSAISearch from './components/GEMSAISearch';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen theme-transition">
        <ThemeToggle />
        <GEMSAISearch />
      </div>
    </ThemeProvider>
  );
}

export default App;