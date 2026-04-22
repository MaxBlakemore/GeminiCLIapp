import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, 
  Search, 
  Filter, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  Banknote,
  X,
  ArrowRight,
  Info
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [roiResult, setRoiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    max_price: '',
    body_type: ''
  });
  const [financeInputs, setFinanceInputs] = useState({
    down_payment: 5000,
    interest_rate: 6.9,
    loan_years: 4,
    hold_years: 3
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (filters.make) params.append('make', filters.make);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.body_type) params.append('body_type', filters.body_type);

      const response = await axios.get(`${API_URL}/search?${params.toString()}`);
      setCars(response.data);
      
      if (response.data.length === 0 && !searchQuery && !filters.make) {
        await axios.post(`${API_URL}/seed`);
        const reFetch = await axios.get(`${API_URL}/cars`);
        setCars(reFetch.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  const handleCalculateROI = async (car) => {
    try {
      const response = await axios.post(`${API_URL}/calculate-roi`, {
        car_id: car.id,
        ...financeInputs
      });
      setRoiResult(response.data);
    } catch (error) {
      console.error("ROI error:", error);
    }
  };

  const openCarDetail = (car) => {
    setSelectedCar(car);
    setRoiResult(null);
    handleCalculateROI(car);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
              <Car className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              Wheels <span className="text-indigo-400 font-medium lowercase italic">Brought Smarter</span>
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition">Marketplace</a>
            <a href="#" className="hover:text-white transition">ROI Calculator</a>
            <a href="#" className="hover:text-white transition">Financing Guides</a>
          </nav>
          <button className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition shadow-xl">
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero & Search Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Stop guessing. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Buy with data.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Calculate long-term depreciation, total cost of ownership, and find the smartest way to pay—all in one place.
          </p>

          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Try 'Fast electric SUV' or 'Toyota under $30k'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 pl-14 pr-32 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-2.5 bottom-2.5 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-500 transition flex items-center gap-2"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['SUV', 'Hatchback', 'Electric', 'Sedan'].map(tag => (
              <button 
                key={tag}
                onClick={() => {setSearchQuery(tag); handleSearch();}}
                className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-medium hover:border-slate-500 transition text-slate-300"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-800/40 rounded-3xl animate-pulse"></div>
            ))
          ) : cars.length > 0 ? (
            cars.map(car => (
              <div 
                key={car.id} 
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
                onClick={() => openCarDetail(car)}
              >
                <div className="h-48 bg-slate-800 relative flex items-center justify-center">
                  <Car size={64} className="text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
                    {car.body_type || 'Vehicle'}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight">{car.make} {car.model}</h3>
                      <p className="text-slate-500 text-sm">{car.year} • {car.mileage.toLocaleString()} miles</p>
                    </div>
                    <div className="text-xl font-black text-white">${car.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <TrendingUp size={16} />
                      <span className="text-sm font-bold">{car.depreciation_rate}% Deprec./Yr</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm group-hover:text-white transition">
                      View ROI <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-500">
              No cars found matching your request. Try another search.
            </div>
          )}
        </div>
      </main>

      {/* Side Detail Panel / Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedCar(null)}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 h-full shadow-2xl overflow-y-auto border-l border-slate-800 animate-in slide-in-from-right duration-300">
            <div className="p-8">
              <button 
                onClick={() => setSelectedCar(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-2 block">Optimization Report</span>
                <h2 className="text-4xl font-black text-white">{selectedCar.make} {selectedCar.model}</h2>
                <p className="text-slate-400 mt-1">{selectedCar.year} • {selectedCar.fuel_type} • {selectedCar.transmission}</p>
              </div>

              {roiResult ? (
                <div className="space-y-10">
                  {/* Financing Advice Section */}
                  <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-indigo-600 p-2 rounded-lg">
                        <Zap size={20} className="text-white fill-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Smartest Purchase Strategy</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {roiResult.purchase_advice}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {roiResult.financing_options?.map((opt, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${i === 0 ? 'text-indigo-200' : 'text-slate-500'}`}>Match Score</span>
                            <span className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-indigo-400'}`}>{opt.smart_score}%</span>
                          </div>
                          <div className={`font-bold text-sm ${i === 0 ? 'text-white' : 'text-slate-200'}`}>{opt.method}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ROI Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block mb-2">Monthly Cost</span>
                      <div className="text-3xl font-black text-white">${roiResult.monthly_payment}</div>
                      <p className="text-slate-500 text-[10px] mt-2">Estimated at {financeInputs.interest_rate}% APR</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block mb-2">Total TCO (3yr)</span>
                      <div className="text-3xl font-black text-white">${roiResult.total_cost_of_ownership.toLocaleString()}</div>
                      <p className="text-slate-500 text-[10px] mt-2">Includes deprec, int, & maint.</p>
                    </div>
                  </div>

                  {/* Future Value */}
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block mb-1">Estimated Future Value</span>
                      <div className="text-2xl font-bold text-white">${roiResult.estimated_resale_value.toLocaleString()}</div>
                    </div>
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <TrendingUp size={28} />
                    </div>
                  </div>

                  {/* Purchase Method Deep Dive */}
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-lg px-2">How to buy Outright</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex gap-4 p-5 bg-slate-800/30 border border-slate-800 rounded-3xl hover:border-slate-700 transition">
                        <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                          <Banknote />
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1 text-sm">Personal Bank Loan</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Lower interest than PCP/HP. Best if borrowing over $10k. Current rates approx 5.9% - 7.5%.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-5 bg-slate-800/30 border border-slate-800 rounded-3xl hover:border-slate-700 transition">
                        <div className="h-12 w-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <CreditCard />
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1 text-sm">0% Purchase Credit Card</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">Best for balances under $10k. Pay 0% interest for up to 24 months. Ensure you can clear balance before 0% ends.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Zap className="animate-pulse mb-4" size={48} />
                  <p className="text-lg">Crunching numbers...</p>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 p-8 bg-slate-900/80 backdrop-blur border-t border-slate-800">
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-500 transition shadow-2xl flex items-center justify-center gap-2">
                Secure This Deal <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
