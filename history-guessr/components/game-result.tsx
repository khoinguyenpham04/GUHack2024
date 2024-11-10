'use client';
import { HistoricEvent } from '@/party/data';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PartySocket from 'partysocket';
import { haversineDistance } from '@/party/utils';

mapboxgl.accessToken = "pk.eyJ1Ijoia2hvbmd1eWVucGhhbSIsImEiOiJjbTNhaDY1dmQxOXN6MmxyNjZheW91NjM0In0.3zt1-I2kEcZ2plvSktUkoA";

interface GameResultProps {
  gameSocket: PartySocket;
  historicEvent: HistoricEvent;
  guessLng: number;
  guessLat: number;
  guessYear: number;
  year: number;
  location: number;
  total: number;
  
}

// Function to calculate the distance using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export default function ClientResultPage({
  gameSocket,
  historicEvent,
  guessLng,
  guessLat,
  year,
  location,
  total,
  guessYear
}: GameResultProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const guess = [guessLng, guessLat] as [number, number];
  const actualLocation = [historicEvent.long, historicEvent.lat] as [number, number];
  const GuessYear = guessYear

  const distance = Math.round(haversineDistance(historicEvent.lat, historicEvent.long, guessLat, guessLng));
  const yearDifference = Math.abs((GuessYear || 0) - historicEvent.year);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: actualLocation, // Center of US
      zoom: 3
    });

    const guessMarker = new mapboxgl.Marker({ color: '#3B82F6' })
      .setLngLat(guess)
      .addTo(map.current);

    const actualMarker = new mapboxgl.Marker({ color: '#E57373' })
      .setLngLat(actualLocation)
      .addTo(map.current);

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [guess, actualLocation]
          }
        }
      });

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
      });
    });

    return () => map.current?.remove();
  }, [guess, actualLocation, guessYear]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Historic Event Details */}
        <Card className="overflow-hidden bg-gray-800 border-gray-700 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="text-sm text-white text-muted-foreground">
              {historicEvent.desc}
            </div>
            <h1 className="text-2xl font-bold text-blue-500">
              {historicEvent.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                {historicEvent.year}
              </div>
              <div className="text-xl text-white">You were {yearDifference} years off</div>
            </div>
            <img
              src={historicEvent.img}
              alt={historicEvent.name}
              className="w-full rounded-lg"
            />
            <div className="text-xl text-white">
              Your guess was <span className="text-blue-500">{distance}</span> from the correct location
            </div>
          </CardContent>
        </Card>

        {/* Right side - Map and Score */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-gray-800 border-gray-700 shadow-xl">
            <CardContent className="p-0">
              <div ref={mapContainer} className="h-[400px] md:h-[500px] rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg text-white font-semibold">Year</div>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                    {year}
                  </div>
                  <div className="text-sm text-muted-foreground">/5000</div>
                </div>
                <div>
                  <div className="text-lg text-white font-semibold">Location</div>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                    {location}
                  </div>
                  <div className="text-sm text-muted-foreground">/5000</div>
                </div>
                <div>
                  <div className="text-lg  text-white font-semibold">Total</div>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md">
                    {total}
                  </div>
                  <div className="text-sm text-muted-foreground">/10000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}