import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from './components/auth/AuthLayout'
import { Dashboard } from './pages/Dashboard'
import { Interpretation } from './pages/Interpretation'

function App() {
  return (
    <AuthLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interpret/:dateKey" element={<Interpretation />} />
      </Routes>
    </AuthLayout>
  )
}

export default App
