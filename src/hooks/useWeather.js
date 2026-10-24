import { useState, useEffect } from 'react'

// Today's weather for the planner header, from Open-Meteo (free, no key).
// Defaults to Los Angeles; the page never asks for the browser's location.
const PLACE = { name: 'Los Angeles', lat: 34.05, lon: -118.24 }

// WMO weather codes → a short label and which icon to draw
export function describeWeather(code) {
  if (code === 0) return { label: 'Clear', icon: 'sun' }
  if (code <= 2) return { label: 'Partly Cloudy', icon: 'partly' }
  if (code === 3) return { label: 'Overcast', icon: 'cloud' }
  if (code <= 48) return { label: 'Fog', icon: 'cloud' }
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Rain', icon: 'rain' }
  if (code <= 77 || code === 85 || code === 86) return { label: 'Snow', icon: 'snow' }
  return { label: 'Thunderstorms', icon: 'rain' }
}

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${PLACE.lat}&longitude=${PLACE.lon}`
      + '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min'
      + '&temperature_unit=fahrenheit&timezone=auto&forecast_days=1'
    let alive = true
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (!alive || !d?.current) return
        setWeather({
          place: PLACE.name,
          current: Math.round(d.current.temperature_2m),
          high: Math.round(d.daily.temperature_2m_max[0]),
          low: Math.round(d.daily.temperature_2m_min[0]),
          ...describeWeather(d.current.weather_code),
        })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  return weather
}
