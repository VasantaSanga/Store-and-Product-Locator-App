import { useState, useCallback } from 'react';
import './App.css' // Main application styles
import CsvUploadForm from './components/CsvUploadForm';
import FilterControls from './components/FilterControls';
import MapDisplay from './components/MapDisplay';
import { Filters } from './types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

if (!GOOGLE_MAPS_API_KEY && import.meta.env.DEV) { // Show warning only in dev mode
  console.warn("VITE_GOOGLE_MAPS_API_KEY is not defined in your frontend/.env file. Map functionality will be limited.");
}

function App() {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    state: null,
    city: null,
    selectedProductIds: [],
  });

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setActiveFilters(newFilters);
    // console.log('Active filters updated in App:', newFilters); // Keep for debugging if needed
  }, []);

  return (
    <> {/* React Fragment, no actual element rendered to DOM, so #root styling applies to children */}
      <header> {/* Styled by App.css */}
        <h1>Store & Product Locator</h1>
      </header>

      <div className="app-layout"> {/* Styled by App.css */}
        <aside className="sidebar"> {/* Styled by App.css */}
          <section className="sidebar-section"> {/* Styled by App.css */}
            <CsvUploadForm />
          </section>

          <section className="sidebar-section"> {/* Styled by App.css */}
            <FilterControls onFiltersChange={handleFilterChange} />
          </section>
        </aside>

        <main className="main-content"> {/* Styled by App.css */}
          <section className="main-section" style={{ padding: GOOGLE_MAPS_API_KEY ? '0' : '1rem' }}>
            {/* No h2 for Map, as the map itself is the content */}
            {GOOGLE_MAPS_API_KEY ? (
              <MapDisplay apiKey={GOOGLE_MAPS_API_KEY} filters={activeFilters} />
            ) : (
              <div className="error-text" style={{paddingTop: '2rem'}}> {/* Centered by error-text if not already */}
                <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Google Maps API Key is Missing</p>
                <p>To display the map, please create a <code>frontend/.env</code> file.</p>
                <p>Add your API key like this: <code>VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE</code></p>
                <p>After adding the key, you may need to restart the development server.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  )
}

export default App
