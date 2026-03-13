import { useState, useCallback } from 'react'

export default function PermitForm({ permit, answers, navigate }) {
  const [formData, setFormData] = useState({})
  const [validationResults, setValidationResults] = useState([])

  const updateField = useCallback((fieldId, value) => {
    setFormData(prev => {
      const next = { ...prev, [fieldId]: value }
      // Run validation
      const results = validatePermit(permit, next)
      setValidationResults(results)
      return next
    })
  }, [permit])

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button
          onClick={() => navigate('dashboard')}
          className="text-white/40 hover:text-white/70 text-sm mb-4 cursor-pointer"
        >
          ← Back to permits
        </button>

        <div className="flex items-center gap-4">
          <span className="text-4xl">{permit.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{permit.name}</h1>
            <p className="text-white/40">{permit.agency}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-white/40">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            💰 ${permit.cost.min}-${permit.cost.max}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            ⏱ {permit.timeline}
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
            {permit.rules.length} rules checked
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-4 animate-fade-in">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-6">Application Details</h2>

            {permit.formFields.map(field => {
              const value = formData[field.id] || ''
              // Find any validation result for this field
              const fieldResults = validationResults.filter(r =>
                r.relatedFields?.includes(field.id) || r.ruleId?.includes(field.id.split('-')[0])
              )

              return (
                <div key={field.id} className="mb-5">
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {field.label}
                    {field.required && <span className="text-orange-400 ml-1">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={value}
                      onChange={e => updateField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={value}
                      onChange={e => updateField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={value}
                      onChange={e => updateField(field.id, e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition appearance-none"
                    >
                      <option value="" className="bg-[#1a1a1a]">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'multiselect' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map(opt => {
                        const selected = (value || []).includes(opt)
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const current = value || []
                              const next = selected
                                ? current.filter(v => v !== opt)
                                : [...current, opt]
                              updateField(field.id, next)
                            }}
                            className={`px-3 py-2 rounded-lg text-sm border transition cursor-pointer ${
                              selected
                                ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Validation sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Live Validation — {permit.rules.length} rules
              </h3>

              {validationResults.length === 0 && (
                <p className="text-white/20 text-sm">Start filling out the form to see real-time validation...</p>
              )}

              <div className="space-y-3">
                {validationResults.map((result, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-sm ${
                      result.status === 'error'
                        ? 'border-red-500/30 bg-red-500/5'
                        : result.status === 'warning'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : result.status === 'success'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-blue-500/30 bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {result.status === 'error' ? '🚨' : result.status === 'warning' ? '⚠️' : result.status === 'success' ? '✅' : 'ℹ️'}
                      </span>
                      <div>
                        <div className={`font-semibold text-xs mb-1 ${
                          result.status === 'error' ? 'text-red-400' :
                          result.status === 'warning' ? 'text-amber-400' :
                          result.status === 'success' ? 'text-emerald-400' :
                          'text-blue-400'
                        }`}>
                          {result.rule}
                        </div>
                        <div className="text-white/50 text-xs">{result.message}</div>
                        {result.citation && (
                          <div className="text-white/20 text-xs mt-1 italic">📎 {result.citation}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules reference */}
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-white/40 mb-3">Rules Being Checked</h3>
              {permit.rules.map(rule => (
                <div key={rule.id} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      rule.grade === 'Critical' ? 'bg-red-500' :
                      rule.grade === 'Required' ? 'bg-orange-500' :
                      'bg-amber-500'
                    }`} />
                    <span className="text-white/50 text-xs font-medium">{rule.condition}</span>
                  </div>
                  <p className="text-white/20 text-xs ml-4 mt-0.5">{rule.description.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Validation Engine ───
function validatePermit(permit, formData) {
  const results = []

  // Health permit validations
  if (permit.id === 'health-permit') {
    if (formData['has-3sink'] === 'No — need to install') {
      results.push({ ruleId: 'hp-3sink', status: 'error', rule: '3-Compartment Sink Required', message: 'You MUST install a 3-compartment sink before the health department will approve your permit. A commercial dishwasher does NOT replace this requirement. Budget $2,000-$5,000 for installation.', citation: 'FDA Food Code §4-301.12' })
    } else if (formData['has-3sink'] === 'Using commercial dishwasher only') {
      results.push({ ruleId: 'hp-3sink', status: 'error', rule: '3-Compartment Sink Required', message: '🚨 Common mistake: A dishwasher does NOT replace the 3-compartment sink requirement. You need BOTH. This is the #2 reason health permits get denied.', citation: 'FDA Food Code §4-301.12' })
    } else if (formData['has-3sink'] === 'Yes') {
      results.push({ ruleId: 'hp-3sink', status: 'success', rule: '3-Compartment Sink', message: '✓ 3-compartment sink confirmed.', citation: 'FDA Food Code §4-301.12' })
    }

    if (formData['handwash-count'] && Number(formData['handwash-count']) < 1) {
      results.push({ ruleId: 'hp-handwash', status: 'error', rule: 'Handwashing Stations', message: 'You need at least 1 dedicated handwashing sink in the kitchen. It must be separate from the 3-compartment sink and food prep sinks. Must have warm water, soap, and paper towels.', citation: 'FDA Food Code §5-203.11' })
    } else if (formData['handwash-count'] && Number(formData['handwash-count']) >= 1) {
      results.push({ ruleId: 'hp-handwash', status: 'success', rule: 'Handwashing Stations', message: `✓ ${formData['handwash-count']} handwashing station(s). Make sure each is accessible and not blocked by equipment.`, citation: 'FDA Food Code §5-203.11' })
    }

    if (formData['floor-type'] === 'Carpet') {
      results.push({ ruleId: 'hp-floor', status: 'error', rule: 'Floor Requirements', message: '🚨 Carpet is NEVER allowed in food prep areas. Must be smooth, non-absorbent, easily cleanable: commercial tile, sealed concrete, or VCT. This will be an automatic failure on inspection.', citation: 'FDA Food Code §6-201.11' })
    } else if (formData['floor-type'] === 'Hardwood') {
      results.push({ ruleId: 'hp-floor', status: 'warning', rule: 'Floor Requirements', message: 'Hardwood is not recommended for kitchen areas — not easily cleanable and absorbs moisture. May be acceptable in dining area only. Kitchen needs commercial tile or sealed concrete.', citation: 'FDA Food Code §6-201.11' })
    } else if (formData['floor-type'] && formData['floor-type'] !== 'Other / Not renovated yet') {
      results.push({ ruleId: 'hp-floor', status: 'success', rule: 'Floor Material', message: `✓ ${formData['floor-type']} meets health department requirements for food service areas.`, citation: 'FDA Food Code §6-201.11' })
    }

    if (formData['food-handler-certs'] === 'No one certified yet') {
      results.push({ ruleId: 'hp-foodhandler', status: 'error', rule: 'Food Handler Certification', message: 'All food handlers must be certified before opening. Manager needs ServSafe Manager certification ($100-$200, half-day exam). Line staff need basic food handler cards ($10-$15 online, takes 2 hours).', citation: 'FDA Food Code §2-102.12' })
    } else if (formData['food-handler-certs'] === 'Some staff certified') {
      results.push({ ruleId: 'hp-foodhandler', status: 'warning', rule: 'Food Handler Certification', message: 'ALL staff handling food must be certified — not just some. New hires typically have 30 days to get certified. A single uncertified worker during inspection = violation.', citation: 'FDA Food Code §2-102.12' })
    }

    if (formData['pest-control'] === 'DIY pest control') {
      results.push({ ruleId: 'hp-pest', status: 'warning', rule: 'Pest Control', message: 'Health departments strongly prefer (and some require) a licensed pest control operator. DIY is technically allowed in some jurisdictions but will be scrutinized. A monthly service runs $50-$150/month.', citation: 'FDA Food Code §6-501.111' })
    } else if (formData['pest-control'] === 'No contract yet') {
      results.push({ ruleId: 'hp-pest', status: 'warning', rule: 'Pest Control', message: 'Set up a pest control contract before your health inspection. Many health departments ask to see the contract. Get monthly or quarterly service.', citation: 'FDA Food Code §6-501.111' })
    }

    if (formData['hood-system'] === 'No hood system') {
      const foodType = formData['food-type'] || ''
      if (foodType.includes('Full') || foodType.includes('Bar with food') || foodType.includes('Fast casual')) {
        results.push({ ruleId: 'hp-hood', status: 'error', rule: 'Kitchen Ventilation', message: '🚨 Any cooking with grease (fryers, grills, ranges, woks) requires a Type I hood with fire suppression. This is a major install ($15,000-$40,000). If you\'re doing full food prep, you MUST have this. Plan for it early — it requires ductwork to the roof.', citation: 'IMC §507; NFPA 96' })
      }
    }
  }

  // Liquor license validations
  if (permit.id === 'liquor-license') {
    if (formData['near-school'] === 'Yes') {
      results.push({ ruleId: 'liq-distance', status: 'error', rule: 'Proximity to Schools/Churches', message: '🚨 CRITICAL: Your location is within 600ft of a school or church. In most states, this means your liquor license will be DENIED. You can apply for an exception, but approval is rare and adds 3-6 months. Consider a different location before signing a lease.', citation: 'CA B&P Code §23789' })
    } else if (formData['near-school'] === 'Not sure — need to measure') {
      results.push({ ruleId: 'liq-distance', status: 'warning', rule: 'Proximity to Schools/Churches', message: 'Measure door-to-door distance to nearest school, church, or playground BEFORE applying. If you\'re under 600ft, your $13,800 application fee is non-refundable and your application will likely be denied.', citation: 'CA B&P Code §23789' })
    } else if (formData['near-school'] === 'No') {
      results.push({ ruleId: 'liq-distance', status: 'success', rule: 'School/Church Distance', message: '✓ No proximity conflict with schools or churches.', citation: 'CA B&P Code §23789' })
    }

    if (formData['license-type'] === 'Not sure which type') {
      results.push({ ruleId: 'liq-type', status: 'warning', rule: 'License Type', message: 'Choosing the wrong license type wastes your $13,800+ fee. Type 41: beer/wine only (with meals). Type 47: full liquor (with meals — must be a "bona fide eating place"). Type 48: full liquor bar (no food requirement). Most restaurants want Type 47.', citation: 'CA B&P Code §23394-23399' })
    }

    if (formData['license-type']?.includes('Type 47') && formData['bar-percentage'] === 'Over 70%') {
      results.push({ ruleId: 'liq-type-mismatch', status: 'error', rule: 'License Type Mismatch', message: '⚠️ Type 47 requires you to be a "bona fide eating place" — meaning food must be a significant part of your business. If 70%+ of revenue is alcohol, ABC may challenge your Type 47. Consider Type 48 instead (but note: Type 48 has different zoning requirements).', citation: 'CA B&P Code §23038' })
    }

    if (formData['rbs-training'] === 'No one trained yet') {
      results.push({ ruleId: 'liq-training', status: 'warning', rule: 'RBS Training Required', message: 'All servers must complete Responsible Beverage Service (RBS) training. In California, this is legally required within 60 days of hire (AB 1221). Complete it before opening to avoid violations on day one.', citation: 'CA AB 1221' })
    }
  }

  // Fire permit validations
  if (permit.id === 'fire-permit') {
    if (formData['has-hood-suppression'] === 'No — need to install') {
      results.push({ ruleId: 'fire-hood', status: 'error', rule: 'Kitchen Hood Fire Suppression', message: '🚨 Commercial cooking REQUIRES an automatic fire suppression system (Ansul/wet chemical) in the hood. Cost: $3,000-$8,000 installed. Must be done by a licensed fire protection contractor and inspected every 6 months.', citation: 'NFPA 96 §10.1' })
    } else if (formData['has-hood-suppression'] === 'Yes — Ansul/wet chemical system installed') {
      results.push({ ruleId: 'fire-hood', status: 'success', rule: 'Fire Suppression System', message: '✓ Hood fire suppression confirmed. Make sure inspection tag is current (every 6 months). Have the inspection report ready for fire marshal.', citation: 'NFPA 96 §10.1' })
    }

    if (formData['max-occupancy'] && Number(formData['max-occupancy']) > 49 && formData['exit-count'] && Number(formData['exit-count']) < 2) {
      results.push({ ruleId: 'fire-exits', status: 'error', rule: 'Emergency Exits', message: `🚨 Occupancy of ${formData['max-occupancy']} requires MINIMUM 2 exits. You only have ${formData['exit-count']}. Fire marshal will not approve occupancy permit. Adding an exit is a building permit + construction project.`, citation: 'IFC §1006' })
    }

    if (formData['dining-sqft'] && formData['max-occupancy']) {
      const sqft = Number(formData['dining-sqft'])
      const desired = Number(formData['max-occupancy'])
      const maxByCode = Math.floor(sqft / 15) // 15 sq ft per person for tables
      if (desired > maxByCode) {
        results.push({ ruleId: 'fire-occupancy', status: 'error', rule: 'Occupancy Calculation', message: `Your dining area (${sqft} sq ft ÷ 15 sq ft/person) supports maximum ${maxByCode} people with table seating. You want ${desired}. Fire marshal will reject this. Either reduce capacity or increase dining area.`, citation: 'IFC Table 1004.5' })
      } else {
        results.push({ ruleId: 'fire-occupancy', status: 'success', rule: 'Occupancy Calculation', message: `✓ ${sqft} sq ft supports up to ${maxByCode} with table seating. Your ${desired} is within limits.`, citation: 'IFC Table 1004.5' })
      }
    }
  }

  // Outdoor dining validations
  if (permit.id === 'outdoor-dining') {
    if (formData['outdoor-type'] === 'Sidewalk seating (public right-of-way)' && formData['sidewalk-width']) {
      const width = Number(formData['sidewalk-width'])
      if (width < 10) {
        results.push({ ruleId: 'out-ada', status: 'error', rule: 'ADA Sidewalk Clearance', message: `🚨 Sidewalk is ${width}ft total. After placing tables/chairs/barriers, you must maintain 4-6ft clear pedestrian path. With a ${width}ft sidewalk, you may have no room for dining. Typical minimum sidewalk for outdoor dining: 10-12ft.`, citation: 'ADA Standards §4.3' })
      } else {
        const diningWidth = width - 6 // assume 6ft clearance needed
        results.push({ ruleId: 'out-ada', status: 'success', rule: 'Sidewalk Width', message: `✓ ${width}ft sidewalk. After 6ft pedestrian clearance, ~${diningWidth}ft available for dining. Enough for a row of 2-top tables.`, citation: 'ADA Standards §4.3' })
      }
    }

    if (formData['outdoor-alcohol'] === 'Yes') {
      results.push({ ruleId: 'out-barrier', status: 'warning', rule: 'Alcohol Outdoor Barriers', message: 'Serving alcohol outdoors requires a FULLY ENCLOSED barrier around the outdoor dining area. Stanchions with ropes are usually not sufficient — need solid barriers (planters, railings). This is an ABC requirement AND a city requirement. Also requires amendment to your liquor license.', citation: 'ABC Premises Requirements' })
    }

    if (formData['outdoor-heaters'] === 'Yes — gas/propane') {
      results.push({ ruleId: 'out-heater', status: 'warning', rule: 'Patio Heater Requirements', message: 'Gas patio heaters need: fire department approval, minimum 3ft clearance from combustibles, weighted/secured base, no use under fabric awnings. Some cities require a separate permit per heater. Electric heaters are much simpler to permit.', citation: 'NFPA 58; Local Fire Code' })
    }
  }

  // Building permit validations
  if (permit.id === 'building-permit') {
    if (formData['previous-use'] && !formData['previous-use'].includes('Restaurant')) {
      results.push({ ruleId: 'bp-change-use', status: 'error', rule: 'Change of Occupancy', message: `🚨 Converting from "${formData['previous-use']}" to restaurant triggers a CHANGE OF OCCUPANCY review. This is often the most expensive surprise: may require seismic upgrade ($50k-$200k), ADA renovation ($20k-$100k), additional exits, and sprinkler installation. Get a contractor estimate BEFORE signing a lease.`, citation: 'IBC §3408; ADA Title III' })
    }

    if (formData['has-grease-trap'] === 'No — need to install') {
      results.push({ ruleId: 'bp-grease', status: 'warning', rule: 'Grease Interceptor', message: 'Grease interceptor installation: $3,000-$10,000 depending on size and location. Must be sized by a plumber based on fixture count. Undersized = city fines + sewer backups. Most cities require it before health permit approval.', citation: 'UPC §1014' })
    }

    if (formData['ada-compliant'] === 'No') {
      results.push({ ruleId: 'bp-ada', status: 'error', rule: 'ADA Compliance', message: '🚨 ADA non-compliance is a major liability. Renovation triggering a building permit often requires bringing the ENTIRE space to current ADA standards (not just the area being renovated). Budget $20,000-$100,000. ADA drive-by lawsuits are common — lawyers target restaurants.', citation: 'ADA Title III; IBC §3411' })
    }
  }

  // Sign permit validations
  if (permit.id === 'sign-permit') {
    if (formData['historic-district'] === 'Yes') {
      results.push({ ruleId: 'sign-historic', status: 'warning', rule: 'Historic District Review', message: 'Historic district signs require Design Review Board approval. This adds 1-2 months. Restrictions may include: no internally lit signs, specific color palettes, material requirements (wood/metal only), size limits. Submit early.', citation: 'Local Historic Preservation Ordinance' })
    }

    if (formData['sign-illuminated'] === 'Yes — neon') {
      results.push({ ruleId: 'sign-neon', status: 'warning', rule: 'Neon Sign Restrictions', message: 'Neon signs face extra restrictions in many cities: no flashing/animation, limited proximity to residential, some historic districts ban neon entirely. Check your local sign ordinance before ordering.', citation: 'Local Sign Ordinance §17.40.060' })
    }
  }

  // Music permit validations
  if (permit.id === 'music-permit') {
    if (formData['near-residential'] === 'Yes — adjacent' && formData['entertainment-hours']?.includes('midnight')) {
      results.push({ ruleId: 'mus-noise', status: 'error', rule: 'Noise Ordinance Risk', message: '🚨 Entertainment past midnight with adjacent residential = almost guaranteed noise complaints. Many cities will deny or heavily restrict your entertainment permit. Consider sound insulation ($5,000-$20,000) or earlier entertainment cutoff.', citation: 'Local Noise Ordinance §10.28' })
    }

    if (formData['entertainment-type']?.includes('Dancing')) {
      results.push({ ruleId: 'mus-dance', status: 'warning', rule: 'Dance Permit', message: 'Dancing often requires a SEPARATE cabaret/dance permit in addition to the entertainment permit. Some cities have very limited cabaret licenses. In San Francisco, this is one of the hardest permits to get. Check availability before committing to a dance concept.', citation: 'Local Entertainment Ordinance' })
    }
  }

  return results
}
