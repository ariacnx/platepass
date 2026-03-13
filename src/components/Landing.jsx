export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="text-[10px] text-stone-400 uppercase tracking-[0.3em] mb-6">
          Restaurant Permit Navigator
        </div>

        <h1 className="text-5xl md:text-7xl font-light text-stone-900 tracking-wide mb-4">
          PlatePass
        </h1>

        <p className="text-lg md:text-xl font-light text-stone-500 mb-2 tracking-wide">
          Every permit. Every rule. One place.
        </p>

        <p className="text-sm text-stone-400 max-w-md mx-auto mb-16 leading-relaxed">
          Answer a few questions about your restaurant. We'll tell you every permit you need, 
          what it costs, and validate your applications in real-time.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-12 mb-16">
          <div className="text-center">
            <div className="text-3xl font-light text-stone-900">17</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1">avg permits</div>
          </div>
          <div className="w-px h-10 bg-stone-200" />
          <div className="text-center">
            <div className="text-3xl font-light text-stone-900">$30k+</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1">compliance cost</div>
          </div>
          <div className="w-px h-10 bg-stone-200" />
          <div className="text-center">
            <div className="text-3xl font-light text-stone-900">100hrs</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1">of paperwork</div>
          </div>
        </div>

        <button
          onClick={() => navigate('interview')}
          className="px-12 py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
        >
          Get Started
        </button>

        <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-4">
          2 minutes · No signup required
        </p>
      </div>

      {/* How it works */}
      <div className="border-t border-stone-200 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-[10px] text-stone-400 uppercase tracking-[0.3em] text-center mb-12">
            How It Works
          </div>

          <div className="grid sm:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mb-3">Step 1</div>
              <div className="text-sm font-medium text-stone-900 mb-2 tracking-wide">Answer Questions</div>
              <div className="text-xs text-stone-400 leading-relaxed">
                Tell us about your restaurant — type, location, alcohol, seating.
              </div>
            </div>
            <div>
              <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mb-3">Step 2</div>
              <div className="text-sm font-medium text-stone-900 mb-2 tracking-wide">See Your Permits</div>
              <div className="text-xs text-stone-400 leading-relaxed">
                Every permit you need, with estimated costs and timelines.
              </div>
            </div>
            <div>
              <div className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mb-3">Step 3</div>
              <div className="text-sm font-medium text-stone-900 mb-2 tracking-wide">Fill & Validate</div>
              <div className="text-xs text-stone-400 leading-relaxed">
                Real-time validation catches mistakes before you submit.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="border-t border-stone-100 py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-sm text-stone-400 font-light italic leading-relaxed">
            "You want to put a heater on your restaurant patio? That's a fire department 
            inspection, an amended outdoor dining permit, and possibly a building permit 
            for the gas line. Three forms, three agencies, three rulebooks. For a heater."
          </p>
          <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-4">
            — Every restaurant owner, ever
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 py-6 text-center">
        <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em]">
          Focus on the food. We handle the paperwork.
        </p>
      </div>
    </div>
  )
}
