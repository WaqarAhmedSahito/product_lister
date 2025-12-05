'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';

// --- Types ---
interface Header {
  customerCode: string;
  customerName: string;
  address: string;
  contact: string;
  salesmanCode: string;
  salesmanName: string;
  orderNo: string;
  date: string;
  custNtn: string;
  custCnic: string;
  custGst: string;
}

interface Item {
  id: number;
  code: string;
  desc: string;
  packSize: string;
  batchNo: string;
  qty: number;
  tp: number;
  mrp: number;
  discPercent: number;
  gstPercent: number;
  addGst: number;
  advTax: number;
}

interface CalculatedItem extends Item {
  grossAmount: number;
  discAmt: number;
  gstAmt: number;
  netAmount: number;
}

interface InputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
}

interface TableInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  type?: string;
  align?: 'left' | 'right' | 'center';
  rowId: number;
  field: string;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, rowId: number, field: string) => void;
  onFieldFocus: (rowId: number, field: string) => void;
  isFocused: boolean;
  className?: string; 
}

// --- Helper Components ---
const Input: React.FC<InputProps> = ({ name, value, onChange, className = "", style = {}, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    className={`bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full print:border-none px-1 ${className}`}
    style={style}
  />
);

const TableInput: React.FC<TableInputProps> = ({
  value,
  onChange,
  type = "text",
  align = "left",
  rowId,
  field,
  inputRefs,
  handleKeyDown,
  onFieldFocus,
  isFocused
}) => (
  <input
    ref={(el) => {
      const refKey = `${rowId}-${field}`;
      if (inputRefs && inputRefs.current) {
        inputRefs.current[refKey] = el;
      }
    }}
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => handleKeyDown(e, rowId, field)}
    onFocus={() => onFieldFocus(rowId, field)}
    className={`w-full bg-transparent p-1 focus:bg-blue-50 focus:outline-none print:p-0 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${isFocused ? 'ring-1 ring-blue-500' : ''
      } print:ring-0 print:border print:border-gray-300 print:rounded-none print:bg-white print:focus:bg-white`}
  />
);

const InvoiceApp: React.FC = () => {
  // --- State for Header Information ---
  const [header, setHeader] = useState<Header>({
    customerCode: '',
    customerName: '',
    address: '',
    contact: '',
    salesmanCode: '',
    salesmanName: '',
    orderNo: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    custNtn: '',
    custCnic: '',
    custGst: '',
  });

  // --- State for Line Items ---
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      code: '',
      desc: '',
      packSize: '',
      batchNo: '',
      qty: 1,
      tp: 0,
      mrp: 0,
      discPercent: 0,
      gstPercent: 0,
      addGst: 0,
      advTax: 0,
    },
  ]);

  // Track which input field should be focused
  interface FocusPosition {
    rowId: number;
    field: string;
  }

  const [focusPosition, setFocusPosition] = useState<FocusPosition>({ rowId: 1, field: 'code' });
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Set focus when focusPosition changes
  useEffect(() => {
    const refKey = `${focusPosition.rowId}-${focusPosition.field}`;
    if (inputRefs.current[refKey]) {
      if (document.activeElement !== inputRefs.current[refKey]) {
        inputRefs.current[refKey]?.focus();
      }
    }
  }, [focusPosition]);

  // --- Handlers ---
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: number, field: keyof Item, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Optimize focus handler to avoid unnecessary state updates
  const handleFieldFocus = (rowId: number, field: string) => {
    if (focusPosition.rowId !== rowId || focusPosition.field !== field) {
      setFocusPosition({ rowId, field });
    }
  };

  // Handle key navigation in table inputs
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: number,
    field: string
  ) => {
    const fields = ['code', 'desc', 'packSize', 'batchNo', 'qty', 'tp', 'mrp', 'discPercent', 'gstPercent', 'addGst', 'advTax'];
    const currentIndex = fields.indexOf(field);

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      // Move to next field
      if (currentIndex < fields.length - 1) {
        // Next field in same row
        setFocusPosition({ rowId, field: fields[currentIndex + 1] });
      } else {
        // Move to first field of next row
        const currentRowIndex = items.findIndex(item => item.id === rowId);
        if (currentRowIndex < items.length - 1) {
          // Next row
          const nextRowId = items[currentRowIndex + 1].id;
          setFocusPosition({ rowId: nextRowId, field: 'code' });
        } else {
          // Add new row if at last row
          addItem();
        }
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      const currentRowIndex = items.findIndex(item => item.id === rowId);
      const newRowIndex = currentRowIndex + direction;

      if (newRowIndex >= 0 && newRowIndex < items.length) {
        const newRowId = items[newRowIndex].id;
        setFocusPosition({ rowId: newRowId, field });
      }
    }
  };

  const addItem = () => {
    const ids = items.map(i => i.id).filter(id => typeof id === 'number' && !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = maxId + 1;

    setItems(prev => [
      ...prev,
      {
        id: newId,
        code: '',
        desc: '',
        packSize: '',
        batchNo: '',
        qty: 1,
        tp: 0,
        mrp: 0,
        discPercent: 0,
        gstPercent: 0,
        addGst: 0,
        advTax: 0,
      },
    ]);

    // Schedule focus change for after render
    setTimeout(() => {
      setFocusPosition({ rowId: newId, field: 'code' });
    }, 0);
  };

  const removeItem = (id: number) => {
    // Don't remove if it's the last item
    if (items.length <= 1) {
      // Instead of removing, reset the item
      setItems([{
        id: 1,
        code: '',
        desc: '',
        packSize: '',
        batchNo: '',
        qty: 1,
        tp: 0,
        mrp: 0,
        discPercent: 0,
        gstPercent: 0,
        addGst: 0,
        advTax: 0,
      }]);
      setFocusPosition({ rowId: 1, field: 'code' });
    } else {
      setItems((prev) => {
        const newItems = prev.filter((item) => item.id !== id);
        // If we removed the focused row, focus the first item of the first row
        if (focusPosition.rowId === id) {
          setTimeout(() => {
            setFocusPosition({ rowId: newItems[0].id, field: 'code' });
          }, 0);
        }
        return newItems;
      });
    }
  };

  // Auto-focus first item when component mounts
  useEffect(() => {
    setFocusPosition({ rowId: 1, field: 'code' });
  }, []);

  // Handle print - ensures proper printing
  const handlePrint = () => {
    // Store original border styles
    const originalStyles: string[] = [];

    // Temporarily show all inputs as readonly/static for print
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
      originalStyles[index] = input.style.cssText;
      input.style.border = '1px solid #ccc';
      input.style.background = 'white';
      input.classList.add('print-static');
      input.readOnly = true;
    });

    // Trigger print
    window.print();

    // Restore inputs after print
    setTimeout(() => {
      inputs.forEach((input, index) => {
        input.style.cssText = originalStyles[index];
        input.classList.remove('print-static');
        input.readOnly = false;
      });
    }, 100);
  };

  // --- Calculations ---
  const calculatedItems = useMemo<CalculatedItem[]>(() => {
    return items.map((item) => {
      const qty = Number(item.qty) || 0;
      const tp = Number(item.tp) || 0;
      const discPercent = Number(item.discPercent) || 0;
      const gstPercent = Number(item.gstPercent) || 0;
      const addGst = Number(item.addGst) || 0;
      const advTax = Number(item.advTax) || 0;

      const grossAmount = qty * tp;
      const discAmt = (grossAmount * discPercent) / 100;
      const taxable = grossAmount - discAmt;
      const gstAmt = (taxable * gstPercent) / 100;
      const netAmount = taxable + gstAmt + addGst + advTax;

      return {
        ...item,
        grossAmount,
        discAmt,
        gstAmt,
        netAmount,
      };
    });
  }, [items]);

  const totals = useMemo(() => {
    return calculatedItems.reduce(
      (acc, item) => ({
        gross: acc.gross + item.grossAmount,
        disc: acc.disc + item.discAmt,
        gst: acc.gst + item.gstAmt,
        addGst: acc.addGst + Number(item.addGst || 0),
        advTax: acc.advTax + Number(item.advTax || 0),
        net: acc.net + item.netAmount,
      }),
      { gross: 0, disc: 0, gst: 0, addGst: 0, advTax: 0, net: 0 }
    );
  }, [calculatedItems]);

  return (
    <>
      {/* Print-specific styles - Optimized for single page */}
      <style>
        {`
          @media print {
            @page {
              margin: 5mm;
              size: A4 portrait;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-size: 10px !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .print-hidden {
              display: none !important;
            }
            
            input, .TableInput {
              border: 1px solid #ccc !important;
              background: white !important;
              min-height: 18px !important;
              padding: 0 2px !important;
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
            
            .product-desc-input {
              min-width: 120px !important;
              max-width: 200px !important;
              white-space: nowrap !important;
              overflow: visible !important;
              text-overflow: unset !important;
            }
            
            .print-static {
              border: none !important;
              background: transparent !important;
              pointer-events: none;
              box-shadow: none !important;
              outline: none !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            
            .print\\:bg-white {
              background: white !important;
            }
            
            .print\\:border-none {
              border: none !important;
            }
            
            .print\\:border-gray-300 {
              border-color: #d1d5db !important;
            }
            
            .ring-1, .focus\\:ring-1 {
              box-shadow: none !important;
              outline: none !important;
            }
            
            .bg-gray-100 {
              background: white !important;
            }
            
            button, .group:hover button {
              display: none !important;
            }
            
            /* Ensure table fits in one page */
            table {
              page-break-inside: avoid !important;
              border-collapse: collapse !important;
              width: 100% !important;
              table-layout: fixed !important;
            }
            
            th, td {
              padding: 2px 4px !important;
              font-size: 9px !important;
              line-height: 1.1 !important;
              height: 20px !important;
              overflow: visible !important;
              white-space: nowrap !important;
              page-break-inside: avoid !important;
            }
            
            /* Product description column - wider and handles overflow */
            td:nth-child(2) {
              min-width: 120px !important;
              max-width: 180px !important;
              white-space: normal !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            /* Other columns with fixed widths */
            td:nth-child(1) { width: 50px !important; } /* Prod Code */
            td:nth-child(3) { width: 40px !important; } /* Pack Size */
            td:nth-child(4) { width: 60px !important; } /* Batch No */
            td:nth-child(5) { width: 30px !important; } /* QTY */
            td:nth-child(6) { width: 45px !important; } /* TP */
            td:nth-child(7) { width: 45px !important; } /* MRP */
            td:nth-child(8) { width: 55px !important; } /* Gross Amt */
            td:nth-child(9) { width: 35px !important; } /* Disc % */
            td:nth-child(10) { width: 55px !important; } /* Disc Amt */
            td:nth-child(11) { width: 35px !important; } /* GST % */
            td:nth-child(12) { width: 45px !important; } /* Adv Tax */
            td:nth-child(13) { width: 60px !important; } /* Net Amount */
            
            /* Container adjustments */
            .max-w-\\[210mm\\] {
              max-width: 210mm !important;
              width: 210mm !important;
              margin: 0 auto !important;
            }
            
            .p-8 {
              padding: 5mm !important;
            }
            
            .min-h-\\[297mm\\] {
              min-height: 275mm !important; /* Reduced to ensure fit */
            }
            
            /* Reduce spacing between sections */
            .mb-6 {
              margin-bottom: 8px !important;
            }
            
            .mt-8 {
              margin-top: 10px !important;
            }
            
            /* Adjust font sizes for print */
            .text-xs {
              font-size: 10px !important;
            }
            
            .text-\\[10px\\] {
              font-size: 9px !important;
            }
            
            .text-lg {
              font-size: 14px !important;
            }
            
            .text-sm {
              font-size: 11px !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 p-4 print:p-0 text-xs font-sans">

        {/* Controls - Hidden in Print */}
        <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center no-print">
          <h1 className="text-xl font-bold text-gray-700">Invoice Editor</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Press <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to move to next field
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
        </div>

  
        <div className="max-w-[210mm] mx-auto bg-white shadow-xl p-8 min-h-[277mm] flex flex-col print:shadow-none print:bg-white" style={{ minHeight: '277mm' }}>

          {/* Header Section - Compact */}
          <div className="flex justify-between items-start mb-4">
            <div className="border-2 border-black px-6 py-1 font-bold text-lg tracking-wider print:border-black">
              ESTIMATE
            </div>
            <div className="text-right">
              {/* Optional Logo Area or Company Name if needed, kept blank to match image */}
            </div>
          </div>

          {/* Info Grid - Compact */}
          <div className="grid grid-cols-2 gap-x-12 mb-4">
            {/* Left Column */}
            <div className="space-y-0.5">
              <div className="flex">
                <span className="w-28 font-semibold">CUSTOMER CODE</span>
                <Input name="customerCode" value={header.customerCode} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">CUSTOMER NAME</span>
                <Input name="customerName" value={header.customerName} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">ADDRESS</span>
                <Input name="address" value={header.address} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">CONTACT #</span>
                <Input name="contact" value={header.contact} onChange={handleHeaderChange} />
              </div>
              <div className="flex mt-1">
                <span className="w-28 font-semibold">SALESMAN CODE</span>
                <Input name="salesmanCode" value={header.salesmanCode} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">SALESMAN NAME</span>
                <Input name="salesmanName" value={header.salesmanName} onChange={handleHeaderChange} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-0.5">
              <div className="flex">
                <span className="w-28 font-semibold">ORDER #</span>
                <span className="mr-2">:</span>
                <Input name="orderNo" value={header.orderNo} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">DATE</span>
                <span className="mr-2">:</span>
                <Input name="date" value={header.date} onChange={handleHeaderChange} type="date" />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">CUST NTN #</span>
                <Input name="custNtn" value={header.custNtn} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">CUST CNIC #</span>
                <Input name="custCnic" value={header.custCnic} onChange={handleHeaderChange} />
              </div>
              <div className="flex">
                <span className="w-28 font-semibold">CUST GST #</span>
                <Input name="custGst" value={header.custGst} onChange={handleHeaderChange} />
              </div>
            </div>
          </div>

          {/* Table - Fixed layout to prevent overflow */}
          <div className="flex-grow overflow-hidden">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-t-2 border-b-2 border-black text-[10px] print:border-black">
                  <th className="text-left py-1" style={{ width: '50px' }}>PROD CODE</th>
                  <th className="text-left py-1" style={{ width: '180px' }}>PRODUCT DESCRIPTION</th>
                  <th className="text-left py-1" style={{ width: '40px' }}>PACK SIZE</th>
                  <th className="text-left py-1" style={{ width: '60px' }}>BATCH NO</th>
                  <th className="text-right py-1" style={{ width: '30px' }}>QTY</th>
                  <th className="text-right py-1" style={{ width: '45px' }}>TP</th>
                  <th className="text-right py-1" style={{ width: '45px' }}>MRP</th>
                  <th className="text-right py-1" style={{ width: '55px' }}>GROSS AMT</th>
                  <th className="text-right py-1" style={{ width: '35px' }}>DISC (%)</th>
                  <th className="text-right py-1" style={{ width: '55px' }}>DISC AMT</th>
                  <th className="text-right py-1" style={{ width: '35px' }}>GST (%)</th>
                  <th className="text-right py-1" style={{ width: '45px' }}>ADV TAX</th>
                  <th className="text-right py-1" style={{ width: '60px' }}>NET AMOUNT</th>
                  <th className="no-print" style={{ width: '30px' }}></th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {calculatedItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 print:border-gray-300 group hover:bg-gray-50">
                    <td style={{ width: '50px' }}>
                      <TableInput
                        value={item.code}
                        onChange={(v) => handleItemChange(item.id, 'code', v)}
                        rowId={item.id}
                        field="code"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'code'}
                      />
                    </td>
                    <td style={{ width: '180px', minWidth: '180px' }}>
                      <div className="relative">
                        <TableInput
                          value={item.desc}
                          onChange={(v) => handleItemChange(item.id, 'desc', v)}
                          rowId={item.id}
                          field="desc"
                          inputRefs={inputRefs}
                          handleKeyDown={handleKeyDown}
                          onFieldFocus={handleFieldFocus}
                          isFocused={focusPosition.rowId === item.id && focusPosition.field === 'desc'}
                          className="product-desc-input"
                        />
                        {/* Show full description on hover */}
                        <div className="no-print absolute z-50 hidden group-hover:block bg-white border border-gray-300 shadow-lg p-2 rounded text-xs max-w-xs">
                          {item.desc || '(Empty)'}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: '40px' }}>
                      <TableInput
                        value={item.packSize}
                        onChange={(v) => handleItemChange(item.id, 'packSize', v)}
                        rowId={item.id}
                        field="packSize"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'packSize'}
                      />
                    </td>
                    <td style={{ width: '60px' }}>
                      <TableInput
                        value={item.batchNo}
                        onChange={(v) => handleItemChange(item.id, 'batchNo', v)}
                        rowId={item.id}
                        field="batchNo"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'batchNo'}
                      />
                    </td>
                    <td style={{ width: '30px' }}>
                      <TableInput
                        type="number"
                        value={item.qty}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'qty', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="qty"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'qty'}
                      />
                    </td>
                    <td style={{ width: '45px' }}>
                      <TableInput
                        type="number"
                        value={item.tp}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'tp', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="tp"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'tp'}
                      />
                    </td>
                    <td style={{ width: '45px' }}>
                      <TableInput
                        type="number"
                        value={item.mrp}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'mrp', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="mrp"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'mrp'}
                      />
                    </td>

                    <td className="text-right py-1 pr-1 print:pr-1" style={{ width: '55px' }}>
                      {item.grossAmount.toFixed(2)}
                    </td>


                    <td style={{ width: '35px' }}>
                      <TableInput
                        type="number"
                        value={item.discPercent}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'discPercent', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="discPercent"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'discPercent'}
                      />
                    </td>

                    <td className="text-right py-1 pr-1 print:pr-1" style={{ width: '55px' }}>{item.discAmt.toFixed(2)}</td>

                    <td style={{ width: '35px' }}>
                      <TableInput
                        type="number"
                        value={item.gstPercent}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'gstPercent', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="gstPercent"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'gstPercent'}
                      />
                    </td>

                    <td style={{ width: '45px' }}>
                      <TableInput
                        type="number"
                        value={item.advTax}
                        align="right"
                        onChange={(v) => handleItemChange(item.id, 'advTax', parseFloat(v as string) || 0)}
                        rowId={item.id}
                        field="advTax"
                        inputRefs={inputRefs}
                        handleKeyDown={handleKeyDown}
                        onFieldFocus={handleFieldFocus}
                        isFocused={focusPosition.rowId === item.id && focusPosition.field === 'advTax'}
                      />
                    </td>

                    <td className="text-right py-1 font-semibold print:py-1" style={{ width: '60px' }}>{item.netAmount.toFixed(2)}</td>

                    <td className="no-print text-center" style={{ width: '30px' }}>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Remove item"
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
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium no-print"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          {/* Footer - Compact */}
          <div className="mt-4 border-t-2 border-black pt-2 text-xs print:border-black">
            <div className="flex justify-between items-end">
              <div className="w-1/3">
                <div className="flex items-center gap-4">
                  <span>No of Items:</span>
                  <span className="font-bold">{items.length}</span>
                </div>
              </div>

              <div className="w-2/3">
                <div className="grid grid-cols-5 text-right gap-2 mb-2 font-medium text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Total Gross</span>
                    <span>{totals.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Total Disc</span>
                    <span>{totals.disc.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Total GST</span>
                    <span>{totals.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Total Adv Tax</span>
                    <span>{totals.advTax.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Net Total</span>
                    <span>{totals.net.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-black border-b py-1 flex justify-between items-center text-sm font-bold print:border-black">
                  <span>BILL AMOUNT {'------>'} RS.</span>
                  <span className="text-lg">{Math.round(totals.net).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-[10px] text-gray-500">
              Computer generated invoice. Signature not required.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceApp;