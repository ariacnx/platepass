export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-3xl animate-fade-in">
        <div className="text-6xl mb-6">🍽️</div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2">
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            PlatePass
          </span>
        </h1>

        <p className="text-2xl md:text-3xl text-white/80 font-light mt-4 mb-3">
          TurboTax for restaurant permits
        </p>

        <p className="text-lg text-white/40 max-w-xl mx-auto mb-12">
          Answer a few questions about your restaurant. We'll tell you every permit you need, what it costs, and validate your applications in real-time.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">17</div>
            <div className="text-white/30 text-xs mt-1">avg permits to open</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">$30k+</div>
            <div className="text-white/30 text-xs mt-1">compliance costs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">100hrs</div>
            <div className="text-white/30 text-xs mt-1">of paperwork</div>
          </div>
        </div>

        <button
          onClick={() => navigate('interview')}
          className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl font-bold text-white text-xl transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105"
        >
          Get Started — It's Free
        </button>

        <p className="text-white/20 text-sm mt-6">Takes about 2 minutes. No signup required.</p>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4 mt-20 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/5">
            <div className="text-orange-400 font-mono text-xs mb-2">STEP 1</div>
            <div className="text-white/70 text-sm font-semibold mb-1">Answer Questions</div>
            <div className="text-white/30 text-xs">Tell us about your restaurant — type, location, alcohol, seating, etc.</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5">
            <div className="text-amber-400 font-mono text-xs mb-2">STEP 2</div>
            <div className="text-white/70 text-sm font-semibold mb-1">See Your Permits</div>
            <div className="text-white/30 text-xs">We show you every permit you need, estimated costs, and timelines.</div>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
            <div className="text-emerald-400 font-mono text-xs mb-2">STEP 3</div>
            <div className="text-white/70 text-sm font-semibold mb-1">Fill & Validate</div>
            <div className="text-white/30 text-xs">Fill out each application with real-time validation. Catch mistakes before you submit.</div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-16 p-6 rounded-2xl border border-white/5 bg-white/[0.02] max-w-xl mx-auto">
          <p className="text-white/50 text-sm italic">
            "You want to put a heater on your restaurant patio? That's a fire department inspection, an amended outdoor dining permit, and possibly a building permit for the gas line. Three forms, three agencies, three rulebooks. For a heater."
          </p>
          <p className="text-white/20 text-xs mt-3">— Every restaurant owner, ever</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  )
}
