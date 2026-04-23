import { useState, useEffect } from 'react';
import { materialService } from '../services/materialService';
import { batchService } from '../services/batchService';
import { notificationService } from '../services/notificationService';
import { Material, Batch } from '../types';
import { AlertTriangle, Clock, Box, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function StatCard({ icon: Icon, label, value, color, badge }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-gray-300 transition-all">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      </div>
      {badge && (
        <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<{batch: Batch, material: Material}[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalStockValue: 0,
    nearExpiry: 0,
    expired: 0,
    outOfStock: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const mData = await materialService.getAllMaterials();
    const settings = await notificationService.getSettings();
    setMaterials(mData || []);
    
    let expiring: {batch: Batch, material: Material}[] = [];
    let counts = { nearExpiry: 0, expired: 0, outOfStock: 0, totalStock: 0 };

    for (const material of mData || []) {
      const bData = await batchService.getBatchesForMaterial(material.id);
      
      const totalForMaterial = bData?.reduce((acc, b) => acc + b.currentQuantity, 0) || 0;
      if (totalForMaterial === 0) counts.outOfStock++;
      
      bData?.forEach(batch => {
        const date = batch.expiryDate.toDate();
        if (batch.currentQuantity > 0) {
          if (isPast(date)) {
            counts.expired++;
            expiring.push({ batch, material });
          } else if (isWithinInterval(date, { 
            start: new Date(), 
            end: addDays(new Date(), settings.thresholdDays) 
          })) {
            counts.nearExpiry++;
            expiring.push({ batch, material });
          }
        }
      });
    }

    setExpiringBatches(expiring.sort((a, b) => a.batch.expiryDate.toMillis() - b.batch.expiryDate.toMillis()));
    setStats({
      totalMaterials: mData?.length || 0,
      totalStockValue: 0,
      ...counts
    });
    setLoading(false);
  };

  const chartData = [
    { name: 'Healthy', value: stats.totalMaterials - stats.nearExpiry - stats.expired - stats.outOfStock },
    { name: 'Expiring', value: stats.nearExpiry },
    { name: 'Expired', value: stats.expired },
    { name: 'No Stock', value: stats.outOfStock },
  ].filter(d => d.value > 0);

  const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#78716c'];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Box} 
          label="Total SKU Items" 
          value={stats.totalMaterials} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          icon={Clock} 
          label="Expiring (Threshold)" 
          value={stats.nearExpiry} 
          color="bg-amber-50 text-amber-600" 
          badge={stats.nearExpiry > 0 ? "Review" : ""}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Expired Units" 
          value={stats.expired} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          icon={Box} 
          label="System Health" 
          value={stats.expired > 0 ? 'Action Reqd' : 'Optimal'} 
          color={stats.expired > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Table/List UI */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-indigo-600" size={16} />
              Material Alerts
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0">
                <tr>
                  <th className="px-6 py-4">Batch ID</th>
                  <th className="px-6 py-4">Material</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expiringBatches.length > 0 ? expiringBatches.map(({ batch, material }) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] text-indigo-600">#{batch.batchNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{material.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{material.brand}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPast(batch.expiryDate.toDate()) ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isPast(batch.expiryDate.toDate()) ? 'Expired' : 'Expiring'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {format(batch.expiryDate.toDate(), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 text-sm font-medium italic">
                      All units currently within safety thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart View */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-6">Stock Status</h3>
          <div className="flex-1 min-h-[300px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: -30, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600, fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest italic border-2 border-dashed border-gray-50 rounded-xl">
                  No data points logged
                </div>
             )}
          </div>
          
          <div className="mt-6 space-y-2">
             {chartData.map((d, i) => (
               <div key={d.name} className="flex items-center justify-between py-1 border-b border-gray-50 text-[11px]">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length ]}} />
                   <span className="font-bold text-gray-500">{d.name}</span>
                 </div>
                 <span className="font-bold text-gray-900">{d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
