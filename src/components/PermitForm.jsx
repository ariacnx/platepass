import { useState, useCallback, useEffect, useRef } from 'react'
import { SUBMIT_INFO } from '../data/submitInfo'
import { checkProximity } from '../utils/proximityCheck'

export default function PermitForm({ permit, answers, prefillData = {}, navigate }) {
  const [formData, setFormData] = useState(prefillData)
  const [validationResults, setValidationResults] = useState(() => {
    if (Object.keys(prefillData).length > 0) {
      return validatePermit(permit, prefillData)
    }
    return []
  })
  const [proximityResult, setProximityResult] = useState(null)
  const [proximityLoading, setProximityLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const aiTimerRef = useRef(null)

  // Auto-check proximity for liquor license when address is available
  useEffect(() => {
    if (permit.id === 'liquor-license' && answers?.city && !proximityResult) {
      const address = answers.address || answers.city
      if (address) {
        setProximityLoading(true)
        checkProximity(address).then(result => {
          setProximityResult(result)
          setProximityLoading(false)
          // Auto-fill the near-school field
          if (result.status === 'warning') {
            setFormData(prev => ({ ...prev, 'near-school': 'Yes' }))
          } else if (result.status === 'clear') {
            setFormData(prev => ({ ...prev, 'near-school': 'No' }))
          }
        })
      }
    }
  }, [permit.id, answers])

  // Auto-run Layer 2 on prefilled data
  useEffect(() => {
    if (Object.keys(prefillData).length >= 2) {
      const timer = setTimeout(() => runAIValidation(permit, prefillData), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const updateField = useCallback((fieldId, value) => {
    setFormData(prev => {
      const next = { ...prev, [fieldId]: value }
      const results = validatePermit(permit, next)
      setValidationResults(results)

      // Layer 2: Debounced AI deep validation
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
      aiTimerRef.current = setTimeout(() => {
        runAIValidation(permit, next)
      }, 2000)

      return next
    })
  }, [permit])

  const runAIValidation = async (permit, data) => {
    const filledFields = Object.entries(data).filter(([_, v]) => v && v !== '')
    if (filledFields.length < 2) return // need at least 2 fields

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) return

    setAiLoading(true)
    try {
      const fieldSummary = filledFields.map(([k, v]) => {
        const field = permit.formFields.find(f => f.id === k)
        return `${field?.label || k}: ${Array.isArray(v) ? v.join(', ') : v}`
      }).join('\n')

      const rulesSummary = permit.rules.map(r => `- ${r.condition}: ${r.description} (${r.citation})`).join('\n')

      const prompt = `You are PlatePass, a restaurant permit compliance expert. Analyze this ${permit.name} application for cross-field conflicts, hidden risks, and issues that individual rule checks would miss.

Application data:
${fieldSummary}

Known regulations:
${rulesSummary}

Find 1-3 CROSS-FIELD insights — things that only become problems when you look at multiple fields together. Be specific, cite real regulations, and include cost/time impact.

Return JSON array: [{"status":"warning"|"info","title":"short title","message":"detailed explanation with specific numbers","citation":"regulation reference"}]

Only return issues NOT already caught by individual field rules. Focus on cross-field conflicts and subtle implications. If nothing additional to flag, return [].
Return ONLY the JSON array.`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 600
        })
      })

      const result = await res.json()
      const content = result.choices?.[0]?.message?.content?.trim()
      
      let jsonStr = content
      if (content?.startsWith('```')) {
        jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      }

      const insights = JSON.parse(jsonStr || '[]')
      setAiInsights(insights)
    } catch (e) {
      console.error('AI validation failed:', e)
      setAiInsights([])
    }
    setAiLoading(false)
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-in" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button
          onClick={() => navigate('dashboard')}
          className="text-[10px] text-stone-500 hover:text-stone-900 uppercase tracking-[0.2em] mb-8 cursor-pointer transition-colors"
        >
          ← Back to Permits
        </button>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">{permit.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-stone-900 tracking-wide">{permit.name}</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mt-1">{permit.agency}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-[10px] text-stone-500 uppercase tracking-[0.2em]">
          <span>${permit.cost.min}–${permit.cost.max}</span>
          <span className="text-stone-200">•</span>
          <span>{permit.timeline}</span>
          <span className="text-stone-200">•</span>
          <span>{permit.rules.length} rules checked</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3 animate-fade-in">
          <div className="border border-stone-200 p-8">
            <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-8">Application Details</div>

            {permit.formFields.map(field => (
              <div key={field.id} className="mb-6">
                <label className="block text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2">
                  {field.label}
                  {field.required && <span className="text-stone-900 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={e => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-0 py-2 bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={e => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-0 py-2 bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={formData[field.id] || ''}
                    onChange={e => updateField(field.id, e.target.value)}
                    className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none transition"
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'multiselect' && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {field.options.map(opt => {
                      const selected = (formData[field.id] || []).includes(opt)
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            const current = formData[field.id] || []
                            const next = selected
                              ? current.filter(v => v !== opt)
                              : [...current, opt]
                            updateField(field.id, next)
                          }}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] border transition cursor-pointer ${
                            selected
                              ? 'border-stone-900 bg-stone-900 text-white'
                              : 'border-stone-200 text-stone-500 hover:border-stone-400'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            {/* Download button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => downloadPDF(permit, formData)}
                className="flex-1 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                ↓ Download Application PDF
              </button>
            </div>
          </div>
        </div>

        {/* Validation sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6 animate-fade-in">
            <div className="border border-stone-200 p-6">
              <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
                Live Validation — {permit.rules.length} Rules
              </div>

              {/* Proximity check result for liquor license */}
              {permit.id === 'liquor-license' && proximityLoading && (
                <div className="p-4 border-l-2 border-l-stone-300 bg-stone-50/50 mb-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium">🔍 Checking proximity...</div>
                  <div className="text-xs text-stone-400 mt-1">Searching for schools, churches, and playgrounds within 600ft of your address</div>
                </div>
              )}

              {permit.id === 'liquor-license' && proximityResult && (
                <div className={`p-4 border-l-2 mb-3 ${
                  proximityResult.status === 'warning' 
                    ? 'border-l-red-400 bg-red-50/50'
                    : proximityResult.status === 'clear'
                    ? 'border-l-emerald-400 bg-emerald-50/50'
                    : 'border-l-amber-400 bg-amber-50/50'
                }`}>
                  <div className={`text-[10px] uppercase tracking-[0.2em] font-medium mb-1 ${
                    proximityResult.status === 'warning' ? 'text-red-600'
                    : proximityResult.status === 'clear' ? 'text-emerald-600'
                    : 'text-amber-600'
                  }`}>
                    {proximityResult.status === 'warning' ? '🚨 Proximity Alert' 
                     : proximityResult.status === 'clear' ? '✓ Proximity Clear'
                     : '⚠ Check Manually'}
                  </div>
                  <div className="text-xs text-stone-500 leading-relaxed">{proximityResult.message}</div>
                  {proximityResult.nearby?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {proximityResult.nearby.map((n, i) => (
                        <div key={i} className="text-xs text-red-600 flex items-center gap-2">
                          <span>{n.type}</span>
                          <span className="font-medium">{n.name}</span>
                          <span className="text-stone-400">{n.distance}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-stone-300 mt-2 italic">Auto-checked via OpenStreetMap · CA B&P Code §23789</div>
                </div>
              )}

              {validationResults.length === 0 && !proximityLoading && !proximityResult && (
                <p className="text-xs text-stone-300 font-light italic">Start filling out the form to see real-time validation...</p>
              )}

              <div className="space-y-3">
                {validationResults.map((result, i) => (
                  <div
                    key={i}
                    className={`p-4 border-l-2 ${
                      result.status === 'error'
                        ? 'border-l-red-400 bg-red-50/50'
                        : result.status === 'warning'
                        ? 'border-l-amber-400 bg-amber-50/50'
                        : result.status === 'success'
                        ? 'border-l-emerald-400 bg-emerald-50/50'
                        : 'border-l-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-[0.2em] mb-1 font-medium ${
                      result.status === 'error' ? 'text-red-600' :
                      result.status === 'warning' ? 'text-amber-600' :
                      result.status === 'success' ? 'text-emerald-600' :
                      'text-stone-500'
                    }`}>
                      {result.status === 'error' ? '✗ ' : result.status === 'warning' ? '⚠ ' : result.status === 'success' ? '✓ ' : ''}{result.rule}
                    </div>
                    <div className="text-xs text-stone-500 font-light leading-relaxed">{result.message}</div>
                    {result.citation && (
                      <div className="text-[10px] text-stone-300 mt-2 italic">{result.citation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Layer 2: AI Deep Analysis */}
            {(aiLoading || aiInsights.length > 0) && (
              <div className="border border-purple-200 p-6 bg-purple-50/30">
                <div className="text-[10px] text-purple-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-sm">🧠</span>
                  {aiLoading ? 'AI Analyzing Cross-Field Risks...' : `AI Analysis — ${aiInsights.length} Insight${aiInsights.length !== 1 ? 's' : ''}`}
                </div>

                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-purple-400">
                    <span className="animate-pulse">●</span> Reading your full application against regulatory context...
                  </div>
                )}

                <div className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <div
                      key={i}
                      className={`p-4 border-l-2 ${
                        insight.status === 'warning'
                          ? 'border-l-amber-400 bg-amber-50/50'
                          : 'border-l-purple-300 bg-purple-50/30'
                      }`}
                    >
                      <div className={`text-[10px] uppercase tracking-[0.2em] mb-1 font-medium ${
                        insight.status === 'warning' ? 'text-amber-600' : 'text-purple-600'
                      }`}>
                        {insight.status === 'warning' ? '⚠ ' : '💡 '}{insight.title}
                      </div>
                      <div className="text-xs text-stone-500 font-light leading-relaxed">{insight.message}</div>
                      {insight.citation && (
                        <div className="text-[10px] text-stone-300 mt-2 italic">{insight.citation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules reference */}
            <div className="border border-stone-100 p-6">
              <div className="text-[10px] text-stone-300 uppercase tracking-[0.3em] mb-4">Rules Being Checked</div>
              {permit.rules.map(rule => (
                <div key={rule.id} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${
                      rule.grade === 'Critical' ? 'bg-red-400' :
                      rule.grade === 'Required' ? 'bg-stone-400' :
                      'bg-amber-400'
                    }`} />
                    <span className="text-[10px] text-stone-500 uppercase tracking-[0.15em]">{rule.condition}</span>
                  </div>
                  <p className="text-[10px] text-stone-300 ml-3 mt-0.5 line-clamp-2">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How to Submit section */}
      {SUBMIT_INFO[permit.id] && (() => {
        const info = SUBMIT_INFO[permit.id]
        return (
          <div className="mt-10 border border-stone-200 p-8 animate-fade-in">
            <div className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-6">How to Submit</div>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mb-2 font-medium">Where</div>
                <div className="text-base text-stone-900 font-medium mb-1">{info.where}</div>
                <div className="text-sm text-stone-500 leading-relaxed">{info.address}</div>
                <div className="text-sm text-stone-500 mt-1">{info.hours}</div>
                <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-sm text-stone-900 underline underline-offset-2 mt-2 inline-block hover:text-stone-600 transition">
                  Visit website →
                </a>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mb-2 font-medium">Method</div>
                <div className="text-sm text-stone-700 mb-3">{info.method}</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mb-2 font-medium">Expected Wait</div>
                <div className="text-sm text-stone-700">{info.estimatedWait}</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mb-3 font-medium">Documents You'll Need</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {info.documents.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-stone-300 mt-0.5">☐</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em] mb-3 font-medium">Pro Tips</div>
              <div className="space-y-2">
                {info.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Download PDF helper ───
function downloadPDF(permit, formData) {
  // Generate a printable HTML document and trigger download
  const fields = permit.formFields.map(f => {
    const val = formData[f.id] || ''
    const displayVal = Array.isArray(val) ? val.join(', ') : val
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;width:40%">${f.label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;font-weight:500">${displayVal || '—'}</td></tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${permit.name} — PlatePass Application</title>
<style>body{font-family:Inter,-apple-system,sans-serif;margin:40px;color:#1c1917}h1{font-size:24px;font-weight:300;margin-bottom:4px}
.meta{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-top:16px}
.footer{margin-top:40px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:16px}</style></head>
<body>
<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.25em;margin-bottom:8px">PlatePass Application</div>
<h1>${permit.emoji} ${permit.name}</h1>
<div class="meta">${permit.agency} · $${permit.cost.min}–$${permit.cost.max} · ${permit.timeline}</div>
<table>${fields}</table>
<div class="footer">Generated by PlatePass · ${new Date().toLocaleDateString()} · This is a draft application — verify all information before submitting to ${permit.agency}.</div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${permit.id}-application.html`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Validation Engine (same logic as v1) ───
function validatePermit(permit, formData) {
  const results = []

  if (permit.id === 'health-permit') {
    if (formData['has-3sink'] === 'No — need to install') {
      results.push({ ruleId: 'hp-3sink', status: 'error', rule: '3-Compartment Sink Required', message: 'You MUST install a 3-compartment sink before the health department will approve your permit. A commercial dishwasher does NOT replace this requirement. Budget $2,000-$5,000 for installation.', citation: 'FDA Food Code §4-301.12' })
    } else if (formData['has-3sink'] === 'Using commercial dishwasher only') {
      results.push({ ruleId: 'hp-3sink', status: 'error', rule: '3-Compartment Sink Required', message: 'Common mistake: A dishwasher does NOT replace the 3-compartment sink requirement. You need BOTH. This is the #2 reason health permits get denied.', citation: 'FDA Food Code §4-301.12' })
    } else if (formData['has-3sink'] === 'Yes') {
      results.push({ ruleId: 'hp-3sink', status: 'success', rule: '3-Compartment Sink', message: '3-compartment sink confirmed.', citation: 'FDA Food Code §4-301.12' })
    }

    if (formData['handwash-count'] && Number(formData['handwash-count']) < 1) {
      results.push({ ruleId: 'hp-handwash', status: 'error', rule: 'Handwashing Stations', message: 'You need at least 1 dedicated handwashing sink in the kitchen. Must be separate from 3-compartment sink and food prep sinks.', citation: 'FDA Food Code §5-203.11' })
    } else if (formData['handwash-count'] && Number(formData['handwash-count']) >= 1) {
      results.push({ ruleId: 'hp-handwash', status: 'success', rule: 'Handwashing Stations', message: `${formData['handwash-count']} handwashing station(s). Ensure each is accessible and not blocked by equipment.`, citation: 'FDA Food Code §5-203.11' })
    }

    if (formData['floor-type'] === 'Carpet') {
      results.push({ ruleId: 'hp-floor', status: 'error', rule: 'Floor Requirements', message: 'Carpet is NEVER allowed in food prep areas. Must be smooth, non-absorbent, easily cleanable. Automatic failure on inspection.', citation: 'FDA Food Code §6-201.11' })
    } else if (formData['floor-type'] === 'Hardwood') {
      results.push({ ruleId: 'hp-floor', status: 'warning', rule: 'Floor Requirements', message: 'Hardwood is not recommended for kitchen areas — absorbs moisture. May be acceptable in dining area only.', citation: 'FDA Food Code §6-201.11' })
    } else if (formData['floor-type'] && formData['floor-type'] !== 'Other / Not renovated yet') {
      results.push({ ruleId: 'hp-floor', status: 'success', rule: 'Floor Material', message: `${formData['floor-type']} meets health department requirements.`, citation: 'FDA Food Code §6-201.11' })
    }

    if (formData['food-handler-certs'] === 'No one certified yet') {
      results.push({ ruleId: 'hp-foodhandler', status: 'error', rule: 'Food Handler Certification', message: 'All food handlers must be certified before opening. Manager needs ServSafe ($100-$200). Line staff need food handler cards ($10-$15 online).', citation: 'FDA Food Code §2-102.12' })
    } else if (formData['food-handler-certs'] === 'Some staff certified') {
      results.push({ ruleId: 'hp-foodhandler', status: 'warning', rule: 'Food Handler Certification', message: 'ALL staff handling food must be certified. A single uncertified worker during inspection = violation.', citation: 'FDA Food Code §2-102.12' })
    }

    if (formData['pest-control'] === 'DIY pest control') {
      results.push({ ruleId: 'hp-pest', status: 'warning', rule: 'Pest Control', message: 'Health departments strongly prefer a licensed pest control operator. Monthly service: $50-$150/month.', citation: 'FDA Food Code §6-501.111' })
    } else if (formData['pest-control'] === 'No contract yet') {
      results.push({ ruleId: 'hp-pest', status: 'warning', rule: 'Pest Control', message: 'Set up a pest control contract before your health inspection. Many departments ask to see the contract.', citation: 'FDA Food Code §6-501.111' })
    }

    if (formData['hood-system'] === 'No hood system') {
      const foodType = formData['food-type'] || ''
      if (foodType.includes('Full') || foodType.includes('Bar with food') || foodType.includes('Fast casual')) {
        results.push({ ruleId: 'hp-hood', status: 'error', rule: 'Kitchen Ventilation', message: 'Cooking with grease requires a Type I hood with fire suppression. Major install: $15,000-$40,000. Requires ductwork to the roof.', citation: 'IMC §507; NFPA 96' })
      }
    }
  }

  if (permit.id === 'liquor-license') {
    if (formData['near-school'] === 'Yes') {
      results.push({ ruleId: 'liq-distance', status: 'error', rule: 'Proximity to Schools/Churches', message: 'CRITICAL: Within 600ft of a school or church. License will likely be DENIED. $13,800 application fee is non-refundable. Consider a different location.', citation: 'CA B&P Code §23789' })
    } else if (formData['near-school'] === 'Not sure — need to measure') {
      results.push({ ruleId: 'liq-distance', status: 'warning', rule: 'Proximity to Schools/Churches', message: 'Measure door-to-door distance BEFORE applying. Under 600ft = non-refundable $13,800 fee wasted.', citation: 'CA B&P Code §23789' })
    } else if (formData['near-school'] === 'No') {
      results.push({ ruleId: 'liq-distance', status: 'success', rule: 'School/Church Distance', message: 'No proximity conflict.', citation: 'CA B&P Code §23789' })
    }

    if (formData['license-type'] === 'Not sure which type') {
      results.push({ ruleId: 'liq-type', status: 'warning', rule: 'License Type', message: 'Wrong type wastes $13,800+. Type 41: beer/wine. Type 47: full liquor (with meals). Type 48: full liquor bar. Most restaurants want Type 47.', citation: 'CA B&P Code §23394-23399' })
    }

    if (formData['license-type']?.includes('Type 47') && formData['bar-percentage'] === 'Over 70%') {
      results.push({ ruleId: 'liq-type-mismatch', status: 'error', rule: 'License Type Mismatch', message: 'Type 47 requires "bona fide eating place." If 70%+ revenue is alcohol, ABC may challenge. Consider Type 48.', citation: 'CA B&P Code §23038' })
    }

    if (formData['rbs-training'] === 'No one trained yet') {
      results.push({ ruleId: 'liq-training', status: 'warning', rule: 'RBS Training Required', message: 'All servers must complete RBS training. Legally required in CA within 60 days of hire.', citation: 'CA AB 1221' })
    }
  }

  if (permit.id === 'fire-permit') {
    if (formData['has-hood-suppression'] === 'No — need to install') {
      results.push({ ruleId: 'fire-hood', status: 'error', rule: 'Kitchen Hood Fire Suppression', message: 'Commercial cooking REQUIRES automatic fire suppression (Ansul/wet chemical). $3,000-$8,000 installed. Inspected every 6 months.', citation: 'NFPA 96 §10.1' })
    } else if (formData['has-hood-suppression'] === 'Yes — Ansul/wet chemical system installed') {
      results.push({ ruleId: 'fire-hood', status: 'success', rule: 'Fire Suppression System', message: 'Confirmed. Keep inspection tag current (every 6 months).', citation: 'NFPA 96 §10.1' })
    }

    if (formData['max-occupancy'] && Number(formData['max-occupancy']) > 49 && formData['exit-count'] && Number(formData['exit-count']) < 2) {
      results.push({ ruleId: 'fire-exits', status: 'error', rule: 'Emergency Exits', message: `Occupancy of ${formData['max-occupancy']} requires minimum 2 exits. You have ${formData['exit-count']}. Fire marshal will not approve.`, citation: 'IFC §1006' })
    }

    if (formData['dining-sqft'] && formData['max-occupancy']) {
      const sqft = Number(formData['dining-sqft'])
      const desired = Number(formData['max-occupancy'])
      const maxByCode = Math.floor(sqft / 15)
      if (desired > maxByCode) {
        results.push({ ruleId: 'fire-occupancy', status: 'error', rule: 'Occupancy Calculation', message: `${sqft} sq ft ÷ 15 = max ${maxByCode} people. You want ${desired}. Reduce capacity or increase space.`, citation: 'IFC Table 1004.5' })
      } else {
        results.push({ ruleId: 'fire-occupancy', status: 'success', rule: 'Occupancy Calculation', message: `${sqft} sq ft supports up to ${maxByCode}. Your ${desired} is within limits.`, citation: 'IFC Table 1004.5' })
      }
    }
  }

  if (permit.id === 'outdoor-dining') {
    if (formData['outdoor-type'] === 'Sidewalk seating (public right-of-way)' && formData['sidewalk-width']) {
      const width = Number(formData['sidewalk-width'])
      if (width < 10) {
        results.push({ ruleId: 'out-ada', status: 'error', rule: 'ADA Sidewalk Clearance', message: `${width}ft sidewalk. After 4-6ft pedestrian path, may have no room for dining. Minimum usually 10-12ft.`, citation: 'ADA Standards §4.3' })
      } else {
        results.push({ ruleId: 'out-ada', status: 'success', rule: 'Sidewalk Width', message: `${width}ft sidewalk. After 6ft clearance, ~${width - 6}ft available for dining.`, citation: 'ADA Standards §4.3' })
      }
    }
    if (formData['outdoor-alcohol'] === 'Yes') {
      results.push({ ruleId: 'out-barrier', status: 'warning', rule: 'Alcohol Outdoor Barriers', message: 'Serving alcohol outdoors requires FULLY ENCLOSED barriers. Also requires liquor license amendment.', citation: 'ABC Premises Requirements' })
    }
    if (formData['outdoor-heaters'] === 'Yes — gas/propane') {
      results.push({ ruleId: 'out-heater', status: 'warning', rule: 'Patio Heater Requirements', message: 'Gas heaters need fire department approval, 3ft clearance from combustibles, secured base. Electric is simpler to permit.', citation: 'NFPA 58; Local Fire Code' })
    }
  }

  if (permit.id === 'building-permit') {
    if (formData['previous-use'] && !formData['previous-use'].includes('Restaurant')) {
      results.push({ ruleId: 'bp-change-use', status: 'error', rule: 'Change of Occupancy', message: `Converting from "${formData['previous-use']}" triggers change of occupancy. May require seismic upgrade ($50k-$200k), ADA renovation, sprinklers. Get estimate BEFORE signing lease.`, citation: 'IBC §3408; ADA Title III' })
    }
    if (formData['has-grease-trap'] === 'No — need to install') {
      results.push({ ruleId: 'bp-grease', status: 'warning', rule: 'Grease Interceptor', message: 'Installation: $3,000-$10,000. Must be sized by plumber. Required before health permit approval in most cities.', citation: 'UPC §1014' })
    }
    if (formData['ada-compliant'] === 'No') {
      results.push({ ruleId: 'bp-ada', status: 'error', rule: 'ADA Compliance', message: 'Renovation may require bringing ENTIRE space to current ADA standards. Budget $20,000-$100,000. ADA lawsuits commonly target restaurants.', citation: 'ADA Title III; IBC §3411' })
    }
  }

  if (permit.id === 'sign-permit') {
    if (formData['historic-district'] === 'Yes') {
      results.push({ ruleId: 'sign-historic', status: 'warning', rule: 'Historic District Review', message: 'Adds 1-2 months for Design Review Board. May restrict materials, colors, illumination.', citation: 'Local Historic Preservation Ordinance' })
    }
    if (formData['sign-illuminated'] === 'Yes — neon') {
      results.push({ ruleId: 'sign-neon', status: 'warning', rule: 'Neon Sign Restrictions', message: 'Extra restrictions in many cities. Some historic districts ban neon entirely.', citation: 'Local Sign Ordinance §17.40.060' })
    }
  }

  if (permit.id === 'music-permit') {
    if (formData['near-residential'] === 'Yes — adjacent' && formData['entertainment-hours']?.includes('midnight')) {
      results.push({ ruleId: 'mus-noise', status: 'error', rule: 'Noise Ordinance Risk', message: 'Entertainment past midnight with adjacent residential = guaranteed complaints. Consider sound insulation ($5k-$20k) or earlier cutoff.', citation: 'Local Noise Ordinance §10.28' })
    }
    if (formData['entertainment-type']?.includes('Dancing')) {
      results.push({ ruleId: 'mus-dance', status: 'warning', rule: 'Dance Permit', message: 'Dancing often requires a SEPARATE cabaret/dance permit. Very limited in some cities (SF especially).', citation: 'Local Entertainment Ordinance' })
    }
  }

  return results
}
