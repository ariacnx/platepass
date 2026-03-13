// PlatePass — Restaurant Permit Database
// Each permit has: conditions (when needed), rules (validation), form fields

export const PERMITS = [
  {
    id: 'business-license',
    name: 'Business License',
    emoji: '📋',
    agency: 'City Clerk / Business Tax Office',
    description: 'Required for all businesses operating within city limits.',
    cost: { min: 50, max: 500 },
    timeline: '1-2 weeks',
    required: true, // always required
    conditions: () => true,
    rules: [
      { id: 'bl-entity', condition: 'Business Entity Type', description: 'LLC or Corporation requires state registration (Articles of Organization/Incorporation) before applying for city business license.', grade: 'Required', citation: 'State Business & Professions Code' },
      { id: 'bl-ein', condition: 'EIN Required', description: 'All businesses with employees must have a federal EIN. Apply at IRS.gov — it\'s free and instant.', grade: 'Required', citation: 'IRS — Employer Identification Number' },
      { id: 'bl-dba', condition: 'DBA / Fictitious Name', description: 'If operating under a name different from your legal entity name, you must file a DBA (Doing Business As) with the county.', grade: 'Required', citation: 'County Clerk — Fictitious Business Name Statement' }
    ],
    formFields: [
      { id: 'business-name', label: 'Business Name (DBA)', type: 'text', placeholder: 'Name customers will see', required: true },
      { id: 'entity-type', label: 'Business Entity Type', type: 'select', options: ['Sole Proprietorship', 'LLC', 'Corporation (S-Corp)', 'Corporation (C-Corp)', 'Partnership', 'Not formed yet'], required: true },
      { id: 'ein', label: 'Federal EIN', type: 'text', placeholder: 'XX-XXXXXXX (or "applying")' },
      { id: 'owner-name', label: 'Owner / Registered Agent Name', type: 'text', required: true },
      { id: 'business-address', label: 'Restaurant Address', type: 'text', required: true },
      { id: 'start-date', label: 'Expected Opening Date', type: 'text', placeholder: 'MM/YYYY' }
    ]
  },
  {
    id: 'health-permit',
    name: 'Food Service Health Permit',
    emoji: '🍽️',
    agency: 'County Health Department',
    description: 'Required for any establishment that prepares, serves, or sells food to the public.',
    cost: { min: 200, max: 1000 },
    timeline: '2-6 weeks',
    required: true,
    conditions: () => true,
    rules: [
      { id: 'hp-3sink', condition: '3-Compartment Sink Required', description: 'All food service establishments must have a 3-compartment sink for wash/rinse/sanitize. Separate from handwashing sinks. Dishwasher does NOT replace this requirement.', grade: 'Critical', citation: 'FDA Food Code §4-301.12 — Manual Warewashing Equipment' },
      { id: 'hp-handwash', condition: 'Handwashing Stations', description: 'Minimum one handwashing sink in each food prep area. Must be accessible (not blocked by equipment). Must have soap, paper towels, and warm water.', grade: 'Critical', citation: 'FDA Food Code §5-203.11 — Handwashing Sinks' },
      { id: 'hp-temp', condition: 'Hot/Cold Holding Equipment', description: 'Cold food held at 41°F or below. Hot food held at 135°F or above. Need commercial refrigeration and steam tables/warming equipment.', grade: 'Critical', citation: 'FDA Food Code §3-501.16 — Time/Temperature Control' },
      { id: 'hp-floor', condition: 'Floor/Wall/Ceiling Requirements', description: 'Kitchen floors must be smooth, non-absorbent, easily cleanable (commercial tile, sealed concrete). No carpet. Walls: FRP panels or equivalent. Coved base at wall-floor junction.', grade: 'Required', citation: 'FDA Food Code §6-201.11 — Floors, Walls, Ceilings' },
      { id: 'hp-pest', condition: 'Pest Control Plan', description: 'Must have a pest management plan and contract with a licensed pest control operator. Self-screening gaps, cracks, and openings.', grade: 'Required', citation: 'FDA Food Code §6-501.111 — Controlling Pests' },
      { id: 'hp-foodhandler', condition: 'Food Handler Certifications', description: 'All employees handling food must have valid food handler certificates. Manager must have ServSafe Manager certification or equivalent.', grade: 'Required', citation: 'FDA Food Code §2-102.12 — Certified Food Protection Manager' }
    ],
    formFields: [
      { id: 'food-type', label: 'Type of Food Service', type: 'select', options: ['Full-service restaurant', 'Fast casual / counter service', 'Café / coffee shop (limited food prep)', 'Bar with food', 'Bakery', 'Food truck / mobile', 'Catering only', 'Ghost kitchen / delivery only'], required: true },
      { id: 'has-3sink', label: 'Do you have a 3-compartment sink?', type: 'select', options: ['Yes', 'No — need to install', 'Not sure', 'Using commercial dishwasher only'] },
      { id: 'handwash-count', label: 'Number of handwashing stations in kitchen', type: 'number', placeholder: 'Minimum 1 per prep area' },
      { id: 'hood-system', label: 'Commercial kitchen hood/ventilation?', type: 'select', options: ['Yes — Type I (grease) hood installed', 'Yes — Type II (steam/heat) only', 'No hood system', 'Not sure what type'] },
      { id: 'floor-type', label: 'Kitchen floor material', type: 'select', options: ['Commercial tile (non-slip)', 'Sealed concrete', 'VCT (vinyl composite tile)', 'Carpet', 'Hardwood', 'Other / Not renovated yet'] },
      { id: 'food-handler-certs', label: 'Staff food handler certifications', type: 'select', options: ['All staff certified', 'Some staff certified', 'No one certified yet', 'Manager certified (ServSafe)'] },
      { id: 'seating-count', label: 'Total seating capacity', type: 'number', placeholder: 'Including bar seats + patio' },
      { id: 'pest-control', label: 'Pest control contract?', type: 'select', options: ['Yes — monthly service', 'Yes — quarterly service', 'No contract yet', 'DIY pest control'] }
    ]
  },
  {
    id: 'liquor-license',
    name: 'Liquor License (ABC)',
    emoji: '🍷',
    agency: 'State Alcoholic Beverage Control (ABC)',
    description: 'Required to sell any alcoholic beverages on premises.',
    cost: { min: 13800, max: 15000 },
    timeline: '45-90 days (up to 1 year in some areas)',
    required: false,
    conditions: (answers) => answers.servesAlcohol === 'Yes',
    rules: [
      { id: 'liq-type', condition: 'License Type Selection', description: 'California: Type 41 (beer/wine only, with meals), Type 47 (full liquor, with meals — bona fide eating place), Type 48 (full liquor, bar — no food requirement). Wrong type = denied application + non-refundable fee.', grade: 'Critical', citation: 'CA Business & Professions Code §23394-23399' },
      { id: 'liq-distance', condition: 'Proximity to Schools/Churches', description: 'Most states prohibit alcohol sales within 600ft of schools, churches, and playgrounds. Measured door-to-door. Can apply for exception but rarely granted.', grade: 'Critical', citation: 'CA Business & Professions Code §23789 — Premises Near Schools' },
      { id: 'liq-saturation', condition: 'Census Tract Saturation', description: 'If your area already has more liquor licenses than average per census tract, the ABC may deny your application. Check your tract\'s license count before applying.', grade: 'Warning', citation: 'CA Business & Professions Code §23958.4 — Undue Concentration' },
      { id: 'liq-training', condition: 'Alcohol Service Training', description: 'All servers must complete Responsible Beverage Service (RBS) training within 60 days of hire. Managers must be certified before opening.', grade: 'Required', citation: 'CA AB 1221 — Responsible Beverage Service Act' },
      { id: 'liq-hours', condition: 'Service Hours Restriction', description: 'Alcohol cannot be sold between 2:00 AM and 6:00 AM in California. Some cities have additional restrictions (e.g., no new alcohol sales after midnight in residential areas).', grade: 'Required', citation: 'CA Business & Professions Code §25631' }
    ],
    formFields: [
      { id: 'license-type', label: 'License Type Applying For', type: 'select', options: ['Type 41 — Beer & Wine (with meals)', 'Type 47 — Full Liquor (with meals)', 'Type 48 — Full Liquor (bar, no food req)', 'Beer & Wine only (non-CA)', 'Full liquor (non-CA)', 'Not sure which type'], required: true },
      { id: 'near-school', label: 'Is the location within 600ft of a school, church, or playground?', type: 'select', options: ['No', 'Yes', 'Not sure — need to measure'] },
      { id: 'existing-license', label: 'Are you transferring an existing license?', type: 'select', options: ['No — new license', 'Yes — buying from previous tenant', 'Yes — buying from another location'] },
      { id: 'alcohol-hours', label: 'Latest time you plan to serve alcohol', type: 'select', options: ['Before 10 PM', '10 PM - 12 AM', '12 AM - 2 AM'] },
      { id: 'rbs-training', label: 'Staff RBS (Responsible Beverage Service) training', type: 'select', options: ['All servers trained', 'Some trained', 'No one trained yet', 'Will train before opening'] },
      { id: 'bar-percentage', label: 'Estimated % of revenue from alcohol', type: 'select', options: ['Under 30%', '30-50%', '50-70%', 'Over 70%'] }
    ]
  },
  {
    id: 'fire-permit',
    name: 'Fire Department Permit',
    emoji: '🔥',
    agency: 'City/County Fire Marshal',
    description: 'Required for occupancy, cooking systems, and fire safety compliance.',
    cost: { min: 200, max: 500 },
    timeline: '2-4 weeks',
    required: true,
    conditions: () => true,
    rules: [
      { id: 'fire-hood', condition: 'Kitchen Hood Fire Suppression', description: 'All commercial cooking operations with grease-producing equipment require a Type I hood with an automatic fire suppression system (Ansul/wet chemical). Must be inspected and tagged every 6 months.', grade: 'Critical', citation: 'NFPA 96 §10.1 — Commercial Cooking Operations' },
      { id: 'fire-extinguisher', condition: 'Fire Extinguisher Placement', description: 'Class K extinguisher required within 30ft travel distance of cooking equipment. Class ABC extinguishers at all exits. Must be mounted, accessible, and inspected annually.', grade: 'Required', citation: 'NFPA 10 §6.1 — Portable Fire Extinguishers' },
      { id: 'fire-occupancy', condition: 'Maximum Occupancy Calculation', description: 'Occupancy load based on: assembly with tables = 15 sq ft/person, standing/bar = 7 sq ft/person, kitchen = 200 sq ft/person. Total cannot exceed exit capacity.', grade: 'Required', citation: 'IFC Table 1004.5 — Maximum Floor Area Allowances' },
      { id: 'fire-exits', condition: 'Emergency Exit Requirements', description: 'Occupancy over 49 requires minimum 2 exits. Over 500 requires 3 exits. Exits must be at least half the diagonal distance of the room apart. All exits must be clearly marked and illuminated.', grade: 'Critical', citation: 'IFC §1006 — Number of Exits; IBC §1007' }
    ],
    formFields: [
      { id: 'total-sqft', label: 'Total restaurant square footage', type: 'number', placeholder: 'Including kitchen, dining, bar, storage', required: true },
      { id: 'dining-sqft', label: 'Dining area square footage', type: 'number', placeholder: 'Seating area only' },
      { id: 'has-hood-suppression', label: 'Kitchen hood fire suppression system?', type: 'select', options: ['Yes — Ansul/wet chemical system installed', 'No — need to install', 'Not sure', 'No cooking (café/bar only)'] },
      { id: 'exit-count', label: 'Number of emergency exits', type: 'number', placeholder: 'Doors leading directly outside' },
      { id: 'has-sprinklers', label: 'Sprinkler system?', type: 'select', options: ['Yes — full building', 'Yes — kitchen only', 'No sprinklers', 'Not sure'] },
      { id: 'max-occupancy', label: 'Desired maximum occupancy', type: 'number', placeholder: 'How many people total (staff + guests)' }
    ]
  },
  {
    id: 'sign-permit',
    name: 'Sign Permit',
    emoji: '🪧',
    agency: 'City Planning / Zoning Department',
    description: 'Required for any exterior signage, awnings, or window graphics over a certain size.',
    cost: { min: 200, max: 500 },
    timeline: '2-4 weeks (up to 2 months in historic districts)',
    required: false,
    conditions: (answers) => answers.hasSignage === 'Yes',
    rules: [
      { id: 'sign-size', condition: 'Maximum Sign Area', description: 'Sign area limits vary by zoning: commercial = typically 1 sq ft per linear foot of building frontage. Cannot exceed 100 sq ft without special permit.', grade: 'Required', citation: 'Local Sign Ordinance §17.40' },
      { id: 'sign-illumination', condition: 'Illumination Restrictions', description: 'Internally lit signs may be prohibited in residential-adjacent zones. Neon restrictions in some historic districts. No flashing or animated signs within 100ft of residential.', grade: 'Warning', citation: 'Local Sign Ordinance §17.40.060 — Illumination' }
    ],
    formFields: [
      { id: 'sign-type', label: 'Sign Type', type: 'select', options: ['Wall-mounted', 'Hanging/projecting', 'Awning/canopy', 'Freestanding/monument', 'Window graphics', 'A-frame/sidewalk', 'Multiple types'], required: true },
      { id: 'sign-illuminated', label: 'Will the sign be illuminated?', type: 'select', options: ['No', 'Yes — externally lit', 'Yes — internally lit / backlit', 'Yes — neon', 'LED / digital'] },
      { id: 'historic-district', label: 'Is the building in a historic district?', type: 'select', options: ['No', 'Yes', 'Not sure'] }
    ]
  },
  {
    id: 'outdoor-dining',
    name: 'Outdoor Dining Permit',
    emoji: '☀️',
    agency: 'City Planning + Public Works',
    description: 'Required for sidewalk dining, patios, parklets, or any outdoor seating.',
    cost: { min: 500, max: 3000 },
    timeline: '4-8 weeks',
    required: false,
    conditions: (answers) => answers.hasOutdoor === 'Yes',
    rules: [
      { id: 'out-ada', condition: 'ADA Sidewalk Clearance', description: 'Sidewalk dining must maintain minimum 4ft clear pedestrian path (some cities require 5-6ft). Tables, chairs, barriers all count. ADA violations = federal lawsuit exposure.', grade: 'Critical', citation: 'ADA Standards §4.3 — Accessible Route; Local Sidewalk Dining Ordinance' },
      { id: 'out-barrier', condition: 'Physical Barriers Required', description: 'Most cities require physical barriers (planters, railings, stanchions) separating outdoor dining from pedestrian/vehicle traffic. If serving alcohol outdoors, barriers must fully enclose the area.', grade: 'Required', citation: 'Local Outdoor Dining Ordinance; ABC Premises Requirements' },
      { id: 'out-heater', condition: 'Patio Heater Requirements', description: 'Gas patio heaters require: fire department approval, minimum clearance from combustibles (varies by heater type), secured/weighted base to prevent tipping, no use under awnings unless rated.', grade: 'Warning', citation: 'NFPA 58 — LP-Gas Code; Local Fire Code amendments' }
    ],
    formFields: [
      { id: 'outdoor-type', label: 'Outdoor Dining Type', type: 'select', options: ['Sidewalk seating (public right-of-way)', 'Private patio (on your property)', 'Parklet (in parking spaces)', 'Rooftop', 'Combination'], required: true },
      { id: 'outdoor-seats', label: 'Number of outdoor seats', type: 'number', placeholder: 'Including bar/counter seats' },
      { id: 'outdoor-alcohol', label: 'Serve alcohol outdoors?', type: 'select', options: ['No', 'Yes', 'Not sure yet'] },
      { id: 'outdoor-heaters', label: 'Patio heaters?', type: 'select', options: ['No', 'Yes — gas/propane', 'Yes — electric', 'Planning to add later'] },
      { id: 'sidewalk-width', label: 'Sidewalk width (ft) if applicable', type: 'number', placeholder: 'Total width from building to curb' }
    ]
  },
  {
    id: 'building-permit',
    name: 'Building Permit (Tenant Improvement)',
    emoji: '🏗️',
    agency: 'City Building Department',
    description: 'Required for any construction, renovation, or change of use from non-restaurant to restaurant.',
    cost: { min: 1000, max: 10000 },
    timeline: '4-12 weeks',
    required: false,
    conditions: (answers) => answers.needsConstruction === 'Yes',
    rules: [
      { id: 'bp-change-use', condition: 'Change of Use/Occupancy', description: 'Converting a space to restaurant (from retail, office, etc.) triggers a change of occupancy review. May require seismic upgrade, ADA upgrade, additional exits, and sprinkler installation. This is often the most expensive surprise.', grade: 'Critical', citation: 'IBC §3408 — Change of Occupancy; ADA Title III' },
      { id: 'bp-grease-trap', condition: 'Grease Interceptor Required', description: 'All food service establishments must install a grease interceptor/trap. Size determined by fixture count and flow rate. Undersized = city fines + sewer backup. Must be accessible for cleaning.', grade: 'Required', citation: 'UPC §1014 — Grease Interceptors' },
      { id: 'bp-ventilation', condition: 'Commercial Kitchen Ventilation', description: 'Type I hood required over all grease-producing equipment (fryers, grills, ranges). CFM calculated by hood size. Makeup air system required. Full mechanical plans needed.', grade: 'Required', citation: 'IMC §507 — Commercial Kitchen Hoods' }
    ],
    formFields: [
      { id: 'previous-use', label: 'Previous use of the space', type: 'select', options: ['Restaurant (same type)', 'Restaurant (different type)', 'Retail / shop', 'Office', 'Warehouse / industrial', 'Vacant / new construction'], required: true },
      { id: 'construction-scope', label: 'Construction scope', type: 'select', options: ['Minor cosmetic (paint, fixtures)', 'New kitchen buildout', 'Full renovation / gut remodel', 'Adding square footage', 'Change of use only (no construction)'] },
      { id: 'has-grease-trap', label: 'Grease interceptor/trap?', type: 'select', options: ['Yes — existing, correctly sized', 'Yes — existing, may be undersized', 'No — need to install', 'Not sure'] },
      { id: 'ada-compliant', label: 'Is the space currently ADA compliant?', type: 'select', options: ['Yes', 'No', 'Partially', 'Not sure'] }
    ]
  },
  {
    id: 'music-permit',
    name: 'Entertainment / Music Permit',
    emoji: '🎵',
    agency: 'City Clerk / Entertainment Commission',
    description: 'Required for live music, DJ, karaoke, TVs above a certain size, or any amplified sound.',
    cost: { min: 100, max: 1500 },
    timeline: '2-6 weeks',
    required: false,
    conditions: (answers) => answers.hasEntertainment === 'Yes',
    rules: [
      { id: 'mus-noise', condition: 'Noise Ordinance Limits', description: 'Most cities restrict noise to 60-65 dB at property line (residential areas) or 70-75 dB (commercial). Live music and amplified sound almost always require a specific entertainment permit + noise study.', grade: 'Warning', citation: 'Local Noise Ordinance; Municipal Code §10.28' },
      { id: 'mus-hours', condition: 'Entertainment Hours', description: 'Entertainment permits typically restrict amplified sound after 10 PM (residential areas) or midnight (commercial). Some cities require sound insulation assessment.', grade: 'Required', citation: 'Local Entertainment Permit Conditions' }
    ],
    formFields: [
      { id: 'entertainment-type', label: 'Type of entertainment', type: 'multiselect', options: ['Live music', 'DJ / recorded music', 'Karaoke', 'Trivia / game nights', 'TVs / sports', 'Dancing', 'Comedy / performances'], required: true },
      { id: 'entertainment-hours', label: 'Latest entertainment hours', type: 'select', options: ['Before 9 PM', '9 PM - 10 PM', '10 PM - 12 AM', 'After midnight'] },
      { id: 'near-residential', label: 'Residential buildings nearby?', type: 'select', options: ['No — commercial zone', 'Yes — adjacent', 'Yes — within 300ft', 'Mixed-use building'] }
    ]
  }
]

// Interview questions that determine which permits are needed
export const INTERVIEW_QUESTIONS = [
  {
    id: 'restaurantName',
    question: "What's the name of your restaurant?",
    subtitle: "Or what you're planning to call it",
    type: 'text',
    placeholder: 'e.g. The Golden Fork',
    required: true
  },
  {
    id: 'city',
    question: 'What city will it be in?',
    subtitle: "Permit requirements vary by city — we'll customize for yours",
    type: 'text',
    placeholder: 'e.g. San Francisco, CA',
    required: true
  },
  {
    id: 'situation',
    question: 'What best describes your situation?',
    type: 'select',
    options: [
      { value: 'opening-new', label: '🆕 Opening a brand new restaurant' },
      { value: 'taking-over', label: '🔄 Taking over an existing restaurant space' },
      { value: 'modifying', label: '🔧 Modifying my current restaurant' },
      { value: 'food-truck', label: '🚚 Starting a food truck' }
    ],
    required: true
  },
  {
    id: 'foodType',
    question: 'What type of food service?',
    type: 'select',
    options: [
      { value: 'full-service', label: '🍽️ Full-service restaurant (sit-down, table service)' },
      { value: 'fast-casual', label: '🥡 Fast casual / counter service' },
      { value: 'cafe', label: '☕ Café / coffee shop (limited food prep)' },
      { value: 'bar-food', label: '🍻 Bar with food' },
      { value: 'bakery', label: '🧁 Bakery / dessert shop' },
      { value: 'ghost-kitchen', label: '👻 Ghost kitchen / delivery only' }
    ],
    required: true
  },
  {
    id: 'servesAlcohol',
    question: 'Will you serve alcohol?',
    subtitle: 'This determines if you need a liquor license ($13,800+)',
    type: 'select',
    options: [
      { value: 'Yes', label: '🍷 Yes — beer, wine, and/or spirits' },
      { value: 'No', label: '🚫 No alcohol' },
      { value: 'Maybe', label: '🤔 Not sure yet' }
    ],
    required: true
  },
  {
    id: 'hasOutdoor',
    question: 'Will you have outdoor seating?',
    subtitle: 'Sidewalk tables, patio, parklet, rooftop — all require permits',
    type: 'select',
    options: [
      { value: 'Yes', label: '☀️ Yes — outdoor dining' },
      { value: 'No', label: '🏠 No — indoor only' },
      { value: 'Maybe', label: '🤔 Planning to add later' }
    ],
    required: true
  },
  {
    id: 'needsConstruction',
    question: 'Does the space need construction or renovation?',
    subtitle: 'Any buildout, kitchen installation, or change from non-restaurant use',
    type: 'select',
    options: [
      { value: 'Yes', label: '🏗️ Yes — significant construction needed' },
      { value: 'Minor', label: '🎨 Minor cosmetic changes only' },
      { value: 'No', label: '✅ No — turnkey restaurant space' }
    ],
    required: true
  },
  {
    id: 'hasEntertainment',
    question: 'Will you have music or entertainment?',
    subtitle: 'Live music, DJ, karaoke, even TVs in some cities',
    type: 'select',
    options: [
      { value: 'Yes', label: '🎵 Yes — live music, DJ, or performances' },
      { value: 'TVs', label: '📺 Just TVs / background music' },
      { value: 'No', label: '🔇 No entertainment' }
    ],
    required: true
  },
  {
    id: 'hasSignage',
    question: 'Will you put up exterior signage?',
    type: 'select',
    options: [
      { value: 'Yes', label: '🪧 Yes' },
      { value: 'No', label: '🚫 No (home-based / delivery only)' }
    ],
    required: true
  },
  {
    id: 'seatingCount',
    question: 'How many total seats (indoor + outdoor)?',
    subtitle: 'This affects fire code, ADA requirements, and health permit tier',
    type: 'number',
    placeholder: 'Approximate number',
    required: true
  }
]
