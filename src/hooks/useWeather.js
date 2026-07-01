import { useState, useEffect } from 'react'

// Los Angeles, to match the PISO 13 planner's weather widget.
const LAT = 34.0522
const LON = -118.2437
const LOCATION = 'Los Angeles'

// WMO weather codes -> short label (https://open-meteo.com/en/docs)
function codeToCondition(code) {
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Partly Cloudy'
  if (code === 3) return 'Cloudy'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 67) return 'Rainy'
  if (code >= 71 && code <= 77) return 'Snowy'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 95) return 'Stormy'
  return 'Cloudy'
}

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (cancelled || !data?.current) return
        setWeather({
          location: LOCATION,
          tempF: Math.round(data.current.temperature_2m),
          high: Math.round(data.daily?.temperature_2m_max?.[0]),
          low: Math.round(data.daily?.temperature_2m_min?.[0]),
          condition: codeToCondition(data.current.weather_code),
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return weather
}
