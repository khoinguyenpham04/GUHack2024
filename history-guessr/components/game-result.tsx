'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Note: Replace with your Mapbox token
mapboxgl.accessToken = "pk.eyJ1Ijoia2hvbmd1eWVucGhhbSIsImEiOiJjbTNhaDY1dmQxOXN6MmxyNjZheW91NjM0In0.3zt1-I2kEcZ2plvSktUkoA"

interface GameResultProps {
  historicalEvent: {
    title: string
    year: number
    description: string
    imageUrl: string
    location: [number, number]
  }
  guess: [number, number]
  scores: {
    year: number
    location: number
    total: number
  }
  onNextRound: () => void
}

export function GameResult({
  historicalEvent = {
    title: "President Barack Obama signing a bill to award a Congressional Gold Medal to Women Airforce Service Pilots",
    year: 2009,
    description: "Obama White House Archived from Washington, DC, Public domain, via Wikimedia Commons",
    imageUrl: "public/Coldwar.jpeg?height=600&width=800",
    location: [-77.0365, 38.8977] // Washington DC coordinates
  },
  guess = [-87.6298, 41.8781], // Chicago coordinates
  scores = {
    year: 1000,
    location: 1827,
    total: 2827
  },
  onNextRound = () => console.log("Next round clicked")
}: GameResultProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3
    })

    // Add markers and line
    const guessMarker = new mapboxgl.Marker({ color: '#3B82F6' })
      .setLngLat(guess)
      .addTo(map.current)

    const actualMarker = new mapboxgl.Marker({ color: '#E57373' })
      .setLngLat(historicalEvent.location)
      .addTo(map.current)

    map.current.on('load', () => {
      if (!map.current) return
      
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [guess, historicalEvent.location]
          }
        }
      })

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      })
    })

    return () => map.current?.remove()
  }, [guess, historicalEvent.location])

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Card className="p-6 bg-[#faf9f6]">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {historicalEvent.description}
            </div>
            <h1 className="text-2xl font-bold text-blue-500">
              {historicalEvent.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                {historicalEvent.year}
              </div>
              <div className="text-xl">You were 18 years off</div>
            </div>
            <div ref={mapContainer} className="h-[300px] rounded-lg overflow-hidden" />
            <div className="text-xl">
              Your guess was <span className="text-blue-500">1255.0 miles</span> from the correct location
            </div>
          </div>
          
          <div className="space-y-4">
            <img
              src={historicalEvent.imageUrl}
              alt={historicalEvent.title}
              className="w-full rounded-lg"
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">Year</div>
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                  {scores.year}
                </div>
                <div className="text-sm text-muted-foreground">/5000</div>
              </div>
              <div>
                <div className="text-lg font-semibold">Location</div>
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                  {scores.location}
                </div>
                <div className="text-sm text-muted-foreground">/5000</div>
              </div>
              <div>
                <div className="text-lg font-semibold">Total</div>
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                  {scores.total}
                </div>
                <div className="text-sm text-muted-foreground">/10000</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={onNextRound}
                className="w-full h-[44px] bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 backdrop-blur-sm text-[17px]"
              >
                Next Round
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}