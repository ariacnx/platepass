// Check if an address is within 600ft (183m) of schools, churches, or playgrounds
// Uses OpenStreetMap Nominatim (geocoding) + Overpass API (nearby search)

export async function checkProximity(address) {
  try {
    // Step 1: Geocode the address
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    const geoRes = await fetch(geocodeUrl, {
      headers: { 'User-Agent': 'PlatePass/1.0 (hackathon demo)' }
    })
    const geoData = await geoRes.json()
    
    if (!geoData.length) {
      return { status: 'error', message: 'Could not find address. Please check and try again.' }
    }

    const { lat, lon } = geoData[0]
    const radiusMeters = 183 // 600 feet = ~183 meters

    // Step 2: Query Overpass API for schools, churches, playgrounds within 600ft
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="school"](around:${radiusMeters},${lat},${lon});
        way["amenity"="school"](around:${radiusMeters},${lat},${lon});
        node["amenity"="place_of_worship"](around:${radiusMeters},${lat},${lon});
        way["amenity"="place_of_worship"](around:${radiusMeters},${lat},${lon});
        node["leisure"="playground"](around:${radiusMeters},${lat},${lon});
        way["leisure"="playground"](around:${radiusMeters},${lat},${lon});
        node["amenity"="kindergarten"](around:${radiusMeters},${lat},${lon});
        way["amenity"="kindergarten"](around:${radiusMeters},${lat},${lon});
      );
      out body;
    `

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    const ovRes = await fetch(overpassUrl)
    const ovData = await ovRes.json()

    const nearby = ovData.elements || []

    if (nearby.length === 0) {
      return {
        status: 'clear',
        lat,
        lon,
        message: `No schools, churches, or playgrounds found within 600ft of ${address}. You're clear to apply.`,
        nearby: []
      }
    }

    // Format results
    const found = nearby.map(el => {
      const name = el.tags?.name || 'Unnamed'
      const type = el.tags?.amenity === 'school' ? '🏫 School'
        : el.tags?.amenity === 'kindergarten' ? '🏫 Kindergarten'
        : el.tags?.amenity === 'place_of_worship' ? '⛪ Church/Worship'
        : el.tags?.leisure === 'playground' ? '🛝 Playground'
        : '📍 Facility'

      // Calculate approximate distance
      let dist = null
      if (el.lat && el.lon) {
        dist = haversineDistance(lat, lon, el.lat, el.lon)
      }

      return { name, type, distance: dist ? `~${Math.round(dist)}ft` : 'within 600ft' }
    })

    // Deduplicate by name
    const unique = []
    const seen = new Set()
    for (const f of found) {
      const key = f.name + f.type
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(f)
      }
    }

    return {
      status: 'warning',
      lat,
      lon,
      message: `⚠️ Found ${unique.length} school/church/playground within 600ft. Liquor license may be DENIED.`,
      nearby: unique
    }
  } catch (e) {
    console.error('Proximity check failed:', e)
    return { status: 'error', message: 'Proximity check failed. Please verify manually.' }
  }
}

// Haversine distance in feet
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 20902231 // Earth radius in feet
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
