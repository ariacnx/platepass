// Food images from Clean Eats / Forkcasts (for subtle mosaic)
const FOOD_IMAGES = [
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fburger.png?alt=media&token=76bf0eb8-4fc3-4cae-bb20-5cf8a42ea8d1",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fchipotle.png?alt=media&token=e3525629-3101-40c9-b3b1-454da0305e99",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fmiso_salmon.png?alt=media&token=057bb6fe-ade4-435a-b0fd-ae608feee77c",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fpoke.png?alt=media&token=17c543bc-8e8a-4329-9d36-b925a58936cd",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fsando.png?alt=media&token=a7253f44-2521-40fe-81e2-f6f6f61fb2e5",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fpasta.png?alt=media&token=27c42b87-0cff-4ad3-ad4e-2e6b96498282",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fpizza.png?alt=media&token=213721f5-fca8-4e5c-99cc-4a1868e9b492",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Fyakitori.png?alt=media&token=8f203718-4347-46d7-8326-180e30491606",
  "https://firebasestorage.googleapis.com/v0/b/cleaneats-49351.firebasestorage.app/o/defaults%2Ftomato_beef.png?alt=media&token=8861817b-0f3c-4757-9b94-af7b87c7d2ab",
]

export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Video header with tagline */}
      <div className="relative overflow-hidden h-[180px] md:h-[220px]">
        <video
          src="/assets/banner.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-stone-900/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <p className="text-2xl md:text-3xl font-light text-white tracking-wide">
            Focus on the food. We handle the paperwork.
          </p>
        </div>
      </div>

      {/* Hero with faded food mosaic */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 gap-1 opacity-[0.18]">
          {FOOD_IMAGES.concat(FOOD_IMAGES).slice(0, 15).map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-24 max-w-2xl mx-auto text-center animate-fade-in">
          <div className="text-xs text-stone-400 uppercase tracking-[0.3em] mb-6">
            Restaurant Permit Navigator
          </div>

          <h1 className="text-6xl md:text-8xl font-light text-stone-900 tracking-wide mb-4">
            PlatePass
          </h1>

          <p className="text-xl md:text-2xl font-light text-stone-500 mb-3 tracking-wide">
            Every permit. Every rule. One place.
          </p>

          <p className="text-base text-stone-400 max-w-lg mx-auto mb-14 leading-relaxed">
            Answer a few questions about your restaurant. We'll tell you every permit you need, 
            what it costs, and validate your applications in real-time.
          </p>

          <button
            onClick={() => navigate('smart')}
            className="px-12 py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Get Started
          </button>

          <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-4">
            2 minutes · No signup required
          </p>
        </div>
      </div>

      {/* The real cost */}
      <div className="border-t border-stone-200 py-20 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs text-stone-400 uppercase tracking-[0.3em] text-center mb-10">
            The Real Cost of Opening
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 border border-stone-200 bg-white">
              <div className="text-5xl font-light text-stone-900 mb-2">17</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-3">Permits in San Francisco</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Health, fire, building, liquor, signage, outdoor dining, entertainment, business license — from 8 different agencies.
              </p>
            </div>
            <div className="text-center p-6 border border-stone-200 bg-white">
              <div className="text-5xl font-light text-stone-900 mb-2">$30k–$100k</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-3">Compliance Costs</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Permit fees, consultant fees, lawyer fees, plan review fees, inspection fees. Before you serve a single plate.
              </p>
            </div>
            <div className="text-center p-6 border border-stone-200 bg-white">
              <div className="text-5xl font-light text-stone-900 mb-2">60%</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-3">Fail in Year One</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Compliance mistakes cause delays, fines, and closures. Most owners don't know what they don't know.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-stone-900 leading-relaxed">
              Opening a restaurant shouldn't require a law degree.
            </p>
          </div>
        </div>
      </div>

      {/* What goes wrong */}
      <div className="border-t border-stone-200 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-[10px] text-stone-400 uppercase tracking-[0.3em] text-center mb-10">
            What Goes Wrong
          </div>

          <div className="space-y-6">
            <div className="p-6 border-l-2 border-red-300 bg-red-50/30">
              <div className="text-base font-medium text-stone-900 mb-1">Wrong liquor license type</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                $13,800 application fee. Non-refundable. Type 47 vs Type 48 vs Type 41 — pick wrong and you start over.
              </p>
            </div>
            <div className="p-6 border-l-2 border-red-300 bg-red-50/30">
              <div className="text-base font-medium text-stone-900 mb-1">No 3-compartment sink</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                #2 reason health permits get denied. A commercial dishwasher doesn't replace it. $2k–$5k to fix after the fact.
              </p>
            </div>
            <div className="p-6 border-l-2 border-red-300 bg-red-50/30">
              <div className="text-base font-medium text-stone-900 mb-1">Location within 600ft of a school</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Liquor license denied. After signing the lease, paying the deposit, starting renovations. Nobody told you to measure.
              </p>
            </div>
            <div className="p-6 border-l-2 border-amber-300 bg-amber-50/30">
              <div className="text-base font-medium text-stone-900 mb-1">Change of occupancy surprise</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Converting a retail space to restaurant? That triggers seismic, ADA, and sprinkler requirements. $50k–$200k nobody budgeted for.
              </p>
            </div>
            <div className="p-6 border-l-2 border-amber-300 bg-amber-50/30">
              <div className="text-base font-medium text-stone-900 mb-1">Carpet in the kitchen</div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Automatic health inspection failure. Sounds obvious? It's in the top 10 reasons for permit denial every year.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How PlatePass helps */}
      <div className="border-t border-stone-200 py-20 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-[10px] text-stone-400 uppercase tracking-[0.3em] text-center mb-10">
            How PlatePass Works
          </div>

          <div className="grid sm:grid-cols-3 gap-12 text-center mb-12">
            <div>
              <div className="text-3xl mb-3">📋</div>
              <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mb-3">Step 1</div>
              <div className="text-base font-medium text-stone-900 mb-2 tracking-wide">Tell Us About Your Restaurant</div>
              <div className="text-sm text-stone-400 leading-relaxed">
                10 questions. Type of food, location, alcohol, seating, construction, entertainment.
              </div>
            </div>
            <div>
              <div className="text-3xl mb-3">🗂️</div>
              <div className="text-xs text-stone-300 uppercase tracking-[0.2em] mb-3">Step 2</div>
              <div className="text-base font-medium text-stone-900 mb-2 tracking-wide">See Every Permit You Need</div>
              <div className="text-sm text-stone-400 leading-relaxed">
                Personalized list with costs, timelines, and the agency to contact. No more guessing.
              </div>
            </div>
            <div>
              <div className="text-3xl mb-3">✅</div>
              <div className="text-xs text-stone-300 uppercase tracking-[0.2em] mb-3">Step 3</div>
              <div className="text-base font-medium text-stone-900 mb-2 tracking-wide">Fill Out & Validate</div>
              <div className="text-sm text-stone-400 leading-relaxed">
                Real-time validation against actual regulations. Catches mistakes before you submit and pay.
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="p-6 border border-stone-200 bg-white">
              <div className="text-xs text-red-400 uppercase tracking-[0.2em] mb-3">Without PlatePass</div>
              <ul className="space-y-2 text-sm text-stone-500 leading-relaxed">
                <li>• Consultant: $5,000–$25,000</li>
                <li>• Lawyer: $5,000–$15,000</li>
                <li>• Your time: 80–120 hours of research</li>
                <li>• Still miss things and get denied</li>
              </ul>
            </div>
            <div className="p-6 border border-stone-900 bg-white">
              <div className="text-xs text-stone-900 uppercase tracking-[0.2em] mb-3">With PlatePass</div>
              <ul className="space-y-2 text-sm text-stone-500 leading-relaxed">
                <li>• Free — 2 minutes</li>
                <li>• Every permit identified automatically</li>
                <li>• Real-time validation against actual code</li>
                <li>• Catches $13,800 mistakes before you make them</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="border-t border-stone-100 py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-base text-stone-400 font-light italic leading-relaxed">
            "You want to put a heater on your restaurant patio? That's a fire department 
            inspection, an amended outdoor dining permit, and possibly a building permit 
            for the gas line. Three forms, three agencies, three rulebooks. For a heater."
          </p>
          <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-4">
            — Every restaurant owner, ever
          </p>
        </div>
      </div>

      {/* Scrolling food strip */}
      <div className="border-t border-stone-100 overflow-hidden">
        <div className="flex" style={{
          animation: 'scroll 30s linear infinite',
          width: 'max-content'
        }}>
          {FOOD_IMAGES.concat(FOOD_IMAGES).map((src, i) => (
            <div key={i} className="w-36 h-36 md:w-48 md:h-48 flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em]">
          PlatePass © 2026
        </p>
      </div>
    </div>
  )
}
