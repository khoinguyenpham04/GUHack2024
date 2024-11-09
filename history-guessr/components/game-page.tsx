"use client"

import { useState, useRef, useEffect } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Image from "next/image"
import { Card } from "@/components/ui/card"

// Replace with your actual token
mapboxgl.accessToken = "pk.eyJ1Ijoia2hvbmd1eWVucGhhbSIsImEiOiJjbTNhaDY1dmQxOXN6MmxyNjZheW91NjM0In0.3zt1-I2kEcZ2plvSktUkoA"

export function GamePage() {
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [year, setYear] = useState(1962)
  const [lng, setLng] = useState(-70.9)
  const [lat, setLat] = useState(42.35)
  const [zoom, setZoom] = useState(3)

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once and ensure container exists
    
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Update state on map move
    map.current.on('move', () => {
      if (!map.current) return;
      
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });

    // Cleanup function to remove map on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  return (
    <div className="min-h-screen grid grid-cols-2 gap-4 p-4">
      {/* Left side - Historical Image */}
      <div className="relative">
        <Card className="h-full overflow-hidden">
          <div className="relative aspect-video w-full">
            <Image
              src="/Coldwar.jpeg"
              alt="Historical photograph"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round 1/5</div>
              <div className="text-lg">Score: 0</div>
            </div>
            <button className="w-full h-[44px] bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 backdrop-blur-sm text-[17px]">
              Submit Guess
            </button>
          </div>
        </Card>
      </div>
      
      {/* Right side - Map and Slider */}
      <div className="relative flex flex-col gap-4">
        <div ref={mapContainer} className="flex-1 rounded-lg overflow-hidden" />
        <input
          type="range"
          min="1900"
          max="2024"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold">
          Year: {year}
        </div>
      </div>
    </div>
  )
} 