import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { Store, Filters, Product } from '../types';

interface MapDisplayProps {
  apiKey: string;
  filters: Filters;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ apiKey, filters }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '500px', // Adjust as needed
  };

  // Default center (e.g., center of US)
  const defaultCenter = {
    lat: 39.8283,
    lng: -98.5795,
  };

  const [currentCenter, setCurrentCenter] = useState(defaultCenter);
  const [currentZoom, setCurrentZoom] = useState(4);


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

        // Only fetch if at least one filter is applied, or adjust if you want to load all initially
        // For now, let's allow fetching all if no filters, or specific if filters are set.
        // The backend /api/stores endpoint supports fetching all if no query params are given.

        const response = await axios.get<Store[]>('/api/stores', { params });
        setStores(response.data);

        // Adjust map center and zoom based on fetched stores
        if (response.data.length > 0) {
          // If only one store, center on it
          if (response.data.length === 1) {
            setCurrentCenter({ lat: response.data[0].latitude, lng: response.data[0].longitude });
            setCurrentZoom(12); // Zoom in closer for a single store
          } else {
            // Multiple stores: calculate bounds or center on first result for simplicity
            // A more robust solution would calculate the bounding box of all stores
            setCurrentCenter({ lat: response.data[0].latitude, lng: response.data[0].longitude });
            setCurrentZoom(filters.city ? 10 : (filters.state ? 7 : 4)); // Zoom based on filter specificity
          }
        } else {
          // No stores found, reset to default or keep current view
           if(filters.state || filters.city || filters.selectedProductIds.length > 0){
             // if filters were active but no results, maybe zoom out or show a message
           } else {
             setCurrentCenter(defaultCenter);
             setCurrentZoom(4);
           }
        }

      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load store data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [filters]); // Re-fetch when filters change

  if (!apiKey) {
    return <p>Google Maps API key is missing. Please configure it in your .env file (VITE_GOOGLE_MAPS_API_KEY).</p>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentCenter}
        zoom={currentZoom}
        onLoad={() => console.log('Map loaded.')}
        onUnmount={() => console.log('Map unmounted.')}
      >
        {isLoading && <p>Loading stores...</p> /* This won't display on map, better outside */}
        {stores.map(store => (
          <Marker
            key={store.id}
            position={{ lat: store.latitude, lng: store.longitude }}
            onClick={() => setSelectedStore(store)}
            title={store.name}
          />
        ))}

        {selectedStore && (
          <InfoWindow
            position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div>
              <h4>{selectedStore.name}</h4>
              <p>{selectedStore.address}</p>
              <p>{selectedStore.city}, {selectedStore.state}</p>
              <h5>Available Products:</h5>
              {selectedStore.products && selectedStore.products.length > 0 ? (
                <ul>
                  {selectedStore.products.map(spLink => (
                    <li key={spLink.product.id}>{spLink.product.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific product information available for this store with current filters.</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      {isLoading && <div style={{textAlign: 'center', padding: '10px'}}>Loading store locations...</div>}
      {error && <div style={{textAlign: 'center', padding: '10px', color: 'red'}}>{error}</div>}
      {!isLoading && !error && stores.length === 0 && (filters.state || filters.city || filters.selectedProductIds.length > 0) &&
        <div style={{textAlign: 'center', padding: '10px'}}>No stores found matching your criteria.</div>
      }
    </LoadScript>
  );
};

export default MapDisplay;
