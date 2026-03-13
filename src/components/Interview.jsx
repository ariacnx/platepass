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
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={back} className="text-white/40 hover:text-white/70 text-sm cursor-pointer">
            ← Back
          </button>
          <span className="text-white/30 text-sm">{currentQ + 1} of {total}</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-32" key={q.id}>
        <div className="max-w-xl w-full animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {q.question}
          </h2>
          {q.subtitle && (
            <p className="text-white/40 text-lg mb-8">{q.subtitle}</p>
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
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-xl placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition"
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
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-xl placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition"
            />
          )}

          {/* Select options */}
          {q.type === 'select' && (
            <div className="space-y-3">
              {q.options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.value
                const label = typeof opt === 'string' ? opt : opt.label
                const isSelected = currentValue === val
                return (
                  <button
                    key={val}
                    onClick={() => {
                      setValue(val)
                      // Auto-advance on select after a brief delay
                      setTimeout(() => {
                        if (currentQ < total - 1) {
                          setCurrentQ(prev => prev + 1)
                        } else {
                          navigate('dashboard')
                        }
                      }, 300)
                    }}
                    className={`w-full text-left px-6 py-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500/50 bg-orange-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{label}</span>
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
              className={`mt-8 px-8 py-4 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
                canProceed
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {currentQ < total - 1 ? 'Continue' : 'See My Permits →'}
            </button>
          )}

          {/* Press Enter hint */}
          {(q.type === 'text' || q.type === 'number') && canProceed && (
            <p className="text-white/20 text-sm mt-3">Press Enter ↵</p>
          )}
        </div>
      </div>
    </div>
  )
}
