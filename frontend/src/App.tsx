import { useState, useCallback } from 'react';
import './App.css' // Main application styles
import CsvUploadForm from './components/CsvUploadForm';
import FilterControls from './components/FilterControls';
import MapDisplay from './components/MapDisplay';
import StoreListDisplay from './components/StoreListDisplay';
import { Filters, Store } from './types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;



function App() {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    state: null,
    city: null,
    selectedProductIds: [],
  });
  
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshingData, setIsRefreshingData] = useState<boolean>(false);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setActiveFilters(newFilters);
    // Clear selected store when filters change to avoid confusion
    setSelectedStore(null);
  }, []);

  const handleStoreSelect = useCallback((store: Store | null) => {
    setSelectedStore(store);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    // Show loading state
    setIsRefreshingData(true);
    
    // Trigger refresh in FilterControls by incrementing the trigger
    setRefreshTrigger(prev => prev + 1);
    
    // Hide loading state after a short delay to allow components to refresh
    setTimeout(() => {
      setIsRefreshingData(false);
    }, 1500);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="text-white p-6 shadow-lg flex-shrink-0" style={{backgroundColor: '#ce7940'}}>
        <h1 className="text-3xl font-bold text-center">Store & Product Locator</h1>
      </header>

      {/* Loading overlay */}
      {isRefreshingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            <span className="text-lg font-medium text-gray-700">Refreshing data...</span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Sidebar - Filters and Store List - SCROLLABLE - 30% width */}
        <aside className="w-[30%] flex-shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <CsvUploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <FilterControls 
                onFiltersChange={handleFilterChange} 
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Store List Section */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Store Locations</h3>
              <StoreListDisplay 
                filters={activeFilters} 
                selectedStore={selectedStore}
                onStoreSelect={handleStoreSelect}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </aside>

        {/* Main Content - Map - FIXED, NO SCROLLING - 70% width */}
        <main className="w-[70%] flex-shrink-0 overflow-hidden">
          <div className={`bg-white rounded-xl shadow-lg h-full ${GOOGLE_MAPS_API_KEY ? 'p-0' : 'p-6'}`}>
            {GOOGLE_MAPS_API_KEY ? (
              <div className="h-full w-full rounded-xl overflow-hidden">
                <MapDisplay 
                  apiKey={GOOGLE_MAPS_API_KEY} 
                  filters={activeFilters}
                  selectedStore={selectedStore}
                  onStoreSelect={handleStoreSelect}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            ) : (
              <div className="h-full w-full flex flex-col">
                {/* Map placeholder */}
                <div className="flex-1 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl text-gray-400 mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Map View</h3>
                    <p className="text-gray-500 mb-4">Google Maps API key is not configured</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                      <p className="text-sm text-blue-800 font-semibold mb-2">To enable the map:</p>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the frontend folder</li>
                        <li>2. Add: <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
                        <li>3. Get your API key from <a href="https://console.cloud.google.com/google/maps-apis/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google Cloud Console</a></li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
