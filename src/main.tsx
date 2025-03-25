
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Criar a raiz do React apenas se o elemento existir
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Elemento 'root' não encontrado no DOM.");
}
