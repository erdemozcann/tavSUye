import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
import './index.css'
import App from './App.tsx'

// Create a client
const queryClient = new QueryClient()

// Get the root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element (#root) not found in the DOM')
}

// Create the root
const root = ReactDOM.createRoot(rootElement)

// Render the app
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
)
