import { derlgData, nhameyData } from './mockData.js'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`;
const allPlaces = [...derlgData, ...nhameyData]

function formatPrice(priceRange) {
    if (priceRange.min === 0 && priceRange.max === 0) return 'Free'
    if (priceRange.min === priceRange.max) return `$${priceRange.min}`
    return `$${priceRange.min}-$${priceRange.max}`
}

function getSimpleList() {
    return allPlaces.map(p => `- ${p.title} | ${p.type} | ${p.area} | ${formatPrice(p.priceRange)}`).join('\n')
}

function getFullDetails() {
    return allPlaces.map(p => `- ${p.title} | ${p.type} | ${p.area} | ${formatPrice(p.priceRange)} | ${p.hours} | ${p.description}`).join('\n')
}

async function callGemini(systemPrompt, userMessage) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        })
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Gemini API error: ${res.status} - ${err}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No response from Gemini')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON from Gemini')

    return JSON.parse(jsonMatch[0])
}

export async function generatePlan(userText) {
    const simpleList = getSimpleList()

    const step1Prompt = `You are a travel planner for Phnom Penh, Cambodia. Pick 3 places from this list based on the user's request. Return ONLY valid JSON like: {"picks": [{"place": "Place Name", "time": "HH:MM"}]}

Places:
${simpleList}

Rules:
- Pick exactly 3 places unless user specifies otherwise
- Stay within the user's budget (add up place prices to check)
- Match the user's preferences (time, area, activity type)
- Use exact place names from the list
- Times should be in 24h format HH:MM`

    const step1Result = await callGemini(step1Prompt, userText)

    const picks = step1Result.picks
    const fullDetails = getFullDetails()

    const step2Prompt = `You are a travel planner. Format this itinerary. Return ONLY valid JSON: {"stops": [{"place": "Name", "time": "HH:MM", "reasoning": "why this place", "match": 95}], "mood": "chill", "budget": 20, "groupSize": 2, "duration": 4, "startTime": 14}

Place details:
${fullDetails}

Rules:
- Use exact place names from the details above
- match should be 85-99
- mood should be one of: study, chill, explore, date, group
- reasoning should be 1 sentence max
- Extract budget (number in USD), groupSize (number of people), duration (hours), and startTime (hour in 24h) from the user's request
- If user doesn't specify, use sensible defaults (budget: 20, groupSize: 2, duration: 4, startTime: 14)
- Return these as top-level fields in the JSON

Selections: ${JSON.stringify(picks)}`

    const step2Result = await callGemini(step2Prompt, userText)

    const usedTitles = new Set(step2Result.stops.map(s => s.place))
    const suggestedPool = allPlaces.filter(p => !usedTitles.has(p.title))

    const enrichedStops = enrichStops(step2Result.stops)
    const { totalCostMin, totalCostMax } = calcTotalCost(step2Result.stops)

    return {
        stops: enrichedStops,
        suggestedPool,
        mood: step2Result.mood || 'chill',
        totalCost: totalCostMin === totalCostMax
            ? `$${totalCostMin}`
            : `$${totalCostMin}-$${totalCostMax}`,
        groupSize: step2Result.groupSize || 2,
        duration: step2Result.duration || 4,
        startTime: step2Result.startTime || 14
    }
}

function enrichStops(stops) {
    return stops.map(stop => {
        const place = allPlaces.find(p => p.title === stop.place)
        return {
            ...stop,
            image: place?.image || '',
            description: place?.description || '',
            cost: place ? formatPrice(place.priceRange) : '$0'
        }
    })
}

function calcTotalCost(stops) {
    const totalCostMin = stops.reduce((sum, s) => {
        const place = allPlaces.find(p => p.title === s.place)
        return sum + (place?.priceRange.min || 0)
    }, 0)
    const totalCostMax = stops.reduce((sum, s) => {
        const place = allPlaces.find(p => p.title === s.place)
        return sum + (place?.priceRange.max || 0)
    }, 0)
    return { totalCostMin, totalCostMax }
}

export async function generatePlanFromForm(formData) {
    const prompt = `Budget $${formData.budget || 20}, group of ${formData.groupSize || 2}, ${formData.duration || 4} hours, starting at ${formData.startTime || '14:00'}.
Category: ${formData.category || 'both'}. Tvrean: ${formData.tvrean || 'none'}. Area: ${formData.area || 'any'}. Mood: ${formData.mood || 'chill'}.`

    return generatePlan(prompt)
}

export async function generateFromAnchors(anchors) {
    const simpleList = getSimpleList()

    const anchorsText = anchors.map(a => {
        let desc = `${a.time}: ${a.category}`
        if (a.tvrean && a.tvrean !== 'none') desc += ` (${a.tvrean})`
        if (a.area) desc += ` in ${a.area}`
        return `- ${desc}`
    }).join('\n')

    const prompt = `You are a travel planner for Phnom Penh, Cambodia. For each anchor below, pick ONE place from the list that best matches. Return ONLY valid JSON: {"stops": [{"place": "Name", "time": "HH:MM", "reasoning": "why", "match": 95}]}

Places:
${simpleList}

Anchors:
${anchorsText}

Rules:
- Pick exactly one place per anchor
- Match the category (nhamey=restaurant, derlg=arcade/park/cafe, tvrean=cafe)
- Match the area if specified
- Stay within budget if mentioned
- Use exact place names from the list
- reasoning should be 1 sentence max
- match should be 85-99`

    const result = await callGemini(prompt, anchorsText)
    const enrichedStops = enrichStops(result.stops || [])
    const { totalCostMin, totalCostMax } = calcTotalCost(result.stops || [])

    const usedTitles = new Set((result.stops || []).map(s => s.place))
    const suggestedPool = allPlaces.filter(p => !usedTitles.has(p.title))

    return {
        stops: enrichedStops,
        suggestedPool,
        mood: 'chill',
        totalCost: totalCostMin === totalCostMax
            ? `$${totalCostMin}`
            : `$${totalCostMin}-$${totalCostMax}`,
        groupSize: 2,
        duration: 4,
        startTime: anchors[0]?.time ? parseInt(anchors[0].time) : 14
    }
}
