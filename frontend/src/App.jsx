import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Calculator, TrendingUp, Info } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [roiResult, setRoiResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financeInputs, setFinanceInputs] = useState({
    down_payment: 5000,
    interest_rate: 5.5,
    loan_years: 5,
    hold_years: 3
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${API_URL}/cars`);
      setCars(response.data);
      if (response.data.length === 0) {
        // Seed data if empty
        await axios.post(`${API_URL}/seed`);
        const reFetch = await axios.get(`${API_URL}/cars`);
        setCars(reFetch.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setLoading(false);
    }
  };

  const handleCalculateROI = async (carId) => {
    try {
      const response = await axios.post(`${API_URL}/calculate-roi`, {
        car_id: carId,
        ...financeInputs
      });
      setRoiResult(response.data);
      
      const altResponse = await axios.get(`${API_URL}/alternatives/${carId}`);
      setAlternatives(altResponse.data);
    } catch (error) {
      console.error("Error calculating ROI:", error);
    }
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setRoiResult(null);
    setAlternatives([]);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Marketplace...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car /> SmartCar ROI
          </h1>
          <nav>
            <button className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 transition">Login</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Car List */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold">Vehicle Marketplace</div>
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[70vh]">
            {cars.map(car => (
              <div 
                key={car.id} 
                className={`p-4 cursor-pointer hover:bg-blue-50 transition ${selectedCar?.id === car.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                onClick={() => handleSelectCar(car)}
              >
                <div className="font-bold">{car.make} {car.model}</div>
                <div className="text-sm text-gray-500">{car.year} • ${car.price.toLocaleString()}</div>
                <div className="text-xs text-blue-600 mt-1">ROI: {car.depreciation_rate}% Deprec./Yr</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details & ROI Calculator */}
        <div className="md:col-span-2 space-y-6">
          {selectedCar ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedCar.make} {selectedCar.model}</h2>
                    <p className="text-gray-500">{selectedCar.year} • {selectedCar.mileage.toLocaleString()} miles</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">${selectedCar.price.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-400 block uppercase">Est. Maintenance / Yr</span>
                    <span className="font-semibold text-gray-700">${selectedCar.est_maintenance_yearly}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-400 block uppercase">Depreciation Rate</span>
                    <span className="font-semibold text-gray-700 text-orange-600">{selectedCar.depreciation_rate}% / Yr</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Calculator size={18} /> Financing Inputs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Down Payment</label>
                      <input 
                        type="number" 
                        value={financeInputs.down_payment}
                        onChange={(e) => setFinanceInputs({...financeInputs, down_payment: parseInt(e.target.value)})}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Int. Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={financeInputs.interest_rate}
                        onChange={(e) => setFinanceInputs({...financeInputs, interest_rate: parseFloat(e.target.value)})}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Loan Yrs</label>
                      <input 
                        type="number" 
                        value={financeInputs.loan_years}
                        onChange={(e) => setFinanceInputs({...financeInputs, loan_years: parseInt(e.target.value)})}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Hold Yrs</label>
                      <input 
                        type="number" 
                        value={financeInputs.hold_years}
                        onChange={(e) => setFinanceInputs({...financeInputs, hold_years: parseInt(e.target.value)})}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCalculateROI(selectedCar.id)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Calculate Long-Term ROI
                  </button>
                </div>
              </div>

              {roiResult && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="text-green-600" /> Ownership Projections</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-xs text-green-600 uppercase font-bold mb-1">Monthly Payment</div>
                      <div className="text-2xl font-bold">${roiResult.monthly_payment}</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <div className="text-xs text-orange-600 uppercase font-bold mb-1">Total Cost ({financeInputs.hold_years}yrs)</div>
                      <div className="text-2xl font-bold">${roiResult.total_cost_of_ownership.toLocaleString()}</div>
                      <p className="text-[10px] text-gray-400 mt-1">Includes int, maint & deprec.</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-xs text-blue-600 uppercase font-bold mb-1">Future Resale</div>
                      <div className="text-2xl font-bold">${roiResult.estimated_resale_value.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-center">
                    <Info className="text-blue-500" />
                    <p className="text-sm text-gray-600">
                      Buying this car will cost you an average of <strong>${Math.round(roiResult.total_cost_of_ownership / (financeInputs.hold_years * 12))}</strong> per month in total ownership costs over {financeInputs.hold_years} years.
                    </p>
                  </div>

                  {alternatives.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Smarter Alternatives (Better Depreciation)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {alternatives.map(alt => (
                          <div key={alt.id} className="p-3 border rounded-lg hover:border-blue-300 transition cursor-pointer" onClick={() => handleSelectCar(alt)}>
                            <div className="font-bold text-sm">{alt.make} {alt.model}</div>
                            <div className="text-xs text-green-600">{alt.depreciation_rate}% Depreciation</div>
                            <div className="text-xs text-gray-400">${alt.price.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              <Car size={64} className="mb-4 opacity-20" />
              <p className="text-xl font-medium">Select a car to analyze your ROI</p>
              <p className="text-sm">Compare financing options and long-term depreciation.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
