import React, { useState, useEffect, useMemo } from 'react';
import { Upload, DollarSign, Users, PieChart, TrendingUp, FileText, Settings, X, Plus, Trash2, Download, Calendar, Edit2, RefreshCw, Filter, FileDown, UserCog } from 'lucide-react';

// --- Pricing Configuration (Default) ---
const INITIAL_PRICING = {
  "boom wash": {
    selling: 1000,
    tiers: [
      { limit: 300, cost: 300 },
      { limit: Infinity, cost: 100 }
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

// --- Initial Partner Info ---
const INITIAL_PARTNERS = {
  samila: {
    id: 'samila',
    shortName: 'Samila',
    fullName: 'Y.Samila Vishwaraj Priyadarshana De Silva',
    code: 'EMP_0001',
    idNumber: '', 
    role: 'Investor & Partner',
    designation: 'Director',
    department: 'Management',
    bankName: 'Sampath Bank',
    accountNo: '1234 5678 9012',
    deductions: { loan: 0, epf: 0, etf: 0, other: 0 }
  },
  krishan: {
    id: 'krishan',
    shortName: 'Krishan',
    fullName: 'Krishan Suranjith De Silva',
    code: 'EMP_0002',
    idNumber: '',
    role: 'Working Partner',
    designation: 'Sales Executive',
    department: 'Sales & Operations',
    bankName: 'Commercial Bank',
    accountNo: '8888 7777 6666',
    deductions: { loan: 0, epf: 0, etf: 0, other: 0 }
  },
  udev: {
    id: 'udev',
    shortName: 'Udev',
    fullName: 'Udev Sehath Sooriyaarachchi',
    code: 'EMP_0003',
    idNumber: '',
    role: 'Working Partner',
    designation: 'Operations Manager',
    department: 'Marketing & Sales',
    bankName: 'HNB',
    accountNo: '1111 2222 3333',
    deductions: { loan: 0, epf: 0, etf: 0, other: 0 }
  },
  sandun: {
    id: 'sandun',
    shortName: 'Sandun',
    fullName: 'Sandun Nayanake Subasinghe',
    code: 'EMP_0004',
    idNumber: '',
    role: 'Working Partner',
    designation: 'Sales Executive',
    department: 'Sales & Operations',
    bankName: 'BOC',
    accountNo: '5555 4444 3333',
    deductions: { loan: 0, epf: 0, etf: 0, other: 0 }
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
  
  // --- State ---
  const [expenseList, setExpenseList] = useState(() => {
    const saved = localStorage.getItem('ppm_expenses');
    return saved ? JSON.parse(saved) : [
       { id: 'init_1', date: new Date().toISOString().split('T')[0], category: 'advertising', description: 'Initial Ad Budget', amount: 300000 }
    ];
  });

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'advertising',
    description: '',
    amount: ''
  });

  const [pricing, setPricing] = useState(() => {
    const saved = localStorage.getItem('ppm_pricing');
    return saved ? JSON.parse(saved) : INITIAL_PRICING;
  });

  const [partners, setPartners] = useState(() => {
    const saved = localStorage.getItem('ppm_partners');
    const loaded = saved ? JSON.parse(saved) : INITIAL_PARTNERS;
    // Migration: ensure idNumber & deductions exist
    Object.keys(loaded).forEach(key => {
      if (!loaded[key].idNumber) loaded[key].idNumber = '';
      if (!loaded[key].deductions) loaded[key].deductions = { loan: 0, epf: 0, etf: 0, other: 0 };
    });
    return loaded;
  });

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [libsLoaded, setLibsLoaded] = useState(false);
  
  // Partner Edit State
  const [editingPartnerKey, setEditingPartnerKey] = useState(null);
  const [tempPartnerData, setTempPartnerData] = useState(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('ppm_expenses', JSON.stringify(expenseList)); }, [expenseList]);
  useEffect(() => { localStorage.setItem('ppm_pricing', JSON.stringify(pricing)); }, [pricing]);
  useEffect(() => { localStorage.setItem('ppm_partners', JSON.stringify(partners)); }, [partners]);

  // Load Libraries
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadLibraries = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        if (window.jspdf && window.jspdf.jsPDF) {
          window.jsPDF = window.jspdf.jsPDF;
        }
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js');
        setLibsLoaded(true);
      } catch (err) {
        console.error("Failed to load libraries", err);
      }
    };
    loadLibraries();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && window.Papa) {
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

  // --- Partner Editing ---
  const startEditPartner = (key) => {
    setEditingPartnerKey(key);
    // Ensure deductions object exists in temp data
    const data = { ...partners[key] };
    if (!data.deductions) data.deductions = { loan: 0, epf: 0, etf: 0, other: 0 };
    setTempPartnerData(data);
    setIsAddingPartner(false);
  };

  const startAddPartner = () => {
    const newId = `partner_${Date.now()}`;
    setEditingPartnerKey(newId);
    setTempPartnerData({
      id: newId,
      shortName: '',
      fullName: '',
      code: '',
      idNumber: '',
      role: 'Working Partner',
      designation: '',
      department: '',
      bankName: '',
      accountNo: '',
      deductions: { loan: 0, epf: 0, etf: 0, other: 0 }
    });
    setIsAddingPartner(true);
  };

  const savePartnerEdit = () => {
    if (tempPartnerData && tempPartnerData.shortName) {
      setPartners(prev => ({
        ...prev,
        [editingPartnerKey]: tempPartnerData
      }));
      setEditingPartnerKey(null);
      setTempPartnerData(null);
      setIsAddingPartner(false);
    } else {
      alert("Short Name is required.");
    }
  };

  const deletePartner = (key) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      setPartners(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // --- Expense Handlers ---
  const handleAddOrUpdateExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    
    if (editingExpenseId) {
      setExpenseList(prev => prev.map(item => 
        item.id === editingExpenseId 
          ? { ...item, ...newExpense, amount: parseFloat(newExpense.amount) }
          : item
      ));
      setEditingExpenseId(null);
    } else {
      const item = {
        id: Date.now(),
        date: newExpense.date,
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount)
      };
      setExpenseList(prev => [item, ...prev]);
    }
    setNewExpense(prev => ({ ...prev, description: '', amount: '' }));
  };

  const handleEditExpense = (item) => {
    setNewExpense({
      date: item.date,
      category: item.category,
      description: item.description,
      amount: item.amount
    });
    setEditingExpenseId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setNewExpense(prev => ({ ...prev, description: '', amount: '' }));
  };

  const handleDeleteExpense = (id) => {
    setExpenseList(prev => prev.filter(item => item.id !== id));
    if (editingExpenseId === id) handleCancelEdit();
  };

  // --- Pricing Handlers ---
  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    const key = newProductName.trim().toLowerCase();
    if (pricing[key]) {
      alert('Product already exists');
      return;
    }
    setPricing(prev => ({
      ...prev,
      [key]: { selling: 0, tiers: [{ limit: Infinity, cost: 0 }] }
    }));
    setNewProductName('');
  };

  const handleDeleteProduct = (key) => {
    if (window.confirm(`Delete pricing for "${key}"?`)) {
      const newPricing = { ...pricing };
      delete newPricing[key];
      setPricing(newPricing);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  // --- Calculation Logic ---
  const report = useMemo(() => {
    if (!csvData.length) return null;

    const counts = {};
    const startDateObj = dateRange.start ? new Date(dateRange.start) : null;
    const endDateObj = dateRange.end ? new Date(dateRange.end) : null;
    
    if (endDateObj) endDateObj.setHours(23, 59, 59, 999);

    let filteredRowCount = 0;

    csvData.forEach(row => {
      const rowDateStr = row['ORDER DATE'];
      if (startDateObj || endDateObj) {
        if (!rowDateStr) return;
        const cleanDateStr = rowDateStr.trim();
        const rowDate = new Date(cleanDateStr);
        if (isNaN(rowDate.getTime())) return;

        if (startDateObj && rowDate < startDateObj) return;
        if (endDateObj && rowDate > endDateObj) return;
      }

      const rawDesc = row['PARCEL DESCRIPTION'] || "";
      const name = rawDesc.split(' (')[0].trim();
      const normalizedName = name.toLowerCase();
      if (normalizedName && rawDesc) {
        counts[normalizedName] = (counts[normalizedName] || 0) + 1;
        filteredRowCount++;
      }
    });

    let totalRevenue = 0;
    let totalCOGS = 0;
    const productBreakdown = [];

    Object.keys(counts).forEach(prodKey => {
      const count = counts[prodKey];
      const priceConfig = pricing[prodKey] || { selling: 0, tiers: [{ limit: Infinity, cost: 0 }] };
      const revenue = count * priceConfig.selling;

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
      const displayName = prodKey.replace(/\b\w/g, l => l.toUpperCase());
      const gross = revenue - cost;
      const margin = revenue > 0 ? (gross / revenue) * 100 : 0;

      productBreakdown.push({
        name: displayName,
        count: count,
        revenue: revenue,
        cogs: cost,
        gross: gross,
        margin: margin
      });
    });

    productBreakdown.sort((a, b) => b.count - a.count);

    const grossProfit = totalRevenue - totalCOGS;
    
    let filteredExpenses = expenseList;
    if (startDateObj || endDateObj) {
      filteredExpenses = expenseList.filter(item => {
         const expDate = new Date(item.date);
         if (startDateObj && expDate < startDateObj) return false;
         if (endDateObj && expDate > endDateObj) return false;
         return true;
      });
    }

    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    const partnerKeys = Object.keys(partners);
    const investors = partnerKeys.filter(k => partners[k].role.toLowerCase().includes('investor'));
    const workingPartners = partnerKeys.filter(k => !partners[k].role.toLowerCase().includes('investor'));

    const investorShareTotal = netProfit * 0.50;
    const workingShareTotal = netProfit * 0.50;

    const investorShare = investors.length > 0 ? investorShareTotal / investors.length : 0;
    const workingShare = workingPartners.length > 0 ? workingShareTotal / workingPartners.length : 0;

    const shares = {
      investors: investors.reduce((acc, key) => ({...acc, [key]: investorShare}), {}),
      workers: workingPartners.reduce((acc, key) => ({...acc, [key]: workingShare}), {})
    };

    return {
      filteredRowCount,
      productBreakdown,
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit,
      shares,
      investorKeys: investors,
      workerKeys: workingPartners
    };
  }, [csvData, expenseList, pricing, dateRange, partners]);

  // --- Individual Salary Slip Export ---
  const handleDownloadSlip = (partnerKey, grossAmount) => {
     if (!window.jsPDF) {
      alert("PDF Library not loaded yet. Please wait.");
      return;
    }

    const partner = partners[partnerKey];
    if (!partner) return;

    // Use window.jspdf.jsPDF if window.jsPDF is undefined
    const jsPDFConstructor = window.jsPDF || window.jspdf.jsPDF;
    if (!jsPDFConstructor) {
        alert("PDF Library error. Please refresh the page.");
        return;
    }

    const doc = new jsPDFConstructor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // --- Header ---
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("AroBazzar", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("No. 123, Main Street, Colombo, Sri Lanka", 15, 26);
    doc.text("Payslip for the period of: " + (new Date().toLocaleString('default', { month: 'long', year: 'numeric' })), 15, 32);

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("SALARY SLIP", 195, 20, { align: 'right' });

    // --- Employee Details ---
    let y = 55;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y-5, 195, y-5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYEE DETAILS", 15, y);
    y += 8;

    const col1 = 15;
    const col2 = 60;
    const col3 = 110;
    const col4 = 150;

    doc.setFont("helvetica", "normal");
    doc.text("Name:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(partner.fullName, col2, y);
    
    doc.setFont("helvetica", "normal");
    doc.text("Designation:", col3, y);
    doc.text(partner.designation, col4, y);
    y += 6;

    doc.text("Employee ID:", col1, y);
    doc.text(partner.code, col2, y);

    doc.text("Department:", col3, y);
    doc.text(partner.department, col4, y);
    y += 6;

    doc.text("ID Number:", col1, y);
    doc.text(partner.idNumber || "N/A", col2, y);
    y += 12;

    // --- Earnings & Deductions Calculations ---
    const deductions = partner.deductions || { loan: 0, epf: 0, etf: 0, other: 0 };
    const totalDeductions = (parseFloat(deductions.loan)||0) + (parseFloat(deductions.epf)||0) + (parseFloat(deductions.etf)||0) + (parseFloat(deductions.other)||0);
    const netPay = grossAmount - totalDeductions;

    // Simulate Salary Breakdown
    const basicSalary = grossAmount * 0.60;
    const allowances = grossAmount * 0.40;

    // --- Table Headers ---
    doc.line(15, y, 195, y);
    y += 8;
    
    doc.setFont("helvetica", "bold");
    doc.text("EARNINGS", 15, y);
    doc.text("AMOUNT", 90, y, { align: 'right' });
    doc.text("DEDUCTIONS", 110, y);
    doc.text("AMOUNT", 195, y, { align: 'right' });
    y += 4;
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFont("helvetica", "normal");

    // Row 1
    doc.text("Basic Salary", 15, y);
    doc.text(formatCurrency(basicSalary), 90, y, { align: 'right' });
    doc.text("Salary Loan", 110, y);
    doc.text(formatCurrency(deductions.loan || 0), 195, y, { align: 'right' });
    y += 6;

    // Row 2
    doc.text("Allowances (Profit Share)", 15, y);
    doc.text(formatCurrency(allowances), 90, y, { align: 'right' });
    doc.text("EPF / ETF", 110, y);
    doc.text(formatCurrency((deductions.epf || 0) + (deductions.etf || 0)), 195, y, { align: 'right' });
    y += 6;

    // Row 3
    doc.text("Bonus / Incentives", 15, y);
    doc.text("0.00", 90, y, { align: 'right' });
    doc.text("Other Deductions", 110, y);
    doc.text(formatCurrency(deductions.other || 0), 195, y, { align: 'right' });
    y += 10;

    doc.line(15, y, 195, y);
    y += 8;

    // --- Totals ---
    doc.setFont("helvetica", "bold");
    doc.text("Gross Earnings", 15, y);
    doc.text(formatCurrency(grossAmount), 90, y, { align: 'right' });
    doc.text("Total Deductions", 110, y);
    doc.text(formatCurrency(totalDeductions), 195, y, { align: 'right' });
    y += 12;

    // --- Net Pay Box ---
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 25, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, y, 180, 25);

    y += 10;
    doc.setFontSize(12);
    doc.text("NET PAY (Take Home)", 25, y);
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(formatCurrency(netPay), 185, y, { align: 'right' });
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    doc.text("(Please confirm amount in words upon receipt)", 25, y);
    
    y += 25;

    // --- Other Info ---
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT DETAILS", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text("Bank Name:", 15, y);
    doc.text(partner.bankName || "____________________", 50, y);
    doc.text("Payment Mode:", 110, y);
    doc.text("Bank Transfer / Cash", 150, y);
    y += 6;
    doc.text("Account No:", 15, y);
    doc.text(partner.accountNo || "____________________", 50, y);
    
    y += 30;

    // --- Signatures ---
    doc.line(15, y, 75, y);
    doc.text("Employee Signature", 15, y+5);

    doc.line(135, y, 195, y);
    doc.text("Authorized Signature (Director)", 135, y+5);

    doc.save(`${partner.fullName.replace(/ /g, '_')}_Salary_Slip.pdf`);
  };

  // --- Main Report PDF Export ---
  const handleExportPDF = () => {
    if (!report || !libsLoaded || !window.jsPDF) {
      alert("PDF Library not loaded yet. Please wait.");
      return;
    }

    const doc = new window.jsPDF();
    const dateStr = new Date().toLocaleDateString();
    let periodStr = "All Time";
    if (dateRange.start || dateRange.end) {
      periodStr = `${dateRange.start || 'Start'} to ${dateRange.end || 'Now'}`;
    }

    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("AroBazzar Profit Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, 14, 26);
    doc.text(`Reporting Period: ${periodStr}`, 14, 31);

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Financial Summary", 14, 45);
    const summaryData = [
      ["Total Revenue", formatCurrency(report.totalRevenue)],
      ["Cost of Goods Sold", formatCurrency(report.totalCOGS)],
      ["Gross Profit", formatCurrency(report.grossProfit)],
      ["Total Expenses", formatCurrency(report.totalExpenses)],
      ["NET PROFIT", formatCurrency(report.netProfit)]
    ];
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
    });

    doc.text("Profit Distribution", 14, doc.lastAutoTable.finalY + 15);
    const distRows = [];
    report.investorKeys.forEach(k => {
      distRows.push([`${partners[k].fullName} (${partners[k].code})`, formatCurrency(report.shares.investors[k])]);
    });
    report.workerKeys.forEach(k => {
      distRows.push([`${partners[k].fullName} (${partners[k].code})`, formatCurrency(report.shares.workers[k])]);
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Partner', 'Share Amount']],
      body: distRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    doc.text("Product Performance", 14, doc.lastAutoTable.finalY + 15);
    const productData = report.productBreakdown.map(item => [
      item.name,
      item.count,
      formatCurrency(item.revenue),
      `${item.margin.toFixed(1)}%`,
      formatCurrency(item.gross)
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Product', 'Qty', 'Revenue', 'Margin', 'Gross Profit']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'right' } }
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("AroBazzar Internal Document", 14, pageHeight - 10);
    doc.save(`AroBazzar_Report_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  const getCategoryTotal = (cat) => {
    const startDateObj = dateRange.start ? new Date(dateRange.start) : null;
    const endDateObj = dateRange.end ? new Date(dateRange.end) : null;
    return expenseList.filter(e => {
       if (e.category !== cat) return false;
       if (startDateObj || endDateObj) {
         const expDate = new Date(e.date);
         if (startDateObj && expDate < startDateObj) return false;
         if (endDateObj && expDate > endDateObj) return false;
       }
       return true;
    }).reduce((sum, e) => sum + e.amount, 0);
  };

  const maxRevenue = report ? Math.max(...report.productBreakdown.map(p => p.revenue)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg text-white"><TrendingUp className="w-6 h-6"/></div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 leading-none">AroBazzar Manager</h1>
               <p className="text-xs text-slate-500 mt-1">v2.8 • Partner Profit System</p>
             </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
             <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                <input type="date" className="bg-transparent border-none text-xs px-2 py-1.5 focus:ring-0 text-slate-700 w-28" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} title="Start Date"/>
                <span className="text-slate-300">-</span>
                <input type="date" className="bg-transparent border-none text-xs px-2 py-1.5 focus:ring-0 text-slate-700 w-28" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} title="End Date"/>
                {(dateRange.start || dateRange.end) && (
                  <button onClick={() => setDateRange({start:'', end:''})} className="px-2 text-slate-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                )}
             </div>
             <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
             <button onClick={() => setShowPartners(true)} className="flex items-center space-x-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 text-slate-700 text-sm transition">
                <Users className="w-4 h-4" /><span className="hidden sm:inline">Partners</span>
             </button>
             <button onClick={handleExportPDF} disabled={!report || !libsLoaded} className={`flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm transition ${report && libsLoaded ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
              <Download className="w-4 h-4" /><span className="hidden sm:inline">Export Report</span>
            </button>
             <button onClick={() => setShowSettings(!showSettings)} className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition">
              <Settings className="w-4 h-4" /><span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>

        {/* Partner Management Modal */}
        {showPartners && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/> Manage Partners</h2>
                <div className="flex gap-2">
                  <button onClick={startAddPartner} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-blue-700"><Plus className="w-3 h-3"/> Add New</button>
                  <button onClick={() => setShowPartners(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(partners).map(([key, partner]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800">{partner.fullName} <span className="text-xs text-slate-400 font-normal">({partner.shortName})</span></p>
                      <p className="text-xs text-slate-500">{partner.code} • {partner.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditPartner(key)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => deletePartner(key)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Partner Edit/Add Modal */}
        {(editingPartnerKey && tempPartnerData) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{zIndex: 60}}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-500"/> {isAddingPartner ? 'Add New Partner' : 'Edit Partner Details'}</h2>
                <button onClick={() => { setEditingPartnerKey(null); setIsAddingPartner(false); }}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Short Name (ID)</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.shortName} onChange={(e) => setTempPartnerData({...tempPartnerData, shortName: e.target.value})} disabled={!isAddingPartner} title={isAddingPartner ? "Used for system ID" : "Cannot change ID"} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Employee Code</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.code} onChange={(e) => setTempPartnerData({...tempPartnerData, code: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Legal Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.fullName} onChange={(e) => setTempPartnerData({...tempPartnerData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Number (NIC/Passport)</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.idNumber} onChange={(e) => setTempPartnerData({...tempPartnerData, idNumber: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Role</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.role} onChange={(e) => setTempPartnerData({...tempPartnerData, role: e.target.value})}>
                      <option value="Working Partner">Working Partner</option>
                      <option value="Investor & Partner">Investor & Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Designation</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.designation} onChange={(e) => setTempPartnerData({...tempPartnerData, designation: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Department</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.department} onChange={(e) => setTempPartnerData({...tempPartnerData, department: e.target.value})} />
                </div>
                
                {/* Deductions Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 text-red-600">Monthly Deductions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Salary Loan</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.deductions?.loan || 0} onChange={(e) => setTempPartnerData({...tempPartnerData, deductions: {...tempPartnerData.deductions, loan: parseFloat(e.target.value) || 0}})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Other Deductions</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.deductions?.other || 0} onChange={(e) => setTempPartnerData({...tempPartnerData, deductions: {...tempPartnerData.deductions, other: parseFloat(e.target.value) || 0}})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">EPF (8%)</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.deductions?.epf || 0} onChange={(e) => setTempPartnerData({...tempPartnerData, deductions: {...tempPartnerData.deductions, epf: parseFloat(e.target.value) || 0}})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ETF (3%)</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.deductions?.etf || 0} onChange={(e) => setTempPartnerData({...tempPartnerData, deductions: {...tempPartnerData.deductions, etf: parseFloat(e.target.value) || 0}})} />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Bank Name</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.bankName} onChange={(e) => setTempPartnerData({...tempPartnerData, bankName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Number</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" value={tempPartnerData.accountNo} onChange={(e) => setTempPartnerData({...tempPartnerData, accountNo: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t bg-slate-50 flex justify-end gap-2">
                <button onClick={() => { setEditingPartnerKey(null); setIsAddingPartner(false); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
                <button onClick={savePartnerEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold">Pricing Configuration</h2>
                <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-slate-100 p-4 rounded-lg flex gap-3 items-center">
                   <input type="text" placeholder="New Product Name" className="flex-1 border-0 rounded shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}/>
                   <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-blue-700 flex items-center"><Plus className="w-4 h-4 mr-1" /> Add</button>
                </div>
                <div className="grid gap-4">
                  {Object.entries(pricing).map(([key, config]) => (
                    <div key={key} className="border border-slate-200 p-4 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold capitalize text-slate-800 text-sm">{key}</h3>
                          <button onClick={() => handleDeleteProduct(key)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</label>
                             <input type="number" value={config.selling} onChange={(e) => setPricing({...pricing, [key]: {...pricing[key], selling: parseFloat(e.target.value)}})} className="border rounded px-2 py-1.5 w-full text-sm mt-1"/>
                         </div>
                         <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Tiers (Qty @ Cost)</label>
                            {config.tiers.map((tier, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input type="number" disabled={tier.limit === Infinity} value={tier.limit === Infinity ? 999999 : tier.limit} onChange={(e) => { const newTiers = [...pricing[key].tiers]; newTiers[idx].limit = parseFloat(e.target.value); setPricing({...pricing, [key]: {...pricing[key], tiers: newTiers}}); }} className="border rounded px-2 py-1 w-20 text-sm" title="Quantity Limit"/>
                                <span className="text-slate-300 text-xs">@</span>
                                <input type="number" value={tier.cost} onChange={(e) => { const newTiers = [...pricing[key].tiers]; newTiers[idx].cost = parseFloat(e.target.value); setPricing({...pricing, [key]: {...pricing[key], tiers: newTiers}}); }} className="border rounded px-2 py-1 w-20 text-sm" title="Unit Cost"/>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 flex flex-col justify-center">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center text-sm uppercase tracking-wide"><Upload className="w-4 h-4 mr-2 text-blue-600" /> Data Source</h3>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-8 text-center hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer group flex-1 flex flex-col justify-center items-center">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform"><FileText className="w-8 h-8 text-slate-400 group-hover:text-blue-600" /></div>
              <p className="text-sm font-semibold text-slate-700">{fileName ? fileName : "Upload CSV File"}</p>
              <p className="text-xs text-slate-400 mt-1">Drag & drop or click to browse</p>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-semibold text-slate-700 flex items-center text-sm uppercase tracking-wide"><TrendingUp className="w-4 h-4 mr-2 text-red-600" /> Expenses </h3>
               {(dateRange.start || dateRange.end) && (<span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Filtered by date</span>)}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
               <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-center"><span className="text-[10px] text-red-400 uppercase font-bold block mb-1">Advertising</span><span className="font-bold text-lg">{formatCurrency(getCategoryTotal('advertising'))}</span></div>
               <div className="p-3 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 text-center"><span className="text-[10px] text-orange-400 uppercase font-bold block mb-1">Returns</span><span className="font-bold text-lg">{formatCurrency(getCategoryTotal('returns'))}</span></div>
               <div className="p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-center"><span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Other</span><span className="font-bold text-lg">{formatCurrency(getCategoryTotal('other'))}</span></div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-48 border border-slate-200 rounded-lg mb-4 bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 sticky top-0 text-xs uppercase text-slate-500 font-semibold z-10"><tr><th className="px-3 py-2 bg-slate-50">Date</th><th className="px-3 py-2 bg-slate-50">Description</th><th className="px-3 py-2 bg-slate-50">Cat</th><th className="px-3 py-2 text-right bg-slate-50">Amount</th><th className="px-3 py-2 w-16 bg-slate-50"></th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseList.length === 0 && (<tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No expenses recorded</td></tr>)}
                  {expenseList.map(item => (
                    <tr key={item.id} className={`hover:bg-slate-50 group ${editingExpenseId === item.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500 text-xs">{item.date}</td><td className="px-3 py-2 text-slate-700 font-medium">{item.description}</td>
                      <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${item.category === 'advertising' ? 'bg-red-100 text-red-600' : item.category === 'returns' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>{item.category.substring(0,3)}</span></td>
                      <td className="px-3 py-2 text-right text-slate-700 font-mono">{formatCurrency(item.amount)}</td>
                      <td className="px-3 py-2 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditExpense(item)} className="text-blue-400 hover:text-blue-600 p-1"><Edit2 className="w-3 h-3" /></button><button onClick={() => handleDeleteExpense(item.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`p-3 rounded-lg border ${editingExpenseId ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'} grid grid-cols-12 gap-2 items-end transition-colors`}>
               <div className="col-span-3"><label className="text-[10px] uppercase font-bold text-slate-400">Date</label><input type="date" className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} /></div>
               <div className="col-span-3"><label className="text-[10px] uppercase font-bold text-slate-400">Category</label><select className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}><option value="advertising">Advertising</option><option value="returns">Return Charge</option><option value="other">Other</option></select></div>
               <div className="col-span-3"><label className="text-[10px] uppercase font-bold text-slate-400">Description</label><input type="text" placeholder="Description" className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} /></div>
               <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Amount</label><input type="number" placeholder="0.00" className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddOrUpdateExpense()} /></div>
               <div className="col-span-1 flex gap-1">
                 {editingExpenseId ? (<><button onClick={handleAddOrUpdateExpense} className="flex-1 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center" title="Save Changes"><RefreshCw className="w-3 h-3" /></button><button onClick={handleCancelEdit} className="flex-1 py-1.5 bg-slate-300 text-slate-600 rounded hover:bg-slate-400 flex justify-center items-center" title="Cancel"><X className="w-3 h-3" /></button></>) : (<button onClick={handleAddOrUpdateExpense} className="w-full py-1.5 bg-slate-800 text-white rounded hover:bg-slate-900 flex justify-center items-center" title="Add Expense"><Plus className="w-4 h-4" /></button>)}
               </div>
            </div>
          </Card>
        </div>

        {report ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Revenue" value={formatCurrency(report.totalRevenue)} subValue={`${report.filteredRowCount} Orders`} icon={DollarSign} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <StatCard title="Cost of Goods" value={formatCurrency(report.totalCOGS)} subValue="Product Cost" icon={PieChart} colorClass="text-amber-600" bgClass="bg-amber-50" />
              <StatCard title="Expenses" value={formatCurrency(report.totalExpenses)} subValue="Ads + Ops" icon={TrendingUp} colorClass="text-red-600" bgClass="bg-red-50" />
              <StatCard title="Net Profit" value={formatCurrency(report.netProfit)} subValue="Final Take-home" icon={DollarSign} colorClass="text-blue-600" bgClass="bg-blue-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-white"><h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Product Performance</h3></div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3 text-center">Count</th><th className="px-5 py-3 text-right">Revenue</th><th className="px-5 py-3 text-center">Margin %</th><th className="px-5 py-3 text-right">Gross Profit</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {report.productBreakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3 font-medium text-slate-900 relative">{item.name}<div className="absolute bottom-0 left-0 h-0.5 bg-blue-100" style={{ width: `${(item.revenue / (report ? Math.max(...report.productBreakdown.map(p => p.revenue)) : 1)) * 100}%` }}></div></td>
                          <td className="px-5 py-3 text-center text-slate-600">{item.count}</td>
                          <td className="px-5 py-3 text-right text-slate-600 font-mono">{formatCurrency(item.revenue)}</td>
                          <td className="px-5 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium ${item.margin > 40 ? 'bg-emerald-100 text-emerald-700' : item.margin > 20 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{item.margin.toFixed(0)}%</span></td>
                          <td className="px-5 py-3 text-right font-bold text-slate-800 font-mono">{formatCurrency(item.gross)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900 text-white border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-6 flex items-center text-white"><Users className="w-5 h-5 mr-2 text-indigo-400" /> Profit Distribution</h3>
                  <div className="space-y-4">
                    {/* Investors */}
                    {report.investorKeys.map(key => {
                      const partner = partners[key];
                      return (
                        <div key={key} className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative group">
                          <button onClick={() => startEditPartner(key)} className="absolute top-2 right-2 text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition p-1"><Edit2 className="w-4 h-4"/></button>
                          <div className="flex justify-between items-end mb-1">
                            <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{partner.shortName}</p><p className="text-[10px] text-slate-500">{partner.code} ({partner.role})</p></div>
                            <div className="flex items-center gap-3"><p className="text-2xl font-bold text-white">{formatCurrency(report.shares.investors[key])}</p><button onClick={() => handleDownloadSlip(key, report.shares.investors[key])} className="bg-slate-700 hover:bg-blue-600 text-white p-1.5 rounded transition" title="Download Salary Slip"><FileDown className="w-4 h-4" /></button></div>
                          </div>
                          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2"><div className="bg-indigo-500 h-full w-1/2"></div></div>
                        </div>
                      );
                    })}

                    {/* Working Partners */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <div className="mb-3 flex justify-between items-center"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Working Partners</p><span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded">33% Each</span></div>
                      <div className="space-y-3">
                        {report.workerKeys.map(key => {
                          const partner = partners[key];
                          return (
                            <div key={key} className="flex justify-between items-center text-sm border-b border-slate-700 pb-2 last:border-0 last:pb-0 group relative">
                              <button onClick={() => startEditPartner(key)} className="absolute left-[-20px] text-slate-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition p-1"><Edit2 className="w-3 h-3"/></button>
                              <div><span className="text-slate-300 block">{partner.shortName}</span><span className="text-[10px] text-slate-500 block">{partner.code}</span></div>
                              <div className="flex items-center gap-3"><span className="font-mono text-emerald-400 font-medium">{formatCurrency(report.shares.workers[key])}</span><button onClick={() => handleDownloadSlip(key, report.shares.workers[key])} className="text-slate-400 hover:text-white transition" title="Download Salary Slip"><FileDown className="w-4 h-4" /></button></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-center"><p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Total Net Profit</p><p className="text-3xl font-bold text-white mt-1 tracking-tight">{formatCurrency(report.netProfit)}</p></div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4"><Upload className="w-8 h-8 text-slate-400" /></div>
            <h3 className="text-lg font-medium text-slate-900">Ready to Analyze</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Upload your CSV file to generate the profit report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
