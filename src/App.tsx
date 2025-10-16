import React from 'react';
import { PostWall } from './components/PostWall';
import { ToastProvider } from './contexts/ToastContext';
import './styles/main.scss';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="app">
        <PostWall />
      </div>
    </ToastProvider>
  );
};

export default App;
