// Main App component for Omnivore Vite migration
// Uses AppRouter for proper React Router navigation

import React from 'react'
import AppRouter from './router/AppRouter'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app">
      <AppRouter />
    </div>
  )
}

export default App
