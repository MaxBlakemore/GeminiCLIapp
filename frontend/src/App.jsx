import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, Search, TrendingUp, Zap, CreditCard, Banknote, X, ArrowRight, 
  ChevronRight, Info, BarChart3, BookOpen, LayoutGrid, Calculator as CalcIcon,
  ShieldCheck, Wallet, Sparkles
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
  const [view, setView] = useState('marketplace'); // 'marketplace', 'calculator', 'guides'
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [roiResult, setRoiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
      const response = await axios.get(`${API_URL}/search?${params.toString()}`);
      setCars(response.data);
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

  // --- Views ---

  const MarketplaceView = () => (
    <div className="animate-in fade-in duration-500">
      <section className="mb-16 text-center max-w-3xl mx-auto pt-12">
        <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Stop guessing. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Buy with data.</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          Search our database of vehicles with built-in depreciation and ROI tracking.
        </p>

        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Try 'Tesla', 'Fast SUV', or 'Toyota'..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 pl-14 pr-32 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-2xl"
          />
          <button type="submit" className="absolute right-3 top-2.5 bottom-2.5 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-500 transition flex items-center gap-2">
            Search
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-80 bg-slate-800/40 rounded-3xl animate-pulse"></div>)
        ) : cars.map(car => (
          <div key={car.id} onClick={() => openCarDetail(car)} className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col">
            <div className="h-48 bg-slate-800 relative flex items-center justify-center">
              <Car size={64} className="text-slate-700 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
                {car.body_type || 'Vehicle'}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white">{car.make} {car.model}</h3>
                  <p className="text-slate-500 text-sm">{car.year} • {car.fuel_type}</p>
                </div>
                <div className="text-xl font-black text-white">${car.price.toLocaleString()}</div>
              </div>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-800 text-emerald-400">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span className="text-sm font-bold">{car.depreciation_rate}% Deprec./Yr</span>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CalculatorView = () => (
    <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4">Master ROI Calculator</h2>
        <p className="text-slate-400">Tweak the numbers to see the true cost of car ownership over time.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="text-indigo-400" size={20} /> Inputs</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Down Payment ($)</label>
              <input type="number" value={financeInputs.down_payment} onChange={e => setFinanceInputs({...financeInputs, down_payment: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Interest Rate (%)</label>
                <input type="number" step="0.1" value={financeInputs.interest_rate} onChange={e => setFinanceInputs({...financeInputs, interest_rate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Loan Term (Yrs)</label>
                <input type="number" value={financeInputs.loan_years} onChange={e => setFinanceInputs({...financeInputs, loan_years: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Changing these will update the projections for any car you select in the marketplace.</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-400 leading-relaxed">
          <div className="bg-indigo-600/10 p-6 rounded-2xl border border-indigo-500/20">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Info size={18} /> Why this matters</h4>
            <p className="text-sm">Most people focus on the monthly payment. We focus on the <strong>Net Resale Value</strong>—what's left in your pocket after you sell the car and pay off the remaining loan balance.</p>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-400"><BarChart3 size={20} /></div>
            <div>
              <h4 className="text-white font-bold text-sm">Depreciation is the biggest cost</h4>
              <p className="text-xs">A car losing 15% value per year costs more than a 7% interest rate on a car that holds its value.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const GuidesView = () => (
    <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-white mb-4">Financing Intelligence</h2>
        <p className="text-slate-400 text-lg">The dealer's worst nightmare: An informed buyer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "The 0% Credit Card Hack", icon: <CreditCard className="text-cyan-400" />, text: "For cars under $10k, using a 0% purchase card for 24 months is effectively a free loan. Just ensure you clear the balance before the interest kicks in." },
          { title: "Bank Loan vs Dealership", icon: <Banknote className="text-indigo-400" />, text: "Dealers often 'mark up' interest rates (APR). A direct personal loan from your bank is usually 2-3% cheaper and gives you cash-buyer power." },
          { title: "PCP: The Value Trap", icon: <Zap className="text-amber-400" />, text: "PCP has the lowest monthly payments, but you're only paying for the depreciation. It's great for high-value-retention cars (Porsche, Tesla) but terrible for others." }
        ].map((guide, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/40 transition-colors">
            <div className="bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              {guide.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{guide.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{guide.text}</p>
            <button className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              Read Deep Dive <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-[#060b18]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('marketplace')}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Car className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              Wheels <span className="text-indigo-400 font-medium lowercase italic">Brought Smarter</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl gap-1">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: <LayoutGrid size={16} /> },
              { id: 'calculator', label: 'ROI Calculator', icon: <CalcIcon size={16} /> },
              { id: 'guides', label: 'Financing Guides', icon: <BookOpen size={16} /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          <button className="hidden lg:block bg-white text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition shadow-xl">
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {view === 'marketplace' && <MarketplaceView />}
        {view === 'calculator' && <CalculatorView />}
        {view === 'guides' && <GuidesView />}
      </main>

      {/* Side Detail Panel / Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedCar(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0a0f1e] h-full shadow-2xl overflow-y-auto border-l border-slate-800 animate-in slide-in-from-right duration-500">
            <div className="p-10">
              <button onClick={() => setSelectedCar(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition"><X size={24} /></button>
              
              <div className="mb-10 pt-4">
                <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                  <ShieldCheck size={14} /> Optimization Report
                </div>
                <h2 className="text-5xl font-black text-white leading-none mb-4">{selectedCar.make} {selectedCar.model}</h2>
                <div className="flex flex-wrap gap-4 text-slate-400 text-sm font-medium">
                  <span className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">{selectedCar.year} Model</span>
                  <span className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">{selectedCar.fuel_type}</span>
                  <span className="bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">{selectedCar.transmission}</span>
                </div>
              </div>

              {roiResult ? (
                <div className="space-y-12">
                  <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/5 border border-indigo-500/30 rounded-[2rem] p-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-600 p-2 rounded-xl"><Zap size={20} className="text-white fill-white" /></div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Financing Strategy</h3>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-8">{roiResult.purchase_advice}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {roiResult.financing_options?.map((opt, i) => (
                          <div key={i} className={`p-5 rounded-2xl border transition-all ${i === 0 ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/30 -translate-y-1' : 'bg-slate-900/50 border-slate-800'}`}>
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${i === 0 ? 'text-indigo-200' : 'text-slate-500'}`}>Smart Score</div>
                            <div className={`text-xl font-black ${i === 0 ? 'text-white' : 'text-indigo-400'}`}>{opt.smart_score}%</div>
                            <div className={`font-bold text-xs mt-1 ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{opt.method}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/50">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">Monthly Cost</span>
                      <div className="text-4xl font-black text-white tracking-tighter">${roiResult.monthly_payment}</div>
                      <div className="mt-4 flex items-center gap-2 text-indigo-400/80 text-[10px] font-bold">
                        <Wallet size={12} /> {financeInputs.interest_rate}% APR applied
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/50">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">3-Year Ownership</span>
                      <div className="text-4xl font-black text-white tracking-tighter">${roiResult.total_cost_of_ownership.toLocaleString()}</div>
                      <div className="mt-4 flex items-center gap-2 text-emerald-400/80 text-[10px] font-bold">
                        <TrendingUp size={12} /> Net depreciation included
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Future Resale Value</span>
                      <div className="text-3xl font-black text-white tracking-tighter">${roiResult.estimated_resale_value.toLocaleString()}</div>
                    </div>
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20"><TrendingUp size={32} /></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-600">
                  <Zap className="animate-pulse mb-4 text-indigo-500" size={64} />
                  <p className="text-xl font-bold tracking-tight">Crunching depreciation models...</p>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 p-10 bg-[#0a0f1e]/80 backdrop-blur-xl border-t border-slate-800">
              <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98]">
                Unlock Purchase Strategy <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
