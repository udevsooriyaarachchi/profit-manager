import React, { useState, useEffect, useMemo } from 'react';
import { Upload, DollarSign, Users, PieChart, TrendingUp, AlertCircle, FileText, Settings, Save, X } from 'lucide-react';

// --- Pricing Configuration (Default based on user input) ---
const INITIAL_PRICING = {
  "boom wash": {
    selling: 1000,
    tiers: [
      { limit: 300, cost: 300 },  // First 300 units @ 300
      { limit: Infinity, cost: 100 } // Rest @ 100
    ]
  },
  "mini wifi camera": {
    selling: 2000,
    tiers: [
      { limit: 100, cost: 525 },
      { limit: Infinity, cost: 195 }
    ]
  },
  "water proof tape": {
    selling: 1000,
    tiers: [{ limit: Infinity, cost: 195 }]
  },
  "foot pump": {
    selling: 2000,
    tiers: [{ limit: Infinity, cost: 750 }]
  },
  "electric pump": {
    selling: 2000,
    tiers: [{ limit: Infinity, cost: 750 }]
  },
  "mini fan": {
    selling: 1999,
    tiers: [{ limit: Infinity, cost: 625 }]
  }
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass = "text-blue-600", bgClass = "bg-blue-50" }) => (
  <Card className="p-6 flex items-start space-x-4">
    <div className={`p-3 rounded-lg ${bgClass}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {subValue && <p className="text-sm text-slate-400 mt-1">{subValue}</p>}
    </div>
  </Card>
);

export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [expenses, setExpenses] = useState({
    advertising: 300000,
    returns: 0,
    other: 0
  });
  const [pricing, setPricing] = useState(INITIAL_PRICING);
  const [showSettings, setShowSettings] = useState(false);

  // Load PapaParse for CSV reading
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
        }
      });
    }
  };

  // --- Calculation Logic ---
  const report = useMemo(() => {
    if (!csvData.length) return null;

    // 1. Count Products (Filter for Delivered only? User asked for total sales usually, but let's stick to the file content)
    // The user's previous requests implied they want to calculate based on the uploaded file rows.
    
    const counts = {};
    
    csvData.forEach(row => {
      // Extract Product Name logic: "Product Name (Color, Size)" -> "Product Name"
      const rawDesc = row['PARCEL DESCRIPTION'] || "";
      const name = rawDesc.split(' (')[0].trim();
      const normalizedName = name.toLowerCase();

      if (normalizedName && rawDesc) {
        counts[normalizedName] = (counts[normalizedName] || 0) + 1;
      }
    });

    // 2. Financials
    let totalRevenue = 0;
    let totalCOGS = 0;
    const productBreakdown = [];

    Object.keys(counts).forEach(prodKey => {
      const count = counts[prodKey];
      // Find matching pricing config (fuzzy match or exact match on key)
      // We rely on the keys in INITIAL_PRICING matching the normalized name
      const priceConfig = pricing[prodKey] || { selling: 0, tiers: [{ limit: Infinity, cost: 0 }] };
      
      // Calculate Revenue
      const revenue = count * priceConfig.selling;

      // Calculate Cost (Tiered)
      let remainingCount = count;
      let cost = 0;
      
      for (const tier of priceConfig.tiers) {
        if (remainingCount <= 0) break;
        const qtyInThisTier = Math.min(remainingCount, tier.limit);
        cost += qtyInThisTier * tier.cost;
        remainingCount -= qtyInThisTier;
      }

      totalRevenue += revenue;
      totalCOGS += cost;

      // Capitalize name for display
      const displayName = prodKey.replace(/\b\w/g, l => l.toUpperCase());

      productBreakdown.push({
        name: displayName,
        count: count,
        revenue: revenue,
        cogs: cost,
        gross: revenue - cost
      });
    });

    // Sort by count desc
    productBreakdown.sort((a, b) => b.count - a.count);

    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = Number(expenses.advertising) + Number(expenses.returns) + Number(expenses.other);
    const netProfit = grossProfit - totalExpenses;

    // Partner Shares
    const samilaShare = netProfit * 0.50;
    const remainder = netProfit - samilaShare;
    const partnerShare = remainder / 3;

    return {
      productBreakdown,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit,
      shares: {
        samila: samilaShare,
        others: partnerShare
      }
    };
  }, [csvData, expenses, pricing]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Partner Profit Manager</h1>
            <p className="text-slate-500">Track sales, expenses, and split profits automatically.</p>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Config</span>
            </button>
          </div>
        </div>

        {/* Pricing Settings Modal (Hidden by default) */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Product Pricing Configuration</h2>
                <button onClick={() => setShowSettings(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  These settings define how costs are calculated. The "Limit" defines how many units are bought at a specific "Cost". Use Infinity for the last tier.
                </div>
                {Object.entries(pricing).map(([key, config]) => (
                  <div key={key} className="border p-4 rounded-lg">
                    <h3 className="font-bold capitalize mb-2">{key}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                       <label className="text-xs font-semibold text-slate-500">Selling Price</label>
                       <input 
                          type="number" 
                          value={config.selling}
                          onChange={(e) => {
                            const newPricing = {...pricing};
                            newPricing[key].selling = parseFloat(e.target.value);
                            setPricing(newPricing);
                          }}
                          className="border rounded px-2 py-1"
                       />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Cost Tiers</p>
                      {config.tiers.map((tier, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-sm text-slate-400">Qty:</span>
                          <input 
                            type="number" 
                            disabled={tier.limit === Infinity}
                            value={tier.limit === Infinity ? 999999 : tier.limit}
                            onChange={(e) => {
                               const newPricing = {...pricing};
                               newPricing[key].tiers[idx].limit = parseFloat(e.target.value);
                               setPricing(newPricing);
                            }}
                            className="border rounded px-2 py-1 w-24 text-sm"
                          />
                          <span className="text-sm text-slate-400">@ Cost:</span>
                          <input 
                            type="number" 
                            value={tier.cost} 
                             onChange={(e) => {
                               const newPricing = {...pricing};
                               newPricing[key].tiers[idx].cost = parseFloat(e.target.value);
                               setPricing(newPricing);
                            }}
                            className="border rounded px-2 py-1 w-24 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload */}
          <Card className="lg:col-span-1 p-6">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" /> Upload Sales Data
            </h3>
            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer group">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-10 h-10 mx-auto text-slate-400 group-hover:text-blue-500 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                {fileName ? fileName : "Click to upload CSV"}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard Courier CSV</p>
            </div>
          </Card>

          {/* Expense Inputs */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-600" /> Business Expenses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Advertising Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">LKR</span>
                  <input 
                    type="number" 
                    value={expenses.advertising}
                    onChange={(e) => setExpenses({...expenses, advertising: e.target.value})}
                    className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Return Charges</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">LKR</span>
                  <input 
                    type="number" 
                    value={expenses.returns}
                    onChange={(e) => setExpenses({...expenses, returns: e.target.value})}
                    className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
               <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Other Expenses</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">LKR</span>
                  <input 
                    type="number" 
                    value={expenses.other}
                    onChange={(e) => setExpenses({...expenses, other: e.target.value})}
                    className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        {report ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Revenue" 
                value={formatCurrency(report.totalRevenue)} 
                icon={DollarSign} 
                colorClass="text-emerald-600" 
                bgClass="bg-emerald-50"
              />
              <StatCard 
                title="Cost of Goods" 
                value={formatCurrency(report.totalCOGS)} 
                icon={PieChart} 
                colorClass="text-amber-600" 
                bgClass="bg-amber-50"
              />
              <StatCard 
                title="Expenses (Ads+)" 
                value={formatCurrency(report.totalExpenses)} 
                icon={TrendingUp} 
                colorClass="text-red-600" 
                bgClass="bg-red-50"
              />
              <StatCard 
                title="Net Profit" 
                value={formatCurrency(report.netProfit)} 
                icon={DollarSign} 
                colorClass="text-blue-600" 
                bgClass="bg-blue-50"
              />
            </div>

            {/* Profit Distribution Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                   <h3 className="font-bold text-lg text-slate-800">Product Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Count</th>
                        <th className="px-6 py-4">Revenue</th>
                        <th className="px-6 py-4">Gross Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.productBreakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.count}</td>
                          <td className="px-6 py-4 text-slate-600">{formatCurrency(item.revenue)}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(item.gross)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Partners Split */}
              <Card className="p-6 bg-slate-900 text-white border-slate-800">
                <h3 className="font-bold text-xl mb-6 flex items-center text-white">
                  <Users className="w-6 h-6 mr-2 text-indigo-400" />
                  Profit Distribution
                </h3>
                
                <div className="space-y-6">
                  {/* Samila */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Samila (Investor)</p>
                        <p className="text-xs text-indigo-400">50% Share</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(report.shares.samila)}</p>
                    </div>
                  </div>

                  {/* Partners Group */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="mb-4">
                       <p className="text-slate-400 text-sm font-medium">Working Partners (50%)</p>
                       <p className="text-xs text-indigo-400">Divided equally by 3</p>
                    </div>
                    
                    <div className="space-y-3">
                      {['You', 'Sandun', 'Krishan'].map((partner) => (
                         <div key={partner} className="flex justify-between items-center text-sm border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                           <span className="text-slate-300">{partner}</span>
                           <span className="font-mono text-emerald-400">{formatCurrency(report.shares.others)}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                  <p className="text-slate-500 text-xs uppercase tracking-wider">Total Net Profit</p>
                  <p className="text-xl font-bold text-white mt-1">{formatCurrency(report.netProfit)}</p>
                </div>
              </Card>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No Data Loaded</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Upload your courier CSV file above to generate the profit report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
