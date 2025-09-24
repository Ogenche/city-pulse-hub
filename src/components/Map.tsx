import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchEvents } from '../services/ticketmaster';
import { type Event } from '../types/events';

export const Map = () => {
  const { coordinates, loading: isGeolocating, error: geolocError } = useGeolocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // This useEffect triggers the event fetching process whenever the user's coordinates change.
  useEffect(() => {
    // Only fetch events if we have valid coordinates.
    if (coordinates) {
      setIsLoadingEvents(true);
      fetchEvents(coordinates.lat, coordinates.lng)
        .then(fetchedEvents => {
          setEvents(fetchedEvents);
        })
        .catch(error => {
          console.error("Failed to load events:", error);
          // Optionally set an error state to show in the UI
        })
        .finally(() => {
          setIsLoadingEvents(false);
        });
    }
  }, [coordinates]); // Dependency array: this effect re-runs when 'coordinates' changes.

  // The main loading screen for initial geolocation.
  if (isGeolocating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-xl">Fetching your location...</p>
      </div>
    );
  }

  if (!coordinates) {
     return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-xl text-red-500">Could not determine location.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      {/* --- UI Feedback Overlays --- */}
      {geolocError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black p-2 rounded-lg z-[1000] text-sm shadow-lg">
          Could not fetch your precise location. Showing map for central London.
        </div>
      )}
      {isLoadingEvents && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-2 rounded-lg z-[1000] text-sm shadow-lg animate-pulse">
          Loading nearby events...
        </div>
      )}

      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* --- User Location Marker --- */}
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>You are here.</Popup>
        </Marker>

        {/* --- Event Markers --- */}
        {events.map(event => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
          >
            <Popup>
              <div className="w-48">
                <img src={event.imageUrl} alt={event.name} className="w-full h-24 object-cover rounded-md mb-2" />
                <h3 className="font-bold text-base mb-1">{event.name}</h3>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Ticketmaster
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};