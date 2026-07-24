import json
import httpx
from typing import Dict, Any
from backend.core.state import redis_client

WEATHER_CACHE_TTL = 3600  # 1 hour in seconds

async def fetch_openmeteo_weather(lat: float, lng: float) -> Dict[str, Any]:
    """
    OpenMeteo API — free, no API key required.
    Fetches real-time temperature and precipitation.
    """
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "current": ["temperature_2m", "precipitation"],
                    "forecast_days": 1
                },
                timeout=5.0
            )
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                return {
                    "temperature_2m": current.get("temperature_2m", 30.0),
                    "precipitation": current.get("precipitation", 0.0),
                    "is_live": True
                }
    except Exception as e:
        print(f"[OpenMeteo Weather] API call failed: {e}")
    
    # Sensible fallback for Bhubaneswar coordinates if offline
    return {
        "temperature_2m": 30.5,
        "precipitation": 0.0,
        "is_live": False
    }

async def get_cached_weather(lat: float, lng: float) -> Dict[str, Any]:
    """
    Retrieves weather from Redis cache if present, otherwise fetches live from OpenMeteo.
    """
    cache_key = f"weather:{round(lat, 2)}:{round(lng, 2)}"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    weather = await fetch_openmeteo_weather(lat, lng)

    if redis_client and weather:
        try:
            redis_client.setex(cache_key, WEATHER_CACHE_TTL, json.dumps(weather))
        except Exception:
            pass

    return weather
