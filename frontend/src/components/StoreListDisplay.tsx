import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Filters } from '../types';

interface StoreListDisplayProps {
  filters: Filters;
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
}

const StoreListDisplay: React.FC<StoreListDisplayProps> = ({ 
  filters, 
  selectedStore, 
  onStoreSelect 
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load store data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [filters]);

  const handleStoreClick = (store: Store) => {
    // Toggle selection: if clicking the same store, deselect it
    const newSelection = selectedStore?.id === store.id ? null : store;
    onStoreSelect(newSelection);
  };

  const getGoogleMapsLink = (store: Store) => {
    return `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
  };

  const getDirectionsLink = (store: Store) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
  };

  if (isLoading) {
    return (
      <div className="store-list-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading store locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-list-error">
        <div className="error-icon">❌</div>
        <h3>Error Loading Stores</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="store-list-container">
      <div className="store-list-header">
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <h3>Store Locations</h3>
          <p className="map-note">
            Configure Google Maps API key to see interactive map
          </p>
        </div>
        
        <div className="stores-summary">
          <span className="store-count">{stores.length}</span>
          <span className="store-label">
            {stores.length === 1 ? 'Store Found' : 'Stores Found'}
          </span>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="no-stores">
          <div className="no-stores-icon">🏪</div>
          <h3>No Stores Found</h3>
          <p>Try adjusting your filters to find stores in your area.</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map(store => (
            <div
              key={store.id}
              className={`store-card ${selectedStore?.id === store.id ? 'selected' : ''}`}
              onClick={() => handleStoreClick(store)}
            >
              <div className="store-card-header">
                <h4 className="store-name">{store.name}</h4>
                <div className="store-location-badge">
                  📍 {store.city}, {store.state}
                </div>
              </div>
              
              <div className="store-address">
                <p>{store.address}</p>
              </div>

              {store.products && store.products.length > 0 && (
                <div className="store-products">
                  <h5>Available Products:</h5>
                  <div className="product-tags">
                    {store.products.slice(0, 3).map(spLink => (
                      <span key={spLink.product.id} className="product-tag">
                        {spLink.product.name}
                      </span>
                    ))}
                    {store.products.length > 3 && (
                      <span className="product-tag more">
                        +{store.products.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="store-actions">
                <a
                  href={getGoogleMapsLink(store)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn view-map"
                  onClick={(e) => e.stopPropagation()}
                >
                  🗺️ View on Map
                </a>
                <a
                  href={getDirectionsLink(store)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn get-directions"
                  onClick={(e) => e.stopPropagation()}
                >
                  🧭 Get Directions
                </a>
              </div>

              {selectedStore?.id === store.id && (
                <div className="store-details-expanded">
                  <div className="store-coordinates">
                    <strong>Coordinates:</strong> {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                  </div>
                  
                  {store.products && store.products.length > 0 && (
                    <div className="all-products">
                      <h6>All Products at this location:</h6>
                      <ul>
                        {store.products.map(spLink => (
                          <li key={spLink.product.id}>{spLink.product.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreListDisplay; 