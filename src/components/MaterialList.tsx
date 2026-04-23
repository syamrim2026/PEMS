import { useState, useEffect, FormEvent } from 'react';
import { materialService } from '../services/materialService';
import { Material, Unit } from '../types';
import { Plus, Search, MoreVertical, Package, Layers, MapPin, Trash2, Edit, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import BatchManager from './BatchManager';

export default function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState<Unit>('liters');
  const [minThreshold, setMinThreshold] = useState(10);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const data = await materialService.getAllMaterials();
    setMaterials(data || []);
    setLoading(false);
  };

  const handleAddMaterial = async (e: FormEvent) => {
    e.preventDefault();
    await materialService.createMaterial(name, category, brand, unit, minThreshold);
    setName('');
    setCategory('');
    setBrand('');
    setIsAddModalOpen(false);
    loadMaterials();
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedMaterial) {
    return <BatchManager material={selectedMaterial} onBack={() => setSelectedMaterial(null)} />;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Filter by material, brand, or ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Add Material
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-40 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredMaterials.map((material) => (
              <motion.div 
                layout
                key={material.id}
                onClick={() => setSelectedMaterial(material)}
                className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Package size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-300 font-mono">#{material.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{material.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {material.brand} • {material.category}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {material.unit.toUpperCase()} UNIT
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:underline">
                    Manage Batches
                    <ChevronRight size={10} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]"
            />
            <motion.form 
              onSubmit={handleAddMaterial}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl overflow-hidden border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-900">Define Material</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Category</label>
                    <input required value={category} onChange={e => setCategory(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Brand</label>
                    <input required value={brand} onChange={e => setBrand(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Unit</label>
                    <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-sm">
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
                      <option value="cans">Cans</option>
                      <option value="kg">KG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Alert Threshold</label>
                    <input value={minThreshold} onChange={e => setMinThreshold(Number(e.target.value))} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 text-xs text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm">Commit Record</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
