
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a container for our app
const container = document.getElementById("root");

// Make sure the container exists
if (!container) {
  throw new Error("Root element not found in the document");
}

// Create a root and render our app
const root = createRoot(container);
root.render(<App />);
