import { useState, useMemo } from 'react'
import { PERMITS } from '../data/permitDatabase'

export default function Dashboard({ answers, navigate }) {
  const [completedPermits, setCompletedPermits] = useState({})

  // Determine which permits are needed
  const neededPermits = useMemo(() => {
    return PERMITS.filter(p => {
      if (p.required) return true
      try { return p.conditions(answers) } catch { return false }
    })
  }, [answers])

  const maybePermits = useMemo(() => {
    return PERMITS.filter(p => {
      if (p.required) return false
      try {
        if (p.conditions(answers)) return false // already in needed
      } catch {}
      // Show as "maybe" if the answer was "Maybe" or related field exists
      if (p.id === 'liquor-license' && (answers.servesAlcohol === 'Maybe')) return true
      if (p.id === 'outdoor-dining' && (answers.hasOutdoor === 'Maybe')) return true
      if (p.id === 'building-permit' && (answers.needsConstruction === 'Minor')) return true
      if (p.id === 'music-permit' && (answers.hasEntertainment === 'TVs')) return true
      return false
    })
  }, [answers])

  const totalCostMin = neededPermits.reduce((s, p) => s + p.cost.min, 0)
  const totalCostMax = neededPermits.reduce((s, p) => s + p.cost.max, 0)

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button
          onClick={() => navigate('interview')}
          className="text-white/40 hover:text-white/70 text-sm mb-4 cursor-pointer"
        >
          ← Edit answers
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {answers.restaurantName || 'Your Restaurant'}
            </h1>
            <p className="text-white/40 mt-1">{answers.city || 'Location not set'}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10 animate-fade-in">
        <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
          <div className="text-orange-400 text-sm font-medium mb-1">Permits Required</div>
          <div className="text-3xl font-bold text-white">{neededPermits.length}</div>
          {maybePermits.length > 0 && (
            <div className="text-white/30 text-xs mt-1">+ {maybePermits.length} conditional</div>
          )}
        </div>
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-amber-400 text-sm font-medium mb-1">Estimated Total Cost</div>
          <div className="text-3xl font-bold text-white">
            ${totalCostMin.toLocaleString()} — ${totalCostMax.toLocaleString()}
          </div>
          <div className="text-white/30 text-xs mt-1">permit fees only (not lawyer/consultant)</div>
        </div>
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="text-emerald-400 text-sm font-medium mb-1">Estimated Timeline</div>
          <div className="text-3xl font-bold text-white">
            {answers.servesAlcohol === 'Yes' ? '3-6 months' : '2-3 months'}
          </div>
          <div className="text-white/30 text-xs mt-1">
            {answers.servesAlcohol === 'Yes' ? 'liquor license is the bottleneck' : 'submit in parallel when possible'}
          </div>
        </div>
      </div>

      {/* Savings callout */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="text-emerald-400 font-semibold text-sm">Without PlatePass</div>
            <div className="text-white/50 text-sm">Restaurant consultant: $5,000-$25,000. Lawyer: $5,000-$15,000. Your time: 80-120 hours of research.</div>
          </div>
        </div>
      </div>

      {/* Required permits */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Required Permits ({neededPermits.length})
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {neededPermits.map((permit, i) => (
            <button
              key={permit.id}
              onClick={() => navigate('permit', { permit })}
              className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-left cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{permit.emoji}</span>
                  <div>
                    <div className="text-white font-semibold">{permit.name}</div>
                    <div className="text-white/30 text-xs">{permit.agency}</div>
                  </div>
                </div>
                {completedPermits[permit.id] && (
                  <span className="text-emerald-400 text-sm">✓</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                <span>💰 ${permit.cost.min}-${permit.cost.max}</span>
                <span>⏱ {permit.timeline}</span>
              </div>
              <div className="text-white/20 text-xs mt-2">{permit.description}</div>
              <div className="mt-3 text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Fill out application →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional permits */}
      {maybePermits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            May Be Required ({maybePermits.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {maybePermits.map(permit => (
              <div
                key={permit.id}
                className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-50">{permit.emoji}</span>
                  <div>
                    <div className="text-white/50 font-semibold">{permit.name}</div>
                    <div className="text-white/20 text-xs">{permit.agency}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                  <span>💰 ${permit.cost.min}-${permit.cost.max}</span>
                  <span>⏱ {permit.timeline}</span>
                </div>
                <div className="mt-2 text-xs text-amber-400/60">
                  Depends on your final plans — update your answers to confirm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro tips */}
      <div className="mt-12 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
        <h3 className="text-white font-semibold mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-white/40 text-sm">
          <li>• <strong className="text-white/60">Start with the liquor license</strong> — it takes the longest (45-90 days). Everything else can run in parallel.</li>
          <li>• <strong className="text-white/60">Health permit requires a plan review</strong> — submit kitchen plans early, even if construction isn't done.</li>
          <li>• <strong className="text-white/60">Don't sign a lease without checking zoning</strong> — if the space isn't zoned for food service, you need a conditional use permit (3-6 months).</li>
          <li>• <strong className="text-white/60">Budget 10-20% of opening costs for permits</strong> — most first-time owners underestimate this.</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-white/20 text-xs pb-8">
        PlatePass — Focus on the food. We handle the paperwork. 🍽️
      </div>
    </div>
  )
}
