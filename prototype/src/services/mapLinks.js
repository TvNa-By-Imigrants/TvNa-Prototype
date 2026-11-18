export function goNowLink(placeName) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeName)}&travelmode=driving`
}

export function goNowWithStops(stops) {
    const [destination, ...waypoints] = stops.map(s => s.place || s)
    const base = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    const wp = waypoints.length ? `&waypoints=${waypoints.map(s => encodeURIComponent(s)).join('%7C')}` : ''
    return `${base}${wp}&travelmode=driving`
}
