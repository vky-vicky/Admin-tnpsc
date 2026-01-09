import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-700">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Vite + React + Tailwind
        </h1>
        <p className="text-slate-400 mb-8">
          This is a starter template with Tailwind CSS v4 configured.
        </p>
        
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
        >
          Count is {count}
        </button>

        <div className="mt-8 text-sm text-slate-500">
          Edit <code className="bg-slate-700 px-1 py-0.5 rounded text-blue-300">src/App.jsx</code> to get started
        </div>
      </div>
    </div>
  )
}

export default App
