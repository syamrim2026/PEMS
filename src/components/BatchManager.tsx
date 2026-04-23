import { useState, useEffect, FormEvent } from 'react';
import { batchService } from '../services/batchService';
import { inventoryService } from '../services/inventoryService';
import { Material, Batch, BatchStatus } from '../types';
import { ArrowLeft, Plus, Calendar, MapPin, Hash, Trash2, TrendingDown, TrendingUp, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';

interface BatchManagerProps {
  material: Material;
  onBack: () => void;
}

export default function BatchManager({ material, onBack }: BatchManagerProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Form state
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('');

  // Adjustment state
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('OUT');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const data = await batchService.getBatchesForMaterial(material.id);
    setBatches(data || []);
    setLoading(false);
  };

  const handleCreateBatch = async (e: FormEvent) => {
    e.preventDefault();
    await batchService.createBatch(material.id, batchNumber, new Date(expiryDate), quantity, location);
    setBatchNumber('');
    setExpiryDate('');
    setQuantity(1);
    setIsAddModalOpen(false);
    loadBatches();
  };

  const handleAdjustStock = async (batch: Batch) => {
    const change = adjustmentType === 'IN' ? adjustmentQty : -adjustmentQty;
    const newQty = batch.currentQuantity + change;
    
    if (newQty < 0) {
      alert("Current quantity cannot be negative");
      return;
    }

    await batchService.updateBatch(material.id, batch.id, { 
      currentQuantity: newQty,
      status: newQty === 0 ? 'depleted' : (isPast(batch.expiryDate.toDate()) ? 'expired' : 'active')
    });
    
    await inventoryService.logTransaction(material.id, batch.id, adjustmentType, adjustmentQty, `Manual ${adjustmentType} adjustment`);
    
    setAdjustmentQty(0);
    setSelectedBatch(null);
    loadBatches();
  };

  const getStatusColor = (batch: Batch) => {
    const date = batch.expiryDate.toDate();
    if (batch.currentQuantity === 0) return 'bg-stone-100 text-stone-400';
    if (isPast(date)) return 'bg-red-50 text-red-600 border border-red-100';
    if (isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 30) })) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  };

  const totalStock = batches.reduce((acc, b) => acc + b.currentQuantity, 0);

  return (
    <div className="space-y-8 pb-20 h-full flex flex-col">
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{material.name}</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Current Inventory: <span className="text-indigo-600 font-bold ml-1">{totalStock.toLocaleString()} {material.unit}</span>
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="ml-auto flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Batch
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Batch Tracking</h3>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <motion.div 
                layout
                key={batch.id}
                className="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-gray-50 transition-all"
              >
                <div className="flex-1 flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${getStatusColor(batch)}`}>
                    <Hash size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">Lot: {batch.batchNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(batch)}`}>
                        {batch.currentQuantity === 0 ? 'Depleted' : (isPast(batch.expiryDate.toDate()) ? 'Expired' : 'Active')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                        <Calendar size={12} />
                        Expires {format(batch.expiryDate.toDate(), 'MMM dd, yyyy')}
                      </div>
                      {batch.location && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                          <MapPin size={12} />
                          {batch.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Quantity</p>
                    <p className="text-sm font-bold text-gray-900">{batch.currentQuantity.toLocaleString()} <span className="text-gray-400 font-medium text-[10px]">{material.unit}</span></p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedBatch(batch)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <TrendingDown size={14} />
                    Adjust
                  </button>
                </div>
              </motion.div>
            ))}
            {batches.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                 <AlertCircle className="text-gray-200 w-12 h-12 mb-4" />
                 <p className="text-gray-400 text-sm font-medium uppercase tracking-widest italic">No batch instances recorded</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      <AnimatePresence>
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBatch(null)}
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-xl p-8 shadow-2xl border border-gray-100"
            >
              <h2 className="text-lg font-bold mb-1 text-gray-900">Inventory Adjustment</h2>
              <p className="text-xs text-gray-400 mb-6 font-mono tracking-tight">Batch #{selectedBatch.batchNumber}</p>
              
              <div className="flex p-1 bg-gray-50 rounded-lg mb-6 border border-gray-100">
                <button 
                  onClick={() => setAdjustmentType('OUT')}
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-all ${adjustmentType === 'OUT' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}
                >
                  <TrendingDown size={14} />
                  Withdrawal
                </button>
                <button 
                  onClick={() => setAdjustmentType('IN')}
                  className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-all ${adjustmentType === 'IN' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  <TrendingUp size={14} />
                  Addition
                </button>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-widest text-center">Amount to adjust ({material.unit})</label>
                <input 
                  type="number" 
                  value={adjustmentQty} 
                  onChange={e => setAdjustmentQty(Number(e.target.value))}
                  className="w-full bg-gray-50 border-none rounded-lg p-5 text-3xl font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedBatch(null)} className="flex-1 py-2.5 text-xs text-gray-400 font-bold">Discard</button>
                <button 
                  onClick={() => handleAdjustStock(selectedBatch)}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-white text-xs transition-all shadow-sm ${adjustmentType === 'OUT' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  Save Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Batch Modal */}
       <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
            />
            <motion.form 
              onSubmit={handleCreateBatch}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-xl p-8 shadow-2xl border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-900">Record New Batch</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Lot Number / ID</label>
                  <input required value={batchNumber} onChange={e => setBatchNumber(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Ex: AX-990-2" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Expiration Date</label>
                  <input required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Initial Load Qty</label>
                    <input required value={quantity} onChange={e => setQuantity(Number(e.target.value))} type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Storage Zone</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="Warehouse B" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 text-xs text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition-colors">Discard</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm">Save Batch</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
