import { useState } from 'react'
import { INTERVIEW_QUESTIONS } from '../data/permitDatabase'

export default function Interview({ answers, setAnswers, navigate }) {
  const [currentQ, setCurrentQ] = useState(0)
  const q = INTERVIEW_QUESTIONS[currentQ]
  const total = INTERVIEW_QUESTIONS.length
  const progress = ((currentQ) / total) * 100

  const currentValue = answers[q.id] || ''

  const setValue = (val) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  const next = () => {
    if (currentQ < total - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      navigate('dashboard')
    }
  }

  const back = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1)
    else navigate('landing')
  }

  const canProceed = q.required ? !!currentValue : true

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="h-0.5 bg-stone-100">
          <div
            className="h-full bg-stone-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={back} className="text-stone-500 hover:text-stone-900 text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-colors">
            ← Back
          </button>
          <span className="text-[10px] text-stone-300 uppercase tracking-[0.2em]">{currentQ + 1} of {total}</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-32" key={q.id}>
        <div className="max-w-lg w-full animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-light text-stone-900 mb-2 tracking-wide">
            {q.question}
          </h2>
          {q.subtitle && (
            <p className="text-sm text-stone-500 mb-10 leading-relaxed">{q.subtitle}</p>
          )}

          {/* Text input */}
          {q.type === 'text' && (
            <input
              type="text"
              value={currentValue}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canProceed && next()}
              placeholder={q.placeholder}
              autoFocus
              className="w-full px-0 py-3 bg-transparent border-b border-stone-300 focus:border-stone-900 text-lg font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition"
            />
          )}

          {/* Number input */}
          {q.type === 'number' && (
            <input
              type="number"
              value={currentValue}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canProceed && next()}
              placeholder={q.placeholder}
              autoFocus
              className="w-full px-0 py-3 bg-transparent border-b border-stone-300 focus:border-stone-900 text-lg font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition"
            />
          )}

          {/* Select options */}
          {q.type === 'select' && (
            <div className="space-y-2">
              {q.options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.value
                const label = typeof opt === 'string' ? opt : opt.label
                const isSelected = currentValue === val
                return (
                  <button
                    key={val}
                    onClick={() => {
                      setValue(val)
                      setTimeout(() => {
                        if (currentQ < total - 1) {
                          setCurrentQ(prev => prev + 1)
                        } else {
                          navigate('dashboard')
                        }
                      }, 250)
                    }}
                    className={`w-full text-left px-5 py-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50 text-stone-900'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    <span className="text-sm tracking-wide">{label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Continue button (for text/number) */}
          {(q.type === 'text' || q.type === 'number') && (
            <button
              onClick={next}
              disabled={!canProceed}
              className={`mt-10 px-8 py-3 text-sm uppercase tracking-[0.2em] transition-all cursor-pointer ${
                canProceed
                  ? 'bg-stone-900 text-white hover:bg-stone-800'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              {currentQ < total - 1 ? 'Continue' : 'See My Permits'}
            </button>
          )}

          {/* Press Enter hint */}
          {(q.type === 'text' || q.type === 'number') && canProceed && (
            <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-3">Press Enter ↵</p>
          )}
        </div>
      </div>
    </div>
  )
}
