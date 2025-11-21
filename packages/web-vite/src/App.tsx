// Main App component for Omnivore Vite migration
// Uses AppRouter for proper React Router navigation

import './App.css'

import React from 'react'

import AppRouter from './router/AppRouter'

const App: React.FC = () => {
  return (
    <div className="app">
      <AppRouter />
    </div>
  )
}

export default App
