
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme
const initializeTheme = () => {
  const storedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(storedTheme);
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
