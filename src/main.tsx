
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize the root element with strict mode disabled to avoid double rendering issues
createRoot(document.getElementById("root")!).render(<App />);
