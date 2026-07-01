import { useWeather } from '../hooks/useWeather'
import './WeatherQuoteHeader.css'

const CONDITION_ICON = {
  'Clear': '☀️',
  'Partly Cloudy': '⛅',
  'Cloudy': '☁️',
  'Foggy': '🌫️',
  'Rainy': '🌧️',
  'Snowy': '❄️',
  'Showers': '🌦️',
  'Stormy': '⛈️',
}

export default function WeatherQuoteHeader({ quote }) {
  const weather = useWeather()

  return (
    <div className="wqh-banner">
      {quote && (
        <p className="wqh-quote">“ {quote.text} <span className="wqh-quote-author">{quote.author}</span></p>
      )}
      <div className="wqh-weather-row">
        <span className="wqh-weather-icon">{weather ? (CONDITION_ICON[weather.condition] || '🌤️') : '…'}</span>
        <div className="wqh-weather-main">
          <span className="wqh-weather-location">{weather?.location || 'Weather'}</span>
          <span className="wqh-weather-condition">{weather?.condition || 'Loading…'}</span>
        </div>
        {weather && (
          <div className="wqh-weather-temps">
            <span>Current {weather.tempF} °F</span>
            <span>High {weather.high} °F</span>
            <span>Low {weather.low} °F</span>
          </div>
        )}
      </div>
    </div>
  )
}
