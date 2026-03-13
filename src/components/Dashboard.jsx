import { useState, useMemo } from 'react'
import { PERMITS } from '../data/permitDatabase'

export default function Dashboard({ answers, permitForms = {}, navigate }) {
  const [completedPermits, setCompletedPermits] = useState({})

  const neededPermits = useMemo(() => {
    return PERMITS.filter(p => {
      if (p.required) return true
      try { return p.conditions(answers) } catch { return false }
    })
  }, [answers])

  const maybePermits = useMemo(() => {
    return PERMITS.filter(p => {
      if (p.required) return false
      try { if (p.conditions(answers)) return false } catch {}
      if (p.id === 'liquor-license' && answers.servesAlcohol === 'Maybe') return true
      if (p.id === 'outdoor-dining' && answers.hasOutdoor === 'Maybe') return true
      if (p.id === 'building-permit' && answers.needsConstruction === 'Minor') return true
      if (p.id === 'music-permit' && answers.hasEntertainment === 'TVs') return true
      return false
    })
  }, [answers])

  const totalCostMin = neededPermits.reduce((s, p) => s + p.cost.min, 0)
  const totalCostMax = neededPermits.reduce((s, p) => s + p.cost.max, 0)

  return (
    <div className="min-h-screen bg-white px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 animate-fade-in" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button
          onClick={() => navigate('interview')}
          className="text-[10px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.2em] mb-8 cursor-pointer transition-colors"
        >
          ← Edit Answers
        </button>

        <h1 className="text-3xl md:text-4xl font-light text-stone-900 tracking-wide">
          {answers.restaurantName || 'Your Restaurant'}
        </h1>
        <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mt-2">
          {answers.city || 'Location not set'}
        </p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-8 mb-16 animate-fade-in border-b border-stone-200 pb-12">
        <div>
          <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">Permits Required</div>
          <div className="text-3xl font-light text-stone-900">{neededPermits.length}</div>
          {maybePermits.length > 0 && (
            <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-1">+ {maybePermits.length} conditional</div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">Estimated Cost</div>
          <div className="text-3xl font-light text-stone-900">
            ${totalCostMin.toLocaleString()} – ${totalCostMax.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-1">permit fees only</div>
        </div>
        <div>
          <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">Timeline</div>
          <div className="text-3xl font-light text-stone-900">
            {answers.servesAlcohol === 'Yes' ? '3–6 mo' : '2–3 mo'}
          </div>
          <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-1">
            {answers.servesAlcohol === 'Yes' ? 'liquor license is bottleneck' : 'submit in parallel'}
          </div>
        </div>
      </div>

      {/* Savings note */}
      <div className="mb-12 p-6 border border-stone-200 animate-fade-in">
        <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">Without PlatePass</div>
        <p className="text-sm text-stone-500 font-light leading-relaxed">
          Restaurant consultant: $5,000–$25,000. Lawyer: $5,000–$15,000. Your time: 80–120 hours of research.
        </p>
      </div>

      {/* Required permits */}
      <div className="mb-12">
        <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-6">
          Required Permits ({neededPermits.length})
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {neededPermits.map((permit, i) => (
            <button
              key={permit.id}
              onClick={() => navigate('permit', { permit })}
              className="group p-6 border border-stone-200 hover:border-stone-900 transition-all text-left cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xl mr-2">{permit.emoji}</span>
                  <span className="text-sm font-medium text-stone-900 tracking-wide">{permit.name}</span>
                </div>
                {completedPermits[permit.id] && (
                  <span className="text-stone-500 text-xs">✓</span>
                )}
              </div>
              <div className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">
                {permit.agency}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-stone-500 uppercase tracking-[0.2em]">
                <span>${permit.cost.min}–${permit.cost.max}</span>
                <span className="text-stone-200">•</span>
                <span>{permit.timeline}</span>
              </div>
              {/* Show pre-fill status */}
              {(() => {
                const prefilled = permitForms[permit.id] || {}
                const filledCount = Object.values(prefilled).filter(v => v).length
                const totalFields = permit.formFields.length
                if (filledCount > 0) {
                  return (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-stone-100 rounded">
                        <div className="h-full bg-emerald-400 rounded transition-all" style={{ width: `${(filledCount / totalFields) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-emerald-500 uppercase tracking-[0.15em]">
                        {filledCount}/{totalFields} filled
                      </span>
                    </div>
                  )
                }
                return (
                  <div className="mt-3 text-xs text-stone-300 leading-relaxed line-clamp-2">
                    {permit.description}
                  </div>
                )
              })()}
              <div className="mt-3 text-[10px] text-stone-900 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity border-b border-stone-900 inline-block pb-0.5">
                {Object.values(permitForms[permit.id] || {}).filter(v => v).length > 0 ? 'Review & Complete →' : 'Fill Application →'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Maybe permits */}
      {maybePermits.length > 0 && (
        <div className="mb-12">
          <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-6">
            May Be Required ({maybePermits.length})
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {maybePermits.map(permit => (
              <div key={permit.id} className="p-6 border border-stone-100 text-left">
                <span className="text-xl mr-2 opacity-50">{permit.emoji}</span>
                <span className="text-sm text-stone-500 tracking-wide">{permit.name}</span>
                <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-2">
                  {permit.agency}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-1">
                  <span>${permit.cost.min}–${permit.cost.max}</span>
                  <span className="text-stone-200">•</span>
                  <span>{permit.timeline}</span>
                </div>
                <div className="mt-2 text-[10px] text-stone-500 italic">
                  Update your answers to confirm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro tips */}
      <div className="border-t border-stone-200 pt-12 mb-12">
        <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-6">Pro Tips</div>
        <div className="space-y-4 text-sm text-stone-500 font-light leading-relaxed">
          <p>
            <span className="text-stone-900 font-normal">Start with the liquor license</span> — it takes the longest (45–90 days). Everything else can run in parallel.
          </p>
          <p>
            <span className="text-stone-900 font-normal">Health permit requires a plan review</span> — submit kitchen plans early, even if construction isn't done.
          </p>
          <p>
            <span className="text-stone-900 font-normal">Don't sign a lease without checking zoning</span> — if the space isn't zoned for food service, you need a conditional use permit (3–6 months).
          </p>
          <p>
            <span className="text-stone-900 font-normal">Budget 10–20% of opening costs for permits</span> — most first-time owners underestimate this.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-stone-100">
        <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em]">
          Focus on the food. We handle the paperwork.
        </p>
      </div>
    </div>
  )
}
