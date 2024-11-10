
import { useState, useRef, useEffect } from "react"
import mapboxgl, { Marker } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Image from "next/image"
import { Card } from "@/components/ui/card"
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
    <div className="min-h-screen grid grid-cols-2 gap-4 p-4">
      {/* Left side - Historical Image */}
      <div className="relative">
        <Card className="h-full overflow-hidden">
          <div className="relative aspect-video w-full">
            {validImageUrl ? (
              <img
                src={imageUrl}
                alt="Quiz question image"
                className="rounded-lg object-cover shadow-md"
                width={600}
                height={400}
              />
            ) : (
              <p className="text-gray-500">Image not available</p>
            )}

          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round 1/5</div>
              <div className="text-lg">Score: 0</div>
            </div>
            <button onClick={handleSubmit} className="w-full h-[44px] bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 backdrop-blur-sm text-[17px]">
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