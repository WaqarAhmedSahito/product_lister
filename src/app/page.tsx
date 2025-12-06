'use client';
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Printer, ShoppingCart, User, Calendar, UserRound } from 'lucide-react';

interface Header {
  customerName: string;
  phone: string;
  salesmanName: string;
  date: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

interface Item {
  id: number;
  desc: string;
  qty: number;
  price: number;
  discount: number;
  gstPercent: number;
}

// Update the CleanInput component to accept all standard input props
const CleanInput: React.FC<{
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: string;
  align?: 'left' | 'right' | 'center';
  min?: string | number; 
  max?: string | number; 
  step?: string | number; 
}> = ({ value, onChange, className = "", placeholder, style, type = "text", align = "left", min, max, step }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-transparent outline-none placeholder-gray-400 hover:bg-blue-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-300 transition-all rounded px-2 py-1 w-full ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    style={style}
    min={min}
    max={max}
    step={step}
  />
);

const InvoiceApp: React.FC = () => {

  const [header, setHeader] = useState<Header>({
    companyName: '---',
    companyAddress: '---',
    companyPhone: '+92 ',
    companyEmail: '',
    customerName: '',
    phone: '',
    salesmanName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<Item[]>([]);
  const [terms, setTerms] = useState("Thank you for doing business with us. Goods once sold will not be taken back. All disputes subject to Karachi jurisdiction.");
  const [isPrinting, setIsPrinting] = useState(false);

  // --- Calculations ---
  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const amount = item.qty * item.price;
      const netAmount = amount - item.discount;
      return { ...item, amount, netAmount };
    });
  }, [items]);

  const totals = useMemo(() => {
    return calculatedItems.reduce(
      (acc, item) => ({
        subTotal: acc.subTotal + item.amount,
        discount: acc.discount + item.discount,
        total: acc.total + item.netAmount,
      }),
      { subTotal: 0, discount: 0, total: 0 }
    );
  }, [calculatedItems]);

  // --- Handlers ---
  const handleHeaderChange = (field: keyof Header, value: string) => {
    setHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: number, field: keyof Item, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, {
      id: newId,
      desc: '',
      qty: 1,
      price: 0,
      discount: 0,
      gstPercent: 0
    }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const amountInWords = (amount: number) => {
    const words = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (amount === 0) return "Zero Rupees Only";

    let result = "Rupees ";
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    const thousands = Math.floor((amount % 100000) / 1000);
    const hundreds = Math.floor((amount % 1000) / 100);
    const tensAndOnes = Math.floor(amount % 100);

    if (crores > 0) result += `${words[crores] || `${tens[Math.floor(crores / 10)]} ${words[crores % 10]}`} Crore `;
    if (lakhs > 0) result += `${words[lakhs] || `${tens[Math.floor(lakhs / 10)]} ${words[lakhs % 10]}`} Lakh `;
    if (thousands > 0) result += `${words[thousands] || `${tens[Math.floor(thousands / 10)]} ${words[thousands % 10]}`} Thousand `;
    if (hundreds > 0) result += `${words[hundreds]} Hundred `;
    if (tensAndOnes > 0) {
      if (tensAndOnes < 20) {
        result += `${words[tensAndOnes]} `;
      } else {
        result += `${tens[Math.floor(tensAndOnes / 10)]} ${words[tensAndOnes % 10]} `;
      }
    }

    const paisa = Math.round((amount - Math.floor(amount)) * 100);
    if (paisa > 0) {
      result += `and ${paisa}/100`;
    }

    return result + " Only";
  };

  return (
    <div className={`min-h-screen ${isPrinting ? 'bg-white' : 'bg-gradient-to-br from-blue-50 to-gray-100'} p-4 md:p-8 flex justify-center items-start font-sans`}>

      {/* Print Styles - Optimized for single page */}
      <style>{`
        @media print {
          @page { 
            margin: 10mm !important; 
            size: A4 portrait !important; 
          }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { 
            display: none !important; 
          }
          .print-container { 
            box-shadow: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            width: 100% !important; 
            max-width: none !important;
            min-height: auto !important;
            height: auto !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
          }
          input, textarea, select { 
            border: none !important; 
            background: transparent !important; 
            padding: 0 !important; 
            box-shadow: none !important;
          }
          .print-page { 
            page-break-after: avoid !important; 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .compact-view {
            font-size: 0.75rem !important;
            line-height: 1.2 !important;
          }
          .compact-padding {
            padding: 0.25rem !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="w-full max-w-6xl space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 no-print">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cyan-700">Invoice Generator</h1>
              <p className="text-gray-600">Create professional invoices quickly</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-cyan-700">
                  Rs {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="bg-cyan-700 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition-all flex items-center gap-2 font-semibold"
              >
                <Printer size={20} />
                Print Invoice
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Customer Information Only */}
          <div className="lg:w-1/3 space-y-6 no-print">

            {/* Customer Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Customer Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <CleanInput
                    value={header.customerName}
                    onChange={(v) => handleHeaderChange('customerName', v)}
                    placeholder="Enter customer name"
                    className="border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <CleanInput
                    value={header.phone}
                    onChange={(v) => handleHeaderChange('phone', v)}
                    placeholder="Enter phone number"
                    className="border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <UserRound size={16} className="inline mr-1" />
                      Salesman Name
                    </label>
                    <CleanInput
                      value={header.salesmanName}
                      onChange={(v) => handleHeaderChange('salesmanName', v)}
                      placeholder="Salesman name"
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={16} className="inline mr-1" />
                      Date
                    </label>
                    <CleanInput
                      type="date"
                      value={header.date}
                      onChange={(v) => handleHeaderChange('date', v)}
                      className="border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Add Item Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={20} />
                Add New Item
              </h2>
              <p className="text-sm text-gray-600 mb-4">Click below to add a new item to your invoice</p>
              <button
                onClick={addItem}
                className="w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Plus size={20} /> Add New Item
              </button>
            </div>
          </div>

          {/* Right Column: Invoice Preview */}
          <div className="lg:w-2/3">
            {/* Invoice Preview Container - Optimized for single page */}
            <div className="print-container bg-white w-full min-h-[270mm] shadow-2xl relative flex flex-col rounded-xl overflow-hidden">

              {/* Company Header - Compact for print */}
              <div className="p-6 pb-3 bg-gradient-to-r from-cyan-50 to-white print:bg-white print:p-4">
                <div className="text-center mb-1">
                  <CleanInput
                    value={header.companyName}
                    onChange={(v) => handleHeaderChange('companyName', v)}
                    className="font-bold text-cyan-700 text-xl text-center mb-0.5 print:text-lg print:font-extrabold"
                    placeholder="Company Name"
                  />
                  <div className="text-xs text-gray-600 space-y-0.5 print:text-xs">
                    <CleanInput
                      value={header.companyAddress}
                      onChange={(v) => handleHeaderChange('companyAddress', v)}
                      placeholder="Company Address"
                      className="text-center print:text-xs"
                    />
                    <div className="flex flex-col items-center gap-0.5 print:flex-row print:justify-center print:gap-4">
                      <span>
                        Phone: <CleanInput
                          value={header.companyPhone}
                          onChange={(v) => handleHeaderChange('companyPhone', v)}
                          placeholder="Company Phone"
                          className="inline w-32 print:w-24"
                        />
                      </span>
                      {header.companyEmail && (
                        <span>
                          Email: <CleanInput
                            value={header.companyEmail}
                            onChange={(v) => handleHeaderChange('companyEmail', v)}
                            placeholder="Company Email"
                            className="inline w-40 print:w-32"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Title */}
                <div className="text-center my-4 print:my-3">
                  <div className="inline-block border-b-3 border-cyan-700 pb-1 print:border-b-2">
                    <h1 className="text-2xl font-bold text-cyan-700 print:text-xl">INVOICE</h1>
                  </div>
                </div>

                {/* Customer & Invoice Details - Compact layout */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4 print:flex-row print:gap-4 print:mb-3">
                  <div className="md:w-1/2 print:w-1/2">
                    <div className="bg-gray-50 p-3 rounded print:bg-transparent print:p-2 print:border">
                      <h3 className="font-bold text-xs text-gray-800 mb-1 print:text-xs">BILL TO</h3>
                      {header.customerName ? (
                        <>
                          <CleanInput
                            value={header.customerName}
                            onChange={(v) => handleHeaderChange('customerName', v)}
                            className="font-bold text-gray-900 text-base mb-0.5 print:text-sm"
                          />
                          {header.phone && (
                            <div className="text-xs flex items-center gap-0.5">
                              <span>📞</span>
                              <CleanInput
                                value={header.phone}
                                onChange={(v) => handleHeaderChange('phone', v)}
                                placeholder="Phone"
                                className="w-32 print:w-28"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 italic text-xs">No customer selected</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-1/2 print:w-1/2">
                    <div className="bg-gray-50 p-3 rounded print:bg-transparent print:p-2 print:border">
                      <h3 className="font-bold text-xs text-gray-800 mb-1 print:text-xs">SALESMAN</h3>
                      <CleanInput
                        value={header.salesmanName}
                        onChange={(v) => handleHeaderChange('salesmanName', v)}
                        className="font-bold text-right w-full print:text-sm"
                        placeholder="Salesman Name"
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded print:bg-transparent print:p-2 print:border">
                      <h3 className="font-bold text-xs text-gray-800 mb-1 print:text-xs">DATE</h3>
                      <div className="text-right">
                        <CleanInput
                          type="date"
                          value={header.date}
                          onChange={(v) => handleHeaderChange('date', v)}
                          className="font-medium text-right w-full print:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table - Compact view */}
              <div className="flex-grow px-6 print:px-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 print:py-8">
                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3 print:hidden" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2 print:text-base">No Items Added</h3>
                    <p className="text-gray-500 mb-6 print:text-sm">Add items to create your invoice</p>
                    <button
                      onClick={addItem}
                      className="bg-cyan-700 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition-all flex items-center gap-2 mx-auto no-print"
                    >
                      <Plus size={20} /> Add Your First Item
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="w-full border-collapse text-xs print:text-[10px]">
                      <thead>
                        <tr className="bg-cyan-700 text-white font-semibold print:bg-cyan-700">
                          <th className="py-2 px-2 text-left w-6 print:py-1 print:px-1">#</th>
                          <th className="py-2 px-2 text-left print:py-1 print:px-1">Item Description</th>
                          <th className="py-2 px-2 text-right w-14 print:py-1 print:px-1">Qty</th>
                          <th className="py-2 px-2 text-right w-20 print:py-1 print:px-1">Price</th>
                          <th className="py-2 px-2 text-right w-20 print:py-1 print:px-1">Discount</th>
                          <th className="py-2 px-2 text-right w-24 print:py-1 print:px-1">Amount</th>
                          <th className="w-6 no-print print:hidden"></th>
                        </tr>
                      </thead>
                      <tbody className="text-xs print:text-[10px]">
                        {calculatedItems.map((item, index) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 group print:border-b print:border-gray-200">
                            <td className="py-2 px-2 font-medium print:py-1 print:px-1">{index + 1}</td>
                            <td className="py-2 px-2 print:py-1 print:px-1">
                              <CleanInput
                                value={item.desc}
                                onChange={(v) => handleItemChange(item.id, 'desc', v)}
                                placeholder="Enter item description"
                                className="w-full print:text-[10px]"
                              />
                            </td>
                            <td className="py-2 px-2 text-right print:py-1 print:px-1">
                              <CleanInput
                                type="number"
                                value={item.qty}
                                onChange={(v) => handleItemChange(item.id, 'qty', parseFloat(v) || 0)}
                                align="right"
                                className="w-full print:text-[10px]"
                                min="1"
                              />
                            </td>
                            <td className="py-2 px-2 text-right print:py-1 print:px-1">
                              <div className="flex items-center justify-end gap-0.5">
                                <span className="text-gray-500 print:text-[9px]">Rs</span>
                                <CleanInput
                                  type="number"
                                  value={item.price}
                                  onChange={(v) => handleItemChange(item.id, 'price', parseFloat(v) || 0)}
                                  align="right"
                                  className="w-full print:text-[10px]"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right print:py-1 print:px-1">
                              <CleanInput
                                type="number"
                                value={item.discount}
                                onChange={(v) => handleItemChange(item.id, 'discount', parseFloat(v) || 0)}
                                align="right"
                                className="w-full print:text-[10px]"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-cyan-700 print:py-1 print:px-1 print:text-[11px]">
                              Rs {item.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-center no-print print:hidden">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button
                      onClick={addItem}
                      className="mt-3 text-cyan-700 hover:text-cyan-800 flex items-center gap-2 text-sm font-semibold hover:underline no-print"
                    >
                      <Plus size={16} /> Add New Item
                    </button>
                  </>
                )}
              </div>

              {/* Footer Section - Optimized for single page */}
              <div className="p-6 mt-auto print:p-4 print:mt-2">
                <div className="flex flex-col lg:flex-row gap-4 print:flex-row print:gap-3 print:text-xs">

                  {/* Left: Words & Terms */}
                  <div className="lg:w-2/3 space-y-4 print:w-2/3 print:space-y-2">
                    <div className="bg-white p-3 rounded border print:p-2 print:border-none">
                      <h4 className="font-bold text-xs text-gray-800 mb-1 print:text-xs">Amount in Words</h4>
                      <p className="text-xs text-gray-700 font-medium print:text-xs leading-tight">
                        {amountInWords(totals.total)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border print:p-2 print:border-none">
                      <h4 className="font-bold text-xs text-gray-800 mb-1 print:text-xs">Terms & Conditions</h4>
                      <textarea
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="w-full text-xs text-gray-700 resize-none outline-none bg-transparent print:text-xs print:leading-tight"
                        rows={2}
                        placeholder="Enter terms and conditions..."
                      />
                    </div>
                  </div>

                  {/* Right: Totals - Compact */}
                  <div className="lg:w-1/3 print:w-1/3">
                    <div className="bg-white p-4 rounded border space-y-2 print:p-3 print:space-y-1 print:border-none">
                      <div className="flex justify-between text-gray-600 print:text-xs">
                        <span>Sub Total:</span>
                        <span className="font-medium">Rs {totals.subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 print:text-xs">
                        <span>Discount:</span>
                        <span className="font-medium text-red-600">- Rs {totals.discount.toFixed(2)}</span>
                      </div>

                      <div className="border-t pt-2 mt-2 print:pt-1 print:mt-1">
                        <div className="flex justify-between items-center bg-cyan-700 text-white font-bold p-2 rounded print:p-1.5">
                          <span className="print:text-xs">TOTAL</span>
                          <span className="text-base print:text-sm">Rs {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t print:pt-1">
                        <div className="flex justify-between text-gray-600 print:text-xs">
                          <span>Amount Paid:</span>
                          <span>Rs 0.00</span>
                        </div>
                        <div className="flex justify-between text-gray-800 font-bold print:text-xs">
                          <span>Balance Due:</span>
                          <span>Rs {totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures - Compact */}
                <div className="flex justify-between items-end mt-6 pt-4 border-t print:mt-4 print:pt-2">
                  <div className="text-xs text-gray-500 print:text-[10px]">
                    <p>Thank you for your business!</p>
                    <p className="mt-0.5 print:mt-0">For queries, contact: {header.companyPhone}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold mb-6 print:text-xs print:mb-4">For: {header.companyName}</div>
                    <div className="text-xs font-bold border-t border-gray-700 pt-1 px-6 print:text-xs print:pt-0.5 print:px-4">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-4 flex flex-wrap gap-3 no-print">
              <button
                onClick={addItem}
                className="bg-white text-cyan-700 border border-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50 flex items-center gap-2"
              >
                <Plus size={16} /> Add Item
              </button>
              <button
                onClick={() => {
                  setItems([]);
                  handleHeaderChange('customerName', '');
                  handleHeaderChange('phone', '');
                  handleHeaderChange('salesmanName', '');
                }}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceApp;