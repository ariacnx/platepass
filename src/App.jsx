import { useState } from 'react'
import Landing from './components/Landing'
import Interview from './components/Interview'
import Dashboard from './components/Dashboard'
import PermitForm from './components/PermitForm'

export default function App() {
  const [page, setPage] = useState('landing') // landing | interview | dashboard | permit
  const [answers, setAnswers] = useState({})
  const [selectedPermit, setSelectedPermit] = useState(null)

  const navigate = (p, data) => {
    if (p === 'permit') setSelectedPermit(data?.permit)
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {page === 'landing' && <Landing navigate={navigate} />}
      {page === 'interview' && (
        <Interview
          answers={answers}
          setAnswers={setAnswers}
          navigate={navigate}
        />
      )}
      {page === 'dashboard' && (
        <Dashboard
          answers={answers}
          navigate={navigate}
        />
      )}
      {page === 'permit' && selectedPermit && (
        <PermitForm
          permit={selectedPermit}
          answers={answers}
          navigate={navigate}
        />
      )}
    </div>
  )
}
