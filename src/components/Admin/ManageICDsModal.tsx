import React, { useState } from 'react';
import { ICD, Currency } from '../../types';
import { formatMoney } from '../../services/currency';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  MapPin, 
  Clock, 
  Phone, 
  Coins, 
  Layers,
  AlertCircle
} from 'lucide-react';

interface ManageICDsModalProps {
  icds: ICD[];
  currency: Currency;
  onClose: () => void;
  onSaveICDs: (updated: ICD[]) => void;
}

export const ManageICDsModal: React.FC<ManageICDsModalProps> = ({
  icds,
  currency,
  onClose,
  onSaveICDs,
}) => {
  const [list, setList] = useState<ICD[]>(icds);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number>(0.3576);
  const [lng, setLng] = useState<number>(32.6099);
  const [contact, setContact] = useState('');
  const [operatingHours, setOperatingHours] = useState('24/7 Customs Clearance');
  const [storageFeePerDay, setStorageFeePerDay] = useState<number>(50000);
  const [capacityTEU, setCapacityTEU] = useState<number>(2500);
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setLocation('');
    setLat(0.3576);
    setLng(32.6099);
    setContact('');
    setOperatingHours('24/7 Customs Clearance');
    setStorageFeePerDay(50000);
    setCapacityTEU(2500);
    setDescription('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (icd: ICD) => {
    setEditingId(icd.id);
    setName(icd.name);
    setLocation(icd.location);
    setLat(icd.lat);
    setLng(icd.lng);
    setContact(icd.contact);
    setOperatingHours(icd.operatingHours);
    setStorageFeePerDay(icd.storageFeePerDay);
    setCapacityTEU(icd.capacityTEU || 2500);
    setDescription(icd.description || '');
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this ICD terminal?')) {
      const updated = list.filter(i => i.id !== id);
      setList(updated);
      onSaveICDs(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    if (editingId) {
      const updated = list.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name,
            location,
            lat,
            lng,
            contact,
            operatingHours,
            storageFeePerDay: Number(storageFeePerDay) || 50000,
            capacityTEU: Number(capacityTEU) || 2000,
            description,
          };
        }
        return item;
      });
      setList(updated);
      onSaveICDs(updated);
    } else {
      const newICD: ICD = {
        id: 'icd-' + Date.now().toString().slice(-4),
        name,
        location,
        lat: Number(lat),
        lng: Number(lng),
        contact,
        operatingHours,
        storageFeePerDay: Number(storageFeePerDay) || 50000,
        capacityTEU: Number(capacityTEU) || 2000,
        description,
        customsCleared: true,
      };
      const updated = [newICD, ...list];
      setList(updated);
      onSaveICDs(updated);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0B192C] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Manage ICDs &amp; Bonded Warehouses
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configure inland container terminals, GPS locations, and daily storage fees</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New ICD</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Add / Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />
                  {editingId ? 'Edit ICD Terminal' : 'Add New ICD / Bonded Warehouse'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">ICD Terminal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Multiple ICD"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Location / Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near URA HQ, Nakawa, Kampala"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Storage Fee (UGX/Day) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={storageFeePerDay}
                    onChange={(e) => setStorageFeePerDay(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Capacity (TEUs)</label>
                  <input
                    type="number"
                    value={capacityTEU}
                    onChange={(e) => setCapacityTEU(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Phone &amp; Email</label>
                  <input
                    type="text"
                    placeholder="+256 414 ... / ops@icd.ug"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7 Customs Clearance"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description &amp; Facilities</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Facility specifications, rail access, reefer plug-ins, etc."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Update ICD' : 'Save New ICD'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Table / Cards of Registered ICDs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Registered Inland Container Depots ({list.length})</span>
              <span>Default Storage Benchmark: 50,000 UGX/day</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {list.map((icd) => (
                <div
                  key={icd.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{icd.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {icd.lat.toFixed(4)}, {icd.lng.toFixed(4)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{icd.location}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {icd.operatingHours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {icd.contact}
                      </span>
                      {icd.capacityTEU && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Layers className="w-3 h-3 text-slate-500" />
                          {icd.capacityTEU.toLocaleString()} TEUs
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Storage Fee / Day:</div>
                      <div className="text-sm font-black text-amber-400">
                        {formatMoney(icd.storageFeePerDay, currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(icd)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Edit ICD"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(icd.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-lg transition-colors"
                        title="Delete ICD"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Storage rates updated here dynamically apply to all trip quotes and demurrage calculators.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
