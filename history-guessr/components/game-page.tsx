
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
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [year, setYear] = useState(1962)
  const [lng, setLng] = useState(-70.9)
  const [lat, setLat] = useState(42.35)
  const [zoom, setZoom] = useState(3)
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lng: number, lat: number } | null>(null)
  const validImageUrl = typeof imageUrl === "string" && imageUrl.trim() !== "";

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

    // Add click handler to map
    map.current.on('click', (e) => {
      // First, remove any existing marker and clean up state
      if (marker) {
        marker.remove();
        setMarker(null);
        setMarkerPosition(null);
      }

      // Create new marker after a short delay to ensure cleanup is complete
      setTimeout(() => {
        const newMarker = new mapboxgl.Marker({
          color: "#FF0000",
          draggable: true
        })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current!);

        // Update marker position state
        setMarkerPosition({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat
        });

        // Add dragend event listener to marker
        newMarker.on('dragend', () => {
          const position = newMarker.getLngLat();
          setMarkerPosition({
            lng: position.lng,
            lat: position.lat
          });
        });

        // Store the new marker in state
        setMarker(newMarker);
      }, 0);
    });

    // Cleanup function to remove map on unmount
    return () => {
      if (marker) {
        marker.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  // First, add a function to handle marker removal
  const removeMarker = () => {
    if (marker) {
      marker.remove();
      setMarker(null);
      setMarkerPosition(null);
    }
  };

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
            <button className="w-full h-[44px] bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 backdrop-blur-sm text-[17px]">
              Submit Guess
            </button>
          </div>
        </Card>
      </div>

      {/* Right side - Map and Slider */}
      <div className="relative flex flex-col gap-4">
        <div ref={mapContainer} className="flex-1 rounded-lg overflow-hidden" />

        {/* Show marker position and remove button when marker exists */}
        {markerPosition && (
          <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-md shadow-md space-y-2">
            <p className="text-sm font-mono">
              Marker position: {markerPosition.lng.toFixed(4)}, {markerPosition.lat.toFixed(4)}
            </p>
            <button
              onClick={removeMarker}
              className="w-full px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Remove Marker
            </button>
          </div>
        )}

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