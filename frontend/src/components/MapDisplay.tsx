import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { Store, Filters, Product } from '../types';

interface MapDisplayProps {
  apiKey: string;
  filters: Filters;
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
  refreshTrigger?: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  apiKey, 
  filters, 
  selectedStore, 
  onStoreSelect,
  refreshTrigger 
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%', // Take full height of container
  };

  // Default center (e.g., center of US)
  const defaultCenter = {
    lat: 39.8283,
    lng: -98.5795,
  };

  const [currentCenter, setCurrentCenter] = useState(defaultCenter);
  const [currentZoom, setCurrentZoom] = useState(4);

  // Effect to handle selectedStore changes and focus on the map
  useEffect(() => {
    // Always close InfoWindow first
    setShowInfoWindow(false);
    
    if (selectedStore && mapRef.current) {
      const newCenter = { lat: selectedStore.latitude, lng: selectedStore.longitude };
      setCurrentCenter(newCenter);
      setCurrentZoom(15); // Zoom in closer when a store is selected
      
      // Pan to the selected store with animation
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(15);
      
      // Show InfoWindow after a brief delay to ensure clean transition
      setTimeout(() => {
        setShowInfoWindow(true);
      }, 100);
    }
  }, [selectedStore]);

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.state) params.append('state', filters.state);
        if (filters.city) params.append('city', filters.city);
        if (filters.selectedProductIds.length > 0) {
          params.append('productIds', filters.selectedProductIds.join(','));
        }

        const response = await axios.get<Store[]>('/api/stores', { params });
        setStores(response.data);

        // Adjust map center and zoom based on fetched stores (only if no store is selected)
        if (!selectedStore && response.data.length > 0) {
          // If only one store, center on it
          if (response.data.length === 1) {
            setCurrentCenter({ lat: response.data[0].latitude, lng: response.data[0].longitude });
            setCurrentZoom(12); // Zoom in closer for a single store
          } else {
            // Multiple stores: calculate bounds or center on first result for simplicity
            setCurrentCenter({ lat: response.data[0].latitude, lng: response.data[0].longitude });
            setCurrentZoom(filters.city ? 10 : (filters.state ? 7 : 4)); // Zoom based on filter specificity
          }
        } else if (!selectedStore && response.data.length === 0) {
          // No stores found, reset to default view
          setCurrentCenter(defaultCenter);
          setCurrentZoom(4);
        }

      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load store data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [filters, refreshTrigger]);

  const handleMarkerClick = (store: Store) => {
    // Immediately close any existing InfoWindow
    setShowInfoWindow(false);
    
    if (selectedStore?.id === store.id) {
      // Clicking the same store - just close it
      onStoreSelect(null);
    } else {
      // Clicking a different store - select it
      onStoreSelect(store);
      // Don't set showInfoWindow here - let useEffect handle it
    }
  };

  const handleInfoWindowClose = () => {
    setShowInfoWindow(false);
    onStoreSelect(null);
  };

  // Check if API key looks valid
  const isValidApiKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey.length > 10;

  if (!apiKey || !isValidApiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-lg">
          <div className="text-6xl text-gray-400 mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-4">Google Maps API Key Required</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-3">To see the interactive map with store markers:</p>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Create a <code className="bg-blue-100 px-2 py-1 rounded">.env</code> file in the <code className="bg-blue-100 px-2 py-1 rounded">frontend</code> folder</li>
              <li>2. Add this line: <code className="bg-blue-100 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_actual_key</code></li>
              <li>3. Get your API key from <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google Cloud Console</a></li>
              <li>4. Enable the "Maps JavaScript API" and "Places API"</li>
              <li>5. Restart the development server</li>
            </ol>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Debug: API Key {apiKey ? `present (${apiKey.length} chars)` : 'missing'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <LoadScript 
        googleMapsApiKey={apiKey}
        onError={(error) => {
          console.error('Google Maps script failed to load:', error);
          setMapError('Failed to load Google Maps. Please check your API key and billing settings.');
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentCenter}
          zoom={currentZoom}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          onClick={() => {
            // Close InfoWindow when clicking on empty map area
            setShowInfoWindow(false);
            if (selectedStore) {
              onStoreSelect(null);
            }
          }}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          }}
        >
          {stores.map((store, index) => {
            const isSelected = selectedStore?.id === store.id;
            return (
              <Marker
                key={store.id}
                position={{ lat: store.latitude, lng: store.longitude }}
                onClick={() => handleMarkerClick(store)}
                title={store.name}
              />
            );
          })}

          {selectedStore && showInfoWindow && (
            <InfoWindow
              key={selectedStore.id}
              position={{ 
                lat: selectedStore.latitude, 
                lng: selectedStore.longitude 
              }}
              onCloseClick={handleInfoWindowClose}
              options={{
                pixelOffset: new google.maps.Size(0, -35), // Reduce offset to avoid header overlap
                maxWidth: 220,
                minWidth: 220, // Force minimum width
                disableAutoPan: true
              }}
            >
              <div className="w-52 h-12 p-1.5 flex flex-col">
                <h4 className="font-bold text-xs mb-0 text-gray-800 truncate" title={selectedStore.name}>
                  {selectedStore.name}
                </h4>
                <p className="text-gray-600 mb-0 text-xs truncate" title={selectedStore.address}>
                  📍 {selectedStore.address}, {selectedStore.city}, {selectedStore.state}
                </p>
                <div className="flex-1 overflow-hidden mt-0.5">
                  <p className="text-gray-700 text-xs">
                    {selectedStore.products && selectedStore.products.length > 0 ? (
                      `Products: ${selectedStore.products.slice(0, 2).map(p => p.product.name).join(', ')}${selectedStore.products.length > 2 ? ` +${selectedStore.products.length - 2} more` : ''}`
                    ) : (
                      'No products available'
                    )}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      
      {/* Status messages overlay */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-6 py-3 rounded-full shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            <span className="text-gray-700 font-medium">Loading store locations...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-full shadow-lg z-50">
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      {mapError && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-orange-100 border border-orange-400 text-orange-700 px-6 py-3 rounded-full shadow-lg z-50 max-w-md text-center">
          <span className="font-medium">{mapError}</span>
        </div>
      )}
      
      {!isLoading && !error && stores.length === 0 && (filters.state || filters.city || filters.selectedProductIds.length > 0) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-3 rounded-full shadow-lg z-50">
          <span className="font-medium">No stores found matching your criteria.</span>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
