import { MemoryRouter as Router } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import './App.css';

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
