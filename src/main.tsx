import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import "@/ui/foundation/variables.css";
import App from './App';
import './index.css';
import './styles/globals.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered (scripts/prerender.mjs); dev serves an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
