import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, Filters } from '../types';

interface FilterControlsProps {
  onFiltersChange: (filters: Filters) => void;
  refreshTrigger?: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFiltersChange, refreshTrigger }) => {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [isLoadingStates, setIsLoadingStates] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const [errorStates, setErrorStates] = useState<string|null>(null);
  const [errorCities, setErrorCities] = useState<string|null>(null);
  const [errorProducts, setErrorProducts] = useState<string|null>(null);

  // Function to fetch states
  const fetchStates = async () => {
    setIsLoadingStates(true);
    setErrorStates(null);
    try {
      const response = await axios.get<string[]>('/api/filters/states');
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      setErrorStates('Failed to load states.');
    } finally {
      setIsLoadingStates(false);
    }
  };

  // Function to fetch products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setErrorProducts(null);
    try {
      const response = await axios.get<Product[]>('/api/filters/products');
      setProducts(response.data);
      
      // Automatically select all products when they're loaded
      // This happens on initial load AND after CSV upload refresh
      if (response.data.length > 0) {
        const allProductIds = response.data.map(product => product.id);
        setSelectedProductIds(allProductIds);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorProducts('Failed to load products.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch states - trigger on mount and refreshTrigger change
  useEffect(() => {
    fetchStates();
  }, [refreshTrigger]);

  // Fetch cities when selectedState changes
  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        setIsLoadingCities(true);
        setErrorCities(null);
        setCities([]);
        setSelectedCity('');
        try {
          const response = await axios.get<string[]>(`/api/filters/cities/${selectedState}`);
          setCities(response.data);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setErrorCities('Failed to load cities.');
        } finally {
          setIsLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setSelectedCity('');
      setErrorCities(null);
    }
  }, [selectedState]);

  // Fetch products - trigger on mount and refreshTrigger change
  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const handleProductChange = (productId: string) => {
    setSelectedProductIds(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedProductIds([]);
    setCities([]);
    setErrorCities(null);
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(product => product.id));
    }
  };

  useEffect(() => {
    onFiltersChange({
      state: selectedState || null,
      city: selectedCity || null,
      selectedProductIds: selectedProductIds,
    });
  }, [selectedState, selectedCity, selectedProductIds, onFiltersChange]);

  const hasActiveFilters = selectedState || selectedCity || selectedProductIds.length > 0;

  return (
    <div className="filter-controls">
      <div className="filter-header">
        <h4>🔍 Filter Stores</h4>
        {hasActiveFilters && (
          <button 
            className="reset-filters-btn"
            onClick={handleResetFilters}
            title="Clear all filters"
          >
            ✕ Reset
          </button>
        )}
      </div>

      <div className="filters-container">
        {/* Location Filters */}
        <div className="filter-section">
          <h5 className="filter-section-title">📍 Location</h5>
          
          <div className="filter-group">
            <label htmlFor="state-select" className="filter-label">State:</label>
            <div className="select-wrapper">
              <select
                id="state-select"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                disabled={isLoadingStates || errorStates !== null}
                className="filter-select"
              >
                <option value="">{isLoadingStates ? 'Loading states...' : (errorStates ? 'Error loading' : 'All States')}</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {isLoadingStates && <div className="loading-spinner"></div>}
            </div>
            {errorStates && <p className="error-message">{errorStates}</p>}
          </div>

          <div className="filter-group">
            <label htmlFor="city-select" className="filter-label">City:</label>
            <div className="select-wrapper">
              <select
                id="city-select"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                disabled={!selectedState || isLoadingCities || cities.length === 0 && !errorCities}
                className="filter-select"
              >
                <option value="">
                  {isLoadingCities ? 'Loading cities...' :
                   errorCities ? 'Error loading' :
                   !selectedState ? 'Select State First' :
                   cities.length === 0 ? 'No cities found' : 'All Cities'}
                </option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {isLoadingCities && <div className="loading-spinner"></div>}
            </div>
            {errorCities && <p className="error-message">{errorCities}</p>}
          </div>
        </div>

        {/* Products Filter */}
        <div className="filter-section">
          <div className="products-header">
            <h5 className="filter-section-title">🛍️ Products</h5>
            {!isLoadingProducts && !errorProducts && products.length > 0 && (
              <button 
                className="select-all-btn"
                onClick={handleSelectAllProducts}
                title={selectedProductIds.length === products.length ? "Deselect all products" : "Select all products"}
              >
                {selectedProductIds.length === products.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
          
          <div className="filter-group">
            {isLoadingProducts && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading products...</span>
              </div>
            )}
            
            {errorProducts && <p className="error-message">{errorProducts}</p>}
            
            {!isLoadingProducts && !errorProducts && products.length === 0 && (
              <p className="info-message">No products available.</p>
            )}

            {!isLoadingProducts && !errorProducts && products.length > 0 && (
              <div className="product-list">
                {products.map(product => (
                  <div key={product.id} className="product-item">
                    <input
                      type="checkbox"
                      id={`product-${product.id}`}
                      value={product.id}
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductChange(product.id)}
                      className="product-checkbox"
                    />
                    <label htmlFor={`product-${product.id}`} className="product-label">
                      {product.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="active-filters-summary">
            <h6>Active Filters:</h6>
            <div className="filter-tags">
              {selectedState && (
                <span className="filter-tag">
                  State: {selectedState}
                  <button onClick={() => setSelectedState('')} className="remove-tag">×</button>
                </span>
              )}
              {selectedCity && (
                <span className="filter-tag">
                  City: {selectedCity}
                  <button onClick={() => setSelectedCity('')} className="remove-tag">×</button>
                </span>
              )}
              {selectedProductIds.length > 0 && (
                <span className="filter-tag">
                  Products: {selectedProductIds.length} selected
                  <button onClick={() => setSelectedProductIds([])} className="remove-tag">×</button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
