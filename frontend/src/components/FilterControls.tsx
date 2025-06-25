import React, { useState, useEffect } from 'react'; // useCallback removed as it's not strictly needed here with current setup
import axios from 'axios';
import { Product, Filters } from '../types';

interface FilterControlsProps {
  onFiltersChange: (filters: Filters) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFiltersChange }) => {
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


  // Fetch states
  useEffect(() => {
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
    fetchStates();
  }, []);

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
      setErrorCities(null); // Clear city errors if no state is selected
    }
  }, [selectedState]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setErrorProducts(null);
      try {
        const response = await axios.get<Product[]>('/api/filters/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setErrorProducts('Failed to load products.');
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (productId: string) => {
    setSelectedProductIds(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  useEffect(() => {
    onFiltersChange({
      state: selectedState || null,
      city: selectedCity || null,
      selectedProductIds: selectedProductIds,
    });
  }, [selectedState, selectedCity, selectedProductIds, onFiltersChange]);


  return (
    <div>
      <h4>Filter Options</h4> {/* Changed from h3 to h4 to be consistent with CsvUploadForm */}

      <div className="filter-group">
        <label htmlFor="state-select">State:</label>
        <select
          id="state-select"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          disabled={isLoadingStates || errorStates !== null}
        >
          <option value="">{isLoadingStates ? 'Loading states...' : (errorStates ? 'Error loading' : 'Select State')}</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errorStates && <p className="message-error" style={{fontSize: '0.8rem', marginTop: '0.2rem'}}>{errorStates}</p>}
      </div>

      <div className="filter-group">
        <label htmlFor="city-select">City:</label>
        <select
          id="city-select"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          disabled={!selectedState || isLoadingCities || cities.length === 0 && !errorCities}
        >
          <option value="">
            {isLoadingCities ? 'Loading cities...' :
             errorCities ? 'Error loading' :
             !selectedState ? 'Select State First' :
             cities.length === 0 ? 'No cities found' : 'Select City'}
          </option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {errorCities && <p className="message-error" style={{fontSize: '0.8rem', marginTop: '0.2rem'}}>{errorCities}</p>}
      </div>

      <div className="filter-group">
        <label>Products:</label> {/* Changed from h4 to label for consistency */}
        {isLoadingProducts && <p className="loading-text" style={{fontSize: '0.8rem'}}>Loading products...</p>}
        {errorProducts && <p className="message-error" style={{fontSize: '0.8rem'}}>{errorProducts}</p>}
        {!isLoadingProducts && !errorProducts && products.length === 0 && <p className="info-text" style={{fontSize: '0.8rem'}}>No products available.</p>}

        {!isLoadingProducts && !errorProducts && products.length > 0 && (
          <div className="product-list">
            {products.map(product => (
              <div key={product.id}>
                <input
                  type="checkbox"
                  id={`product-${product.id}`}
                  value={product.id}
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => handleProductChange(product.id)}
                />
                <label htmlFor={`product-${product.id}`}>{product.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
