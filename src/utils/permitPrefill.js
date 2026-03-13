// Map Smart Start / interview answers → per-permit form pre-fills
// This runs after extraction to populate each permit's application fields

export function prefillPermitForms(answers, extractedData = {}) {
  const all = { ...answers, ...extractedData }
  const forms = {}

  // ── Business License ──
  forms['business-license'] = {}
  if (all.restaurantName) forms['business-license']['business-name'] = all.restaurantName
  if (all.entityType) forms['business-license']['entity-type'] = all.entityType
  if (all.ein) forms['business-license']['ein'] = all.ein
  if (all.ownerName) forms['business-license']['owner-name'] = all.ownerName
  if (all.address || all.city) forms['business-license']['business-address'] = all.address || all.city
  if (all.openingDate) forms['business-license']['start-date'] = all.openingDate

  // ── Health Permit ──
  forms['health-permit'] = {}
  if (all.foodType) {
    const typeMap = {
      'full-service': 'Full-service restaurant',
      'fast-casual': 'Fast casual / counter service',
      'cafe': 'Café / coffee shop (limited food prep)',
      'bar-food': 'Bar with food',
      'bakery': 'Bakery',
      'food-truck': 'Food truck / mobile',
      'ghost-kitchen': 'Ghost kitchen / delivery only'
    }
    forms['health-permit']['food-type'] = typeMap[all.foodType] || ''
  }
  if (all.seatingCount) forms['health-permit']['seating-count'] = all.seatingCount
  if (all.has3Sink) forms['health-permit']['has-3sink'] = all.has3Sink
  if (all.handwashCount) forms['health-permit']['handwash-count'] = all.handwashCount
  if (all.hoodSystem) forms['health-permit']['hood-system'] = all.hoodSystem
  if (all.floorType) forms['health-permit']['floor-type'] = all.floorType
  if (all.foodHandlerCerts) forms['health-permit']['food-handler-certs'] = all.foodHandlerCerts
  if (all.pestControl) forms['health-permit']['pest-control'] = all.pestControl

  // ── Liquor License ──
  forms['liquor-license'] = {}
  if (all.licenseType) forms['liquor-license']['license-type'] = all.licenseType
  if (all.nearSchool) forms['liquor-license']['near-school'] = all.nearSchool
  if (all.existingLicense) forms['liquor-license']['existing-license'] = all.existingLicense
  if (all.rbsTraining) forms['liquor-license']['rbs-training'] = all.rbsTraining

  // ── Fire Permit ──
  forms['fire-permit'] = {}
  if (all.totalSqft) forms['fire-permit']['total-sqft'] = all.totalSqft
  if (all.diningSqft) forms['fire-permit']['dining-sqft'] = all.diningSqft
  if (all.hoodSuppression) forms['fire-permit']['has-hood-suppression'] = all.hoodSuppression
  if (all.exitCount) forms['fire-permit']['exit-count'] = all.exitCount
  if (all.maxOccupancy || all.seatingCount) {
    forms['fire-permit']['max-occupancy'] = all.maxOccupancy || all.seatingCount
  }

  // ── Outdoor Dining ──
  forms['outdoor-dining'] = {}
  if (all.outdoorType) forms['outdoor-dining']['outdoor-type'] = all.outdoorType
  if (all.outdoorSeats) forms['outdoor-dining']['outdoor-seats'] = all.outdoorSeats
  if (all.outdoorAlcohol) forms['outdoor-dining']['outdoor-alcohol'] = all.outdoorAlcohol
  if (all.sidewalkWidth) forms['outdoor-dining']['sidewalk-width'] = all.sidewalkWidth

  // ── Building Permit ──
  forms['building-permit'] = {}
  if (all.previousUse) forms['building-permit']['previous-use'] = all.previousUse
  if (all.constructionScope) forms['building-permit']['construction-scope'] = all.constructionScope
  if (all.hasGreaseTrap) forms['building-permit']['has-grease-trap'] = all.hasGreaseTrap
  if (all.adaCompliant) forms['building-permit']['ada-compliant'] = all.adaCompliant

  // ── Sign Permit ──
  forms['sign-permit'] = {}
  if (all.signType) forms['sign-permit']['sign-type'] = all.signType
  if (all.signIlluminated) forms['sign-permit']['sign-illuminated'] = all.signIlluminated
  if (all.historicDistrict) forms['sign-permit']['historic-district'] = all.historicDistrict

  // ── Entertainment ──
  forms['music-permit'] = {}
  if (all.entertainmentType) forms['music-permit']['entertainment-type'] = all.entertainmentType
  if (all.entertainmentHours) forms['music-permit']['entertainment-hours'] = all.entertainmentHours
  if (all.nearResidential) forms['music-permit']['near-residential'] = all.nearResidential

  return forms
}

// Enhanced AI prompt that extracts BOTH interview answers AND permit form details
export const ENHANCED_EXTRACT_PROMPT = `You are PlatePass, a restaurant permit assistant. Extract ALL possible structured data from the user's input.

Extract two levels of data:

LEVEL 1 — Interview answers (determines which permits are needed):
- restaurantName, city, situation, foodType, servesAlcohol, hasOutdoor, needsConstruction, hasEntertainment, hasSignage, seatingCount

LEVEL 2 — Detailed permit form fields (pre-fills applications):
- entityType: LLC, Corporation, Sole Proprietorship, etc.
- ein: Federal EIN number
- ownerName: Owner or registered agent
- address: Full street address
- openingDate: Expected opening (MM/YYYY)
- totalSqft: Total square footage
- diningSqft: Dining area square footage
- previousUse: What the space was before (Retail, Office, Restaurant, etc.)
- constructionScope: Minor cosmetic, New kitchen buildout, Full renovation, etc.
- licenseType: Type 41, Type 47, Type 48, etc.
- nearSchool: Yes/No — is location within 600ft of school/church
- outdoorType: Sidewalk seating, Private patio, Parklet, etc.
- outdoorSeats: Number of outdoor seats
- sidewalkWidth: Sidewalk width in feet
- signType: Wall-mounted, Hanging, Awning, etc.
- historicDistrict: Yes/No
- has3Sink: Yes, No — need to install, Not sure
- hoodSystem: Yes — Type I, No hood system, etc.
- floorType: Commercial tile, Sealed concrete, etc.
- hasGreaseTrap: Yes, No — need to install, etc.
- hoodSuppression: Yes — Ansul system, No — need to install, etc.
- maxOccupancy: Desired max occupancy

Return a single flat JSON object with all extracted fields. Only include fields you can confidently extract.`
