import { useState, useRef } from 'react'
import { INTERVIEW_QUESTIONS } from '../data/permitDatabase'
import { ENHANCED_EXTRACT_PROMPT } from '../utils/permitPrefill'

export default function SmartStart({ answers, setAnswers, extractedData: parentExtracted, setExtractedData: setParentExtracted, navigate }) {
  const [mode, setMode] = useState(null) // null | 'voice' | 'upload' | 'type'
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [extractedData, setExtractedDataLocal] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const fileInputRef = useRef(null)

  // Parse free-text into structured answers using OpenAI
  const parseWithAI = async (text, fileContents = '') => {
    setIsProcessing(true)
    
    const questionContext = INTERVIEW_QUESTIONS.map(q => {
      const opts = q.options?.map(o => typeof o === 'string' ? o : o.value).join(', ')
      return `- ${q.id}: ${q.question}${opts ? ` (options: ${opts})` : ` (type: ${q.type})`}`
    }).join('\n')

    const prompt = `${ENHANCED_EXTRACT_PROMPT}

Interview field options for Level 1:
${questionContext}

User's description:
${text}

${fileContents ? `\nDocument contents:\n${fileContents}` : ''}

For Level 1 select fields, match to the closest valid option value exactly.
Return ONLY the JSON object, no other text.`

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) {
        // Fallback: basic keyword extraction
        return basicExtract(text)
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 500
        })
      })

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content?.trim()
      
      // Parse JSON from response (handle markdown code blocks)
      let jsonStr = content
      if (content.startsWith('```')) {
        jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      }
      
      const parsed = JSON.parse(jsonStr)
      return parsed
    } catch (e) {
      console.error('AI parsing failed:', e)
      return basicExtract(text)
    }
  }

  // Basic keyword extraction fallback
  const basicExtract = (text) => {
    const lower = text.toLowerCase()
    const result = {}

    // Restaurant name — look for quotes or "called X"
    const nameMatch = text.match(/called\s+["']?([^"',]+)/i) || text.match(/["']([^"']+)["']/i)
    if (nameMatch) result.restaurantName = nameMatch[1].trim()

    // City
    const cityMatch = text.match(/(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/m)
    if (cityMatch) result.city = cityMatch[1]

    // Food type
    if (lower.includes('full service') || lower.includes('sit-down') || lower.includes('fine dining')) result.foodType = 'full-service'
    else if (lower.includes('fast casual') || lower.includes('counter')) result.foodType = 'fast-casual'
    else if (lower.includes('café') || lower.includes('cafe') || lower.includes('coffee')) result.foodType = 'cafe'
    else if (lower.includes('bar')) result.foodType = 'bar-food'
    else if (lower.includes('bakery')) result.foodType = 'bakery'
    else if (lower.includes('ghost') || lower.includes('delivery only')) result.foodType = 'ghost-kitchen'

    // Alcohol
    if (lower.includes('full bar') || lower.includes('cocktail') || lower.includes('liquor')) result.servesAlcohol = 'Yes'
    else if (lower.includes('beer and wine') || lower.includes('beer & wine')) result.servesAlcohol = 'Yes'
    else if (lower.includes('no alcohol') || lower.includes('no booze')) result.servesAlcohol = 'No'

    // Situation
    if (lower.includes('taking over') || lower.includes('previous tenant')) result.situation = 'taking-over'
    else if (lower.includes('food truck') || lower.includes('mobile')) result.situation = 'food-truck'
    else if (lower.includes('new restaurant') || lower.includes('opening')) result.situation = 'opening-new'

    // Outdoor
    if (lower.includes('patio') || lower.includes('outdoor') || lower.includes('sidewalk')) result.hasOutdoor = 'Yes'

    // Construction
    if (lower.includes('renovation') || lower.includes('gut') || lower.includes('buildout') || lower.includes('remodel')) result.needsConstruction = 'Yes'
    else if (lower.includes('turnkey') || lower.includes('ready to go')) result.needsConstruction = 'No'
    else if (lower.includes('retail') || lower.includes('office') || lower.includes('converting')) result.needsConstruction = 'Yes'

    // Entertainment
    if (lower.includes('live music') || lower.includes('dj') || lower.includes('karaoke')) result.hasEntertainment = 'Yes'
    else if (lower.includes('tv') || lower.includes('sports')) result.hasEntertainment = 'TVs'

    // Signage
    if (lower.includes('sign')) result.hasSignage = 'Yes'

    // Seating
    const seatMatch = text.match(/(\d+)\s*seats/i) || text.match(/seating\s+(?:for\s+)?(\d+)/i)
    if (seatMatch) result.seatingCount = seatMatch[1]

    return result
  }

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        await transcribeAndParse(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (e) {
      alert('Could not access microphone. Please allow microphone access and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAndParse = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) {
        alert('OpenAI API key required for voice input. Add VITE_OPENAI_API_KEY to .env')
        setIsProcessing(false)
        return
      }

      // Transcribe with Whisper
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('model', 'whisper-1')

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData
      })

      const data = await res.json()
      const transcript = data.text || ''
      
      if (!transcript) {
        alert('Could not transcribe audio. Please try again or type instead.')
        setIsProcessing(false)
        return
      }

      setTextInput(transcript)
      const extracted = await parseWithAI(transcript)
      showExtracted(extracted)
    } catch (e) {
      console.error('Transcription failed:', e)
      alert('Voice processing failed. Please try typing instead.')
      setIsProcessing(false)
    }
  }

  // File upload handling
  const handleFiles = async (files) => {
    const fileList = Array.from(files)
    setUploadedFiles(fileList.map(f => f.name))
    setIsProcessing(true)

    let allText = ''
    for (const file of fileList) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        allText += await file.text() + '\n'
      } else if (file.type === 'application/pdf') {
        // For PDFs we'd need a parser — for now just note the filename
        allText += `[Uploaded PDF: ${file.name}]\n`
      } else {
        allText += `[Uploaded file: ${file.name}]\n`
      }
    }

    const extracted = await parseWithAI(
      textInput || 'Extract restaurant information from these documents.',
      allText
    )
    showExtracted(extracted)
  }

  const showExtracted = (extracted) => {
    setExtractedDataLocal(extracted)
    setIsProcessing(false)
  }

  // Apply extracted data and go to dashboard
  const applyAndContinue = () => {
    if (extractedData) {
      setAnswers(prev => ({ ...prev, ...extractedData }))
      setParentExtracted(prev => ({ ...prev, ...extractedData }))
    }
    navigate('dashboard')
  }

  // Apply and go to interview to fill gaps
  const applyAndReview = () => {
    if (extractedData) {
      setAnswers(prev => ({ ...prev, ...extractedData }))
      setParentExtracted(prev => ({ ...prev, ...extractedData }))
    }
    navigate('interview')
  }

  // Field labels for display
  const fieldLabels = {}
  INTERVIEW_QUESTIONS.forEach(q => {
    fieldLabels[q.id] = q.question
    if (q.options) {
      q.options.forEach(o => {
        if (typeof o !== 'string') fieldLabels[`${q.id}__${o.value}`] = o.label
      })
    }
  })

  const getDisplayValue = (key, value) => {
    const q = INTERVIEW_QUESTIONS.find(q => q.id === key)
    if (!q) return value
    if (q.options) {
      const opt = q.options.find(o => (typeof o === 'string' ? o : o.value) === value)
      if (opt) return typeof opt === 'string' ? opt : opt.label
    }
    return value
  }

  const totalQuestions = INTERVIEW_QUESTIONS.length
  const filledCount = extractedData ? Object.keys(extractedData).length : 0

  // ── RENDER: Extracted data review ──
  if (extractedData) {
    return (
      <div className="min-h-screen bg-white px-6 py-12 max-w-2xl mx-auto animate-fade-in">
        <div className="text-xs text-stone-500 uppercase tracking-[0.3em] mb-8">
          Smart Start
        </div>

        <h2 className="text-3xl font-light text-stone-900 tracking-wide mb-2">
          Here's what I found
        </h2>
        <p className="text-base text-stone-500 mb-8">
          {filledCount} of {totalQuestions} fields auto-filled. Review and confirm.
        </p>

        {/* Progress bar */}
        <div className="h-1 bg-stone-100 mb-10">
          <div
            className="h-full bg-stone-900 transition-all duration-500"
            style={{ width: `${(filledCount / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Extracted fields */}
        <div className="space-y-4 mb-10">
          {INTERVIEW_QUESTIONS.map(q => {
            const value = extractedData[q.id]
            const isFilled = !!value
            return (
              <div
                key={q.id}
                className={`p-4 border-l-2 ${
                  isFilled ? 'border-l-emerald-400 bg-emerald-50/30' : 'border-l-stone-200 bg-stone-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-[0.15em] mb-1">
                      {q.question}
                    </div>
                    {isFilled ? (
                      <div className="text-base text-stone-900 font-medium">
                        {getDisplayValue(q.id, value)}
                      </div>
                    ) : (
                      <div className="text-sm text-stone-300 italic">Not detected — will ask during review</div>
                    )}
                  </div>
                  {isFilled && <span className="text-emerald-500 text-lg">✓</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={applyAndContinue}
            className="flex-1 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            See My Permits →
          </button>
          <button
            onClick={applyAndReview}
            className="flex-1 px-8 py-4 border border-stone-300 hover:border-stone-900 text-stone-700 text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Review & Fill Gaps
          </button>
        </div>

        <button
          onClick={() => { setExtractedDataLocal(null); setMode(null) }}
          className="mt-4 text-xs text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] cursor-pointer"
        >
          ← Start over
        </button>
      </div>
    )
  }

  // ── RENDER: Processing ──
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-6 animate-pulse">🔍</div>
          <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
            Analyzing your information...
          </h2>
          <p className="text-base text-stone-500">
            Extracting restaurant details and matching to permit requirements
          </p>
        </div>
      </div>
    )
  }

  // ── RENDER: Voice recording ──
  if (mode === 'voice') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg animate-fade-in">
          <button onClick={() => setMode(null)} className="text-xs text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] mb-8 cursor-pointer">
            ← Back
          </button>

          {!isRecording ? (
            <>
              <div className="text-5xl mb-6">🎙️</div>
              <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-4">
                Tell us about your restaurant
              </h2>
              <div className="text-sm text-stone-500 mb-8 leading-relaxed text-left p-5 border border-stone-200 bg-stone-50">
                <div className="text-xs text-stone-500 uppercase tracking-[0.2em] mb-3">Try saying something like:</div>
                <p className="italic">"I'm opening a ramen restaurant called Nori on Valencia Street in San Francisco. 
                About 40 seats, full bar, taking over an old retail space. Planning to have outdoor seating 
                on the sidewalk and maybe live music on weekends."</p>
              </div>
              <button
                onClick={startRecording}
                className="px-12 py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Start Recording
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-6 animate-pulse">🔴</div>
              <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-4">
                Listening...
              </h2>
              <p className="text-base text-stone-500 mb-8">
                Tell us everything about your restaurant plans
              </p>
              <button
                onClick={stopRecording}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-sm uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Stop Recording
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── RENDER: Text input ──
  if (mode === 'type') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full animate-fade-in">
          <button onClick={() => setMode(null)} className="text-xs text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] mb-8 cursor-pointer">
            ← Back
          </button>

          <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
            Describe your restaurant
          </h2>
          <p className="text-sm text-stone-500 mb-6">
            Include name, location, type of food, seating, alcohol plans, any construction needed — as much as you know.
          </p>

          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="I'm opening a ramen restaurant on Valencia Street in SF, about 40 seats, full bar, taking over an old retail space..."
            rows={8}
            autoFocus
            className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-stone-900 text-base font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition resize-none leading-relaxed"
          />

          <button
            onClick={async () => {
              if (!textInput.trim()) return
              const extracted = await parseWithAI(textInput)
              showExtracted(extracted)
            }}
            disabled={!textInput.trim()}
            className={`mt-6 w-full px-8 py-4 text-sm uppercase tracking-[0.2em] transition-all cursor-pointer ${
              textInput.trim()
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            Extract & Auto-Fill
          </button>
        </div>
      </div>
    )
  }

  // ── RENDER: Upload ──
  if (mode === 'upload') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full animate-fade-in">
          <button onClick={() => setMode(null)} className="text-xs text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] mb-8 cursor-pointer">
            ← Back
          </button>

          <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-2">
            Upload your documents
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Lease agreement, business registration, floor plans, menu — anything that describes your restaurant.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-stone-900') }}
            onDragLeave={e => e.currentTarget.classList.remove('border-stone-900')}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-stone-900')
              handleFiles(e.dataTransfer.files)
            }}
            className="border-2 border-dashed border-stone-300 hover:border-stone-900 p-12 text-center cursor-pointer transition-colors"
          >
            <div className="text-3xl mb-4">📎</div>
            <p className="text-base text-stone-500">Drop files here or click to browse</p>
            <p className="text-xs text-stone-300 mt-2">PDF, TXT, images — we'll extract what we can</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((name, i) => (
                <div key={i} className="text-sm text-stone-500 flex items-center gap-2">
                  <span>📄</span> {name}
                </div>
              ))}
            </div>
          )}

          {/* Also allow adding a description */}
          <div className="mt-8">
            <label className="text-xs text-stone-500 uppercase tracking-[0.2em] block mb-2">
              Add context (optional)
            </label>
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Any additional details about your restaurant plans..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-stone-900 text-sm font-light text-stone-900 placeholder:text-stone-300 focus:outline-none transition resize-none"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── RENDER: Mode selection (default) ──
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center animate-fade-in">
        <button onClick={() => navigate('landing')} className="text-xs text-stone-500 hover:text-stone-700 uppercase tracking-[0.2em] mb-12 cursor-pointer">
          ← Back
        </button>

        <div className="text-xs text-stone-500 uppercase tracking-[0.3em] mb-6 font-medium">
          How would you like to start?
        </div>

        <h2 className="text-3xl md:text-4xl font-light text-stone-900 tracking-wide mb-4">
          Tell us about your restaurant
        </h2>
        <p className="text-base text-stone-500 mb-12">
          Choose how you'd like to share your information. We'll auto-fill everything we can.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => setMode('voice')}
            className="group p-8 border border-stone-200 hover:border-stone-900 transition-all cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🎙️</div>
            <div className="text-base font-medium text-stone-900 mb-2">Voice</div>
            <div className="text-sm text-stone-500">Just talk. We'll extract everything.</div>
          </button>

          <button
            onClick={() => setMode('upload')}
            className="group p-8 border border-stone-200 hover:border-stone-900 transition-all cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">📎</div>
            <div className="text-base font-medium text-stone-900 mb-2">Upload</div>
            <div className="text-sm text-stone-500">Drop your lease, plans, or docs.</div>
          </button>

          <button
            onClick={() => setMode('type')}
            className="group p-8 border border-stone-200 hover:border-stone-900 transition-all cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">⌨️</div>
            <div className="text-base font-medium text-stone-900 mb-2">Type</div>
            <div className="text-sm text-stone-500">Describe your plans in your own words.</div>
          </button>
        </div>

        {/* Manual option */}
        <div className="border-t border-stone-100 pt-8">
          <button
            onClick={() => navigate('interview')}
            className="text-sm text-stone-500 hover:text-stone-900 uppercase tracking-[0.2em] cursor-pointer transition-colors border-b border-stone-300 hover:border-stone-900 pb-0.5"
          >
            Or fill out the form manually →
          </button>
        </div>
      </div>
    </div>
  )
}
