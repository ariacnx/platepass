import { useState } from 'react'
import Landing from './components/Landing'
import SmartStart from './components/SmartStart'
import Interview from './components/Interview'
import Dashboard from './components/Dashboard'
import PermitForm from './components/PermitForm'
import { prefillPermitForms } from './utils/permitPrefill'

export default function App() {
  const [page, setPage] = useState('landing')
  const [answers, setAnswers] = useState({})
  const [extractedData, setExtractedData] = useState({}) // raw AI extraction (includes Level 2 fields)
  const [selectedPermit, setSelectedPermit] = useState(null)

  // Compute prefilled form data for all permits
  const permitForms = prefillPermitForms(answers, extractedData)

  const navigate = (p, data) => {
    if (p === 'permit') setSelectedPermit(data?.permit)
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-white">
      {page === 'landing' && <Landing navigate={navigate} />}
      {page === 'smart' && (
        <SmartStart
          answers={answers}
          setAnswers={setAnswers}
          extractedData={extractedData}
          setExtractedData={setExtractedData}
          navigate={navigate}
        />
      )}
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
          permitForms={permitForms}
          navigate={navigate}
        />
      )}
      {page === 'permit' && selectedPermit && (
        <PermitForm
          permit={selectedPermit}
          answers={answers}
          prefillData={permitForms[selectedPermit.id] || {}}
          navigate={navigate}
        />
      )}
    </div>
  )
}
