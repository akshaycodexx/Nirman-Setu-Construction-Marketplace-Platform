import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { Calculator, ArrowRight, Plus, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'house', label: 'Ghar (Residential)' },
  { id: 'commercial', label: 'Dukan / Office (Commercial)' },
  { id: 'boundary', label: 'Boundary Wall' },
  { id: 'slab', label: 'Chhath / Slab Only' },
];

const QUALITY = [
  { id: 'basic', label: 'Basic', desc: 'Sasta material, kaam chalau' },
  { id: 'standard', label: 'Standard', desc: 'Seedha sahi kaam' },
  { id: 'premium', label: 'Premium', desc: 'Best quality' },
];

// Per sqft per floor ratios (standard construction norms)
const RATIOS = {
  house: {
    basic:    { cement: 0.40, sand: 1.8, gitti: 2.2, brick: 7,  steel: 3.0, paint: 0.10 },
    standard: { cement: 0.45, sand: 2.0, gitti: 2.5, brick: 8,  steel: 3.5, paint: 0.12 },
    premium:  { cement: 0.50, sand: 2.2, gitti: 2.8, brick: 9,  steel: 4.0, paint: 0.15 },
  },
  commercial: {
    basic:    { cement: 0.45, sand: 2.0, gitti: 2.5, brick: 6,  steel: 4.0, paint: 0.08 },
    standard: { cement: 0.50, sand: 2.2, gitti: 2.8, brick: 7,  steel: 4.5, paint: 0.10 },
    premium:  { cement: 0.55, sand: 2.4, gitti: 3.0, brick: 8,  steel: 5.0, paint: 0.12 },
  },
  boundary: {
    basic:    { cement: 0.30, sand: 1.2, gitti: 1.0, brick: 12, steel: 0.5, paint: 0 },
    standard: { cement: 0.35, sand: 1.4, gitti: 1.2, brick: 14, steel: 0.8, paint: 0 },
    premium:  { cement: 0.40, sand: 1.6, gitti: 1.4, brick: 15, steel: 1.0, paint: 0 },
  },
  slab: {
    basic:    { cement: 0.55, sand: 1.0, gitti: 2.5, brick: 0,  steel: 5.0, paint: 0 },
    standard: { cement: 0.60, sand: 1.2, gitti: 2.8, brick: 0,  steel: 5.5, paint: 0 },
    premium:  { cement: 0.65, sand: 1.4, gitti: 3.0, brick: 0,  steel: 6.0, paint: 0 },
  },
};

// Approx price ranges (₹ per unit)
const PRICE_RANGE = {
  cement: { min: 350, max: 420, unit: 'bag (50kg)' },
  sand:   { min: 40,  max: 70,  unit: 'cubic feet' },
  gitti:  { min: 50,  max: 90,  unit: 'cubic feet' },
  brick:  { min: 7,   max: 12,  unit: 'piece' },
  steel:  { min: 55,  max: 75,  unit: 'kg' },
  paint:  { min: 180, max: 280, unit: 'litre' },
};

const UNIT_MAP = {
  cement: 'bag',
  sand:   'cubic_meter',
  gitti:  'cubic_meter',
  brick:  'piece',
  steel:  'ton',
  paint:  'litre',
};

const MATERIAL_LABELS = {
  cement: 'Cement',
  sand:   'Sand (Ret)',
  gitti:  'Gitti / Aggregate',
  brick:  'Bricks (Eet)',
  steel:  'Steel / TMT Bars',
  paint:  'Paint',
};

function cftToCubicMeter(cft) { return +(cft * 0.0283168).toFixed(2); }
function kgToTon(kg) { return +(kg / 1000).toFixed(2); }
function litresToLitre(l) { return Math.ceil(l); }

function MaterialRow({ name, qty, unit, priceRange, onRequest }) {
  const [open, setOpen] = useState(false);
  const minCost = Math.round(qty * priceRange.min);
  const maxCost = Math.round(qty * priceRange.max);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{MATERIAL_LABELS[name]}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-bold text-gray-800 text-base">{qty.toLocaleString('en-IN')}</span>
            {' '}{priceRange.unit}
          </p>
        </div>
        <div className="text-right mr-3">
          <p className="text-xs text-gray-400">Est. Cost</p>
          <p className="text-sm font-bold text-gray-700">
            ₹{minCost.toLocaleString('en-IN')} – ₹{maxCost.toLocaleString('en-IN')}
          </p>
        </div>
        <button onClick={() => onRequest(name, qty)}
          className="shrink-0 flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
          <Plus className="w-3.5 h-3.5" /> Quote
        </button>
      </div>
    </div>
  );
}

