import { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Calculator, Receipt, CircleCheck, Trash2, Printer, Plus, Minus, ReceiptText, Sparkles } from 'lucide-react';

export default function RateCalculator() {
  const { catalog } = useCatalog();
  const [items, setItems] = useState<Array<{ id: string; name: string; rate: number; qty: number; unit: string }>>([
    { id: 'xerox_black', name: 'Laser B&W Xerox Print', rate: 5, qty: 5, unit: 'Per Page' },
    { id: 'photo_std', name: 'Studio Photo Print (8 Pics)', rate: 50, qty: 1, unit: 'Sheet of 8' },
  ]);

  const [selectedPresetId, setSelectedPresetId] = useState('');

  const addPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = (catalog.printing || []).find(p => p.id === presetId);
    if (!preset) return;

    if (items.some(i => i.id === presetId)) {
      setItems(items.map(i => i.id === presetId ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setItems([...items, { id: preset.id, name: preset.name, rate: preset.rate, qty: 1, unit: preset.unit }]);
    }
    setSelectedPresetId('');
  };

  const updateQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setItems(items.filter(item => item.id !== id));
    } else {
      setItems(items.map(item => item.id === id ? { ...item, qty: newQty } : item));
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.rate * item.qty), 0);
  const operatorDiscount = subtotal > 200 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - operatorDiscount;

  return (
    <section id="calculator" className="py-20 bg-slate-950/80 border-t border-slate-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-blue-950/10 to-[#030712] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full text-xs uppercase tracking-wider mb-4">
             <Calculator size={14} className="animate-pulse text-blue-400" /> Transparent Pricing
          </div>
          <h2 className="text-3.5xl md:text-5xl font-display font-black text-white tracking-tight">
            Smart Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">Rate Calculator</span>
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed font-medium">
            Calculate your total cost for printing, lamination, xerox, and photo needs online. Receive standard bulk discounts automatically.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-7 bg-[#0b0f19] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                   Add Items to Estimate
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select standard cyber cafe services below to modify printing counts.</p>
              </div>
              
              <div className="w-full sm:w-auto">
                <select
                  value={selectedPresetId}
                  onChange={(e) => addPreset(e.target.value)}
                  className="w-full bg-[#151b2e] text-slate-100 px-4 py-3 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none font-semibold text-sm transition-all"
                >
                  <option value="">-- Click to select a service --</option>
                  {(catalog.printing || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.rate}/{p.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                 <Printer size={48} className="mx-auto text-slate-700 mb-4 stroke-[1]" />
                 <p className="text-base text-slate-400">Estimate ledger is dry.</p>
                 <p className="text-sm text-slate-500 mt-1">Choose services from the dropdown above to create your bill estimate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#151b2e]/60 rounded-2xl border border-white/5 p-4 gap-4 hover:border-white/10 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-slate-200">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Rate: <span className="text-blue-400 font-semibold">₹{item.rate}</span> <span className="text-slate-500">/ {item.unit}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center bg-[#070a13] border border-white/5 rounded-xl p-1.5">
                        <button 
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Reduce quantity"
                        >
                          <Minus size={14} className="stroke-[3]" />
                        </button>
                        <span className="px-4 font-mono font-bold text-white text-base min-w-[3rem] text-center">
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-1 px-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Increase quantity"
                        >
                          <Plus size={14} className="stroke-[3]" />
                        </button>
                      </div>

                      <div className="text-right min-w-[4.5rem]">
                        <span className="font-mono text-lg font-bold text-emerald-400">
                          ₹{item.rate * item.qty}
                        </span>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove service item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex flex-wrap gap-2.5">
               <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 rounded-lg bg-blue-500/5 text-blue-300 border border-blue-500/10">
                 💡 Bulk discount of 10% auto-applied above ₹200 order value!
               </span>
            </div>
          </div>

          {/* Receipt Preview Panel */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#111625] to-[#070a14] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
             
             <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-6">
                <div className="bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 p-2.5 rounded-xl">
                   <Receipt size={24} className="stroke-[2.5]" />
                </div>
                <div>
                   <h3 className="text-lg font-display font-bold text-white tracking-tight">Live Quotation Preview</h3>
                   <span className="text-xs text-slate-400 font-medium">Valid for instant walk-in checkout</span>
                </div>
             </div>

             <div className="bg-[#030712] border border-white/5 rounded-2xl p-5 space-y-4 font-mono text-sm shadow-inner relative">
                {/* Visual authentic layout design */}
                <div className="text-center border-b border-slate-800 pb-4 mb-4">
                  <h4 className="font-display font-black text-white text-base tracking-wider">DASMO CYBER CAFE</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Ardhagram, Mejhia • +91 7384551874</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">-----------------------------------------------</p>
                </div>

                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400 max-w-[65%] truncate">{it.qty}x {it.name}</span>
                      <span className="text-slate-200">₹{it.rate * it.qty}</span>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center text-slate-600 text-xs py-4">
                      [No items added into bill ledger]
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Price:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {operatorDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Welfare Discount (10%):</span>
                      <span>-₹{operatorDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 border-b border-dashed border-slate-800 pb-2.5 mb-2.5">
                    <span>Est. Tax (CGST/SGST):</span>
                    <span>₹0 (Tax Free)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5">
                    <span className="text-white text-base">EST. TOTAL FEE:</span>
                    <span className="text-amber-400 text-lg font-black">₹{total}</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-800/80 mt-4">
                   <p className="text-[10px] text-slate-500 font-semibold">Present bill slip at counter to process</p>
                   
                   {/* Cool custom mock cyber barcode */}
                   <div className="mx-auto w-36 h-12 mt-3 bg-white/5 rounded p-1.5 flex items-center justify-between gap-1 border border-white/5 opacity-80">
                     <div className="h-full bg-slate-400 w-[2px]"></div>
                     <div className="h-full bg-slate-400 w-[4px]"></div>
                     <div className="h-full bg-slate-400 w-[1px]"></div>
                     <div className="h-full bg-slate-400 w-[5px]"></div>
                     <div className="h-full bg-slate-400 w-[1px]"></div>
                     <div className="h-full bg-slate-400 w-[3px]"></div>
                     <div className="h-full bg-slate-400 w-[2px]"></div>
                     <div className="h-full bg-slate-400 w-[6px]"></div>
                     <div className="h-full bg-slate-400 w-[1px]"></div>
                     <div className="h-full bg-slate-400 w-[2px]"></div>
                     <div className="h-full bg-slate-400 w-[4px]"></div>
                     <div className="h-full bg-slate-400 w-[1px]"></div>
                     <div className="h-full bg-slate-400 w-[3px]"></div>
                   </div>
                   <p className="text-[9px] text-blue-400/80 mt-1 font-mono tracking-wider">DASMO-EST-{subtotal}-{total}</p>
                </div>
             </div>

             <div className="mt-6 flex gap-4">
               <button 
                 onClick={() => window.print()}
                 className="flex-1 justify-center inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm"
               >
                 <ReceiptText size={16} /> Print Estimate
               </button>
               <a 
                 href="#pre-fill"
                 className="flex-1 text-center justify-center inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
               >
                 Book Ticket Now <Sparkles size={14} className="text-yellow-300" />
               </a>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
