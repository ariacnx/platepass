// Map Smart Start / interview answers → per-permit form pre-fills
// Field IDs must exactly match permitDatabase.js formFields[].id

import { INTERVIEW_QUESTIONS } from '../data/permitDatabase'

export function prefillPermitForms(answers, extractedData = {}) {
  const d = { ...answers, ...extractedData }
  const forms = {}

  // ── Business License ──
  forms['business-license'] = {}
  if (d.restaurantName) forms['business-license']['business-name'] = d.restaurantName
  if (d.entityType) forms['business-license']['entity-type'] = d.entityType
  if (d.ein) forms['business-license']['ein'] = d.ein
  if (d.ownerName) forms['business-license']['owner-name'] = d.ownerName
  if (d.address || d.city) forms['business-license']['business-address'] = d.address || d.city
  if (d.openingDate) forms['business-license']['start-date'] = d.openingDate

  // ── Health Permit ──
  forms['health-permit'] = {}
  if (d.foodType) {
    const typeMap = {
      'full-service': 'Full-service restaurant',
      'fast-casual': 'Fast casual / counter service',
      'cafe': 'Café / coffee shop (limited food prep)',
      'bar-food': 'Bar with food',
      'bakery': 'Bakery',
      'food-truck': 'Food truck / mobile',
      'ghost-kitchen': 'Ghost kitchen / delivery only'
    }
    forms['health-permit']['food-type'] = typeMap[d.foodType] || d.foodType
  }
  if (d.seatingCount) forms['health-permit']['seating-count'] = d.seatingCount
  if (d.has3Sink) forms['health-permit']['has-3sink'] = d.has3Sink
  if (d.handwashCount) forms['health-permit']['handwash-count'] = d.handwashCount
  if (d.hoodSystem) forms['health-permit']['hood-system'] = d.hoodSystem
  if (d.floorType) forms['health-permit']['floor-type'] = d.floorType
  if (d.foodHandlerCerts) forms['health-permit']['food-handler-certs'] = d.foodHandlerCerts
  if (d.pestControl) forms['health-permit']['pest-control'] = d.pestControl

  // ── Liquor License ──
  forms['liquor-license'] = {}
  if (d.licenseType) forms['liquor-license']['license-type'] = d.licenseType
  if (d.nearSchool) forms['liquor-license']['near-school'] = d.nearSchool
  if (d.existingLicense) forms['liquor-license']['existing-license'] = d.existingLicense
  if (d.rbsTraining) forms['liquor-license']['rbs-training'] = d.rbsTraining
  if (d.barPercentage) forms['liquor-license']['bar-percentage'] = d.barPercentage
  if (d.alcoholHours) forms['liquor-license']['alcohol-hours'] = d.alcoholHours

  // ── Fire Permit ──
  forms['fire-permit'] = {}
  if (d.totalSqft) forms['fire-permit']['total-sqft'] = d.totalSqft
  if (d.diningSqft) forms['fire-permit']['dining-sqft'] = d.diningSqft
  if (d.hoodSuppression) forms['fire-permit']['has-hood-suppression'] = d.hoodSuppression
  if (d.exitCount) forms['fire-permit']['exit-count'] = d.exitCount
  if (d.hasSprinklers) forms['fire-permit']['has-sprinklers'] = d.hasSprinklers
  if (d.maxOccupancy || d.seatingCount) forms['fire-permit']['max-occupancy'] = d.maxOccupancy || d.seatingCount

  // ── Sign Permit ──
  forms['sign-permit'] = {}
  if (d.signType) forms['sign-permit']['sign-type'] = d.signType
  if (d.signIlluminated) forms['sign-permit']['sign-illuminated'] = d.signIlluminated
  if (d.historicDistrict) forms['sign-permit']['historic-district'] = d.historicDistrict

  // ── Outdoor Dining ──
  forms['outdoor-dining'] = {}
  if (d.outdoorType) forms['outdoor-dining']['outdoor-type'] = d.outdoorType
  if (d.outdoorSeats) forms['outdoor-dining']['outdoor-seats'] = d.outdoorSeats
  if (d.outdoorAlcohol) forms['outdoor-dining']['outdoor-alcohol'] = d.outdoorAlcohol
  if (d.sidewalkWidth) forms['outdoor-dining']['sidewalk-width'] = d.sidewalkWidth
  if (d.outdoorHeaters) forms['outdoor-dining']['outdoor-heaters'] = d.outdoorHeaters

  // ── Building Permit ──
  forms['building-permit'] = {}
  if (d.previousUse) forms['building-permit']['previous-use'] = d.previousUse
  if (d.constructionScope) forms['building-permit']['construction-scope'] = d.constructionScope
  if (d.hasGreaseTrap) forms['building-permit']['has-grease-trap'] = d.hasGreaseTrap
  if (d.adaCompliant) forms['building-permit']['ada-compliant'] = d.adaCompliant

  // ── Music/Entertainment Permit ──
  forms['music-permit'] = {}
  if (d.entertainmentType) forms['music-permit']['entertainment-type'] = d.entertainmentType
  if (d.entertainmentHours) forms['music-permit']['entertainment-hours'] = d.entertainmentHours
  if (d.nearResidential) forms['music-permit']['near-residential'] = d.nearResidential

  return forms
}

// Enhanced AI prompt that extracts BOTH interview answers AND permit form details
export const ENHANCED_EXTRACT_PROMPT = `You are PlatePass, a restaurant permit assistant. Extract ALL possible structured data from the user's input.

Extract two levels of data:

LEVEL 1 — Interview answers (determines which permits are needed):
- restaurantName, city, situation, foodType, servesAlcohol, hasOutdoor, needsConstruction, hasEntertainment, hasSignage, seatingCount

LEVEL 2 — Detailed permit form fields (pre-fills applications):
- entityType: "LLC", "Corporation (S-Corp)", "Corporation (C-Corp)", "Sole Proprietorship", "Partnership", "Not formed yet"
- ein: Federal EIN number (XX-XXXXXXX)
- ownerName: Owner or registered agent name
- address: Full street address of the restaurant
- openingDate: Expected opening (MM/YYYY)
- totalSqft: Total square footage (number)
- diningSqft: Dining area square footage (number)
- previousUse: "Restaurant (same type)", "Restaurant (different type)", "Retail / shop", "Office", "Warehouse / industrial", "Vacant / new construction"
- constructionScope: "Minor cosmetic (paint, fixtures)", "New kitchen buildout", "Full renovation / gut remodel", "Adding square footage", "Change of use only (no construction)"
- licenseType: "Type 41 — Beer & Wine (with meals)", "Type 47 — Full Liquor (with meals)", "Type 48 — Full Liquor (bar, no food req)", "Not sure which type"
- nearSchool: "Yes", "No", "Not sure — need to measure"
- existingLicense: "No — new license", "Yes — buying from previous tenant", "Yes — buying from another location"
- outdoorType: "Sidewalk seating (public right-of-way)", "Private patio (on your property)", "Parklet (in parking spaces)", "Rooftop", "Combination"
- outdoorSeats: Number of outdoor seats (number)
- sidewalkWidth: Sidewalk width in feet (number)
- outdoorAlcohol: "Yes", "No", "Not sure yet"
- signType: "Wall-mounted", "Hanging/projecting", "Awning/canopy", "Freestanding/monument", "Window graphics", "A-frame/sidewalk", "Multiple types"
- signIlluminated: "No", "Yes — externally lit", "Yes — internally lit / backlit", "Yes — neon", "LED / digital"
- historicDistrict: "Yes", "No", "Not sure"
- has3Sink: "Yes", "No — need to install", "Not sure", "Using commercial dishwasher only"
- hoodSystem: "Yes — Type I (grease) hood installed", "Yes — Type II (steam/heat) only", "No hood system", "Not sure what type"
- hoodSuppression: "Yes — Ansul/wet chemical system installed", "No — need to install", "Not sure", "No cooking (café/bar only)"
- floorType: "Commercial tile (non-slip)", "Sealed concrete", "VCT (vinyl composite tile)", "Carpet", "Hardwood", "Other / Not renovated yet"
- hasGreaseTrap: "Yes — existing, correctly sized", "Yes — existing, may be undersized", "No — need to install", "Not sure"
- adaCompliant: "Yes", "No", "Partially", "Not sure"
- maxOccupancy: Desired max occupancy (number)
- exitCount: Number of emergency exits (number)
- entertainmentType: Array of strings from ["Live music", "DJ / recorded music", "Karaoke", "Trivia / game nights", "TVs / sports", "Dancing", "Comedy / performances"]
- entertainmentHours: "Before 9 PM", "9 PM - 10 PM", "10 PM - 12 AM", "After midnight"
- nearResidential: "No — commercial zone", "Yes — adjacent", "Yes — within 300ft", "Mixed-use building"

Return a single flat JSON object with all extracted fields. Use EXACT option strings from the lists above for select fields. Only include fields you can confidently extract.`