export default function CustomerEstimator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ area: '', floors: '1', projectType: 'house', quality: 'standard' });
  const [result, setResult] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = (e) => {
    e.preventDefault();
    const area = Number(form.area);
    const floors = Number(form.floors);
    const ratio = RATIOS[form.projectType][form.quality];
    const total = area * floors;

    const rawCement = ratio.cement * total;
    const rawSand   = ratio.sand   * total;
    const rawGitti  = ratio.gitti  * total;
    const rawBrick  = ratio.brick  * total;
    const rawSteel  = ratio.steel  * total;
    const rawPaint  = ratio.paint  * total;

    setResult({
      area, floors, projectType: form.projectType, quality: form.quality,
      items: [
        { name: 'cement', qty: Math.ceil(rawCement) },
        { name: 'sand',   qty: cftToCubicMeter(rawSand) },
        { name: 'gitti',  qty: cftToCubicMeter(rawGitti) },
        ...(rawBrick > 0  ? [{ name: 'brick', qty: Math.ceil(rawBrick) }] : []),
        { name: 'steel',  qty: kgToTon(rawSteel) },
        ...(rawPaint > 0  ? [{ name: 'paint', qty: litresToLitre(rawPaint) }] : []),
      ],
    });
  };

  const handleRequest = (materialName, qty) => {
    const unit = UNIT_MAP[materialName];
    const label = MATERIAL_LABELS[materialName];
    navigate('/customer/quotes', {
      state: {
        prefill: {
          material: label,
          quantity: qty,
          unit,
        },
      },
    });
  };

  const totalMinCost = result?.items.reduce((s, i) => s + i.qty * PRICE_RANGE[i.name].min, 0);
  const totalMaxCost = result?.items.reduce((s, i) => s + i.qty * PRICE_RANGE[i.name].max, 0);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Material Estimator</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Project ka area batao — materials ka estimate milega</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <button onClick={() => setShowInfo(s => !s)}
          className="w-full flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-left">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
            <Info className="w-4 h-4 shrink-0" />
            Yeh estimate kaise calculate hota hai?
          </div>
          {showInfo ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
        </button>
        {showInfo && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800 space-y-1.5 -mt-2">
            <p>Standard construction norms ke basis pe calculate kiya jaata hai (BIS standards).</p>
            <p>Yeh <strong>rough estimate</strong> hai — actual quantity ±15% vary kar sakti hai depending on design, wastage, aur local methods.</p>
            <p>Hamesha engineer se confirm karein.</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Project Details</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Total Area (Square Feet) *</label>
              <input value={form.area} onChange={e => set('area', e.target.value)}
                type="number" min="50" max="100000" required placeholder="1000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Floors (Manzil) *</label>
              <select value={form.floors} onChange={e => set('floors', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {[1,2,3,4,5].map(f => <option key={f} value={f}>{f} Floor{f>1?'s':''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Project Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map(p => (
                <button key={p.id} type="button" onClick={() => set('projectType', p.id)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors text-left ${
                    form.projectType === p.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Construction Quality *</label>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY.map(q => (
                <button key={q.id} type="button" onClick={() => set('quality', q.id)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    form.quality === q.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}>
                  <span className="block font-bold">{q.label}</span>
                  <span className={`block text-xs mt-0.5 ${form.quality === q.id ? 'text-indigo-200' : 'text-gray-400'}`}>{q.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Calculator className="w-4 h-4" /> Estimate Karo
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                Estimated Materials
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {result.area.toLocaleString('en-IN')} sqft × {result.floors} floor{result.floors > 1 ? 's' : ''}
                </span>
              </h2>
            </div>

            {/* Total cost */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-700">Total Estimated Material Cost</p>
              <p className="font-black text-indigo-800">
                ₹{Math.round(totalMinCost).toLocaleString('en-IN')} – ₹{Math.round(totalMaxCost).toLocaleString('en-IN')}
              </p>
            </div>

            <p className="text-xs text-gray-400 px-1">
              "Quote" button dabao → supplier se us material ki price compare karo
            </p>

            <div className="space-y-2">
              {result.items.map(item => (
                <MaterialRow
                  key={item.name}
                  name={item.name}
                  qty={item.qty}
                  priceRange={PRICE_RANGE[item.name]}
                  onRequest={handleRequest}
                />
              ))}
            </div>

            <button
              onClick={() => {
                result.items.forEach((item, i) => {
                  setTimeout(() => handleRequest(item.name, item.qty), i * 100);
                });
              }}
              className="w-full flex items-center justify-center gap-2 border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-bold py-3 rounded-2xl transition-colors text-sm">
              <Plus className="w-4 h-4" /> Sab Materials ke liye Quote Request Banao
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
