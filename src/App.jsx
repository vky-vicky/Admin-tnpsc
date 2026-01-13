import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/Toast/ToastContainer';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
