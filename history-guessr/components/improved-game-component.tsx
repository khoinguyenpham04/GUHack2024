"use client"

import { useState, useRef, useEffect } from "react"
import mapboxgl, { Marker } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import PartySocket from "partysocket"

// Replace with your actual token
mapboxgl.accessToken = "pk.eyJ1Ijoia2hvbmd1eWVucGhhbSIsImEiOiJjbTNhaDY1dmQxOXN6MmxyNjZheW91NjM0In0.3zt1-I2kEcZ2plvSktUkoA"

interface ClientGamePageProps {
  gameSocket: PartySocket,
  imageUrl?: string | null
}

export function ClientGamePage({
  gameSocket,
  imageUrl
}: ClientGamePageProps) {
  // const mapContainer = useRef<HTMLDivElement>(null);
  // const mapContainerRef = useRef(null);
  // const mapRef = useRef<mapboxgl.Map | null>(null);
  const [year, setYear] = useState(1962);
  const [lng, setLng] = useState<number | null>(null); // Initialize as null
  const [lat, setLat] = useState<number | null>(null); // Initialize as null
  // const [zoom, setZoom] = useState(3);
  // const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lng: number, lat: number } | null>(null)
  const validImageUrl = typeof imageUrl === "string" && imageUrl.trim() !== "";
  
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const updateCoords = (lng: number, lat: number) => {
    setLng(lng)
    setLat(lat)
    console.log(lat)
  }

  const handleSubmit = () => {
    if (lng === null && lat === null) {
      setLat(0)
      setLng(0)
    } 
    gameSocket.send(JSON.stringify({ type: "GUESS", answer:{lat:lat, long:lng, year:year}}))
  };
 
  useEffect(() => {
    // Wait for the page and container to load before initializing the map
    const handlePageLoad = () => {
      if (!mapContainer.current) return;

      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 0],
        zoom: 2,
        maxZoom: 15,
      });

      // Add zoom controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Wait for the map to fully load before adding markers or other interactions
      map.current.on("load", () => {
        // Function to add or move the marker on map click
        const addMarker = (event: mapboxgl.MapMouseEvent) => {
          const coordinates = event.lngLat;

          // If marker doesn't exist, create one. Otherwise, move it to the new position
          if (!marker.current) {
            marker.current = new mapboxgl.Marker({ color: "#FF0000" })
              .setLngLat(coordinates)
              .addTo(map.current!);
          } else {
            marker.current.setLngLat(coordinates);
          }

          // Update states with the marker's current position
          setLng(coordinates.lng);
          setLat(coordinates.lat);
          setMarkerPosition({ lng: coordinates.lng, lat: coordinates.lat });

        };

        // Attach the click event to the map
        map.current?.on("click", addMarker);
      });
    };

    // Wait for the document to fully load before proceeding
    if (document.readyState === "complete") {
      handlePageLoad();
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("load", handlePageLoad);
      if (map.current) map.current.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Historical Image */}
        <Card className="overflow-hidden bg-gray-800 border-gray-700 shadow-xl">
          <CardContent className="p-0">
            <div className="relative aspect-video w-full">
              {validImageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Quiz question image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-700">
                  <p className="text-gray-400">Image not available</p>
                </div>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-gray-200">
                <div className="text-xl font-semibold">Round 1/5</div>
                <div className="text-xl">Score: 0</div>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                Submit Guess
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Map and Slider */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-gray-800 border-gray-700 shadow-xl">
            <CardContent className="p-0">
              <div ref={mapContainer} className="h-[400px] md:h-[500px] rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <Slider
                min={1900}
                max={2024}
                step={1}
                value={[year]}
                onValueChange={(value) => setYear(value[0])}
                className="w-full"
              />
              <div className="text-center text-xl font-semibold text-gray-200">
                Year: {year}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}