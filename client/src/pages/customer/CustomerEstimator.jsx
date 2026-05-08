import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerLayout from '../../components/CustomerLayout';
import { Calculator, Plus, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import useT from '../../i18n/useT';

const PROJECT_TYPE_KEYS = [
  { id: 'house',      labelKey: 'custest.projtype.house' },
  { id: 'commercial', labelKey: 'custest.projtype.commercial' },
  { id: 'boundary',   labelKey: 'custest.projtype.boundary' },
  { id: 'slab',       labelKey: 'custest.projtype.slab' },
];

const QUALITY_KEYS = [
  { id: 'basic',    labelKey: 'custest.quality.basic.label',    descKey: 'custest.quality.basic.desc' },
  { id: 'standard', labelKey: 'custest.quality.standard.label', descKey: 'custest.quality.standard.desc' },
  { id: 'premium',  labelKey: 'custest.quality.premium.label',  descKey: 'custest.quality.premium.desc' },
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

function cftToCubicMeter(cft) { return +(cft * 0.0283168).toFixed(2); }
function kgToTon(kg) { return +(kg / 1000).toFixed(2); }
function litresToLitre(l) { return Math.ceil(l); }

function buildLiveLookup(liveRates) {
  const MAP = { cement: ['cement'], sand: ['sand'], gitti: ['aggregate'], brick: ['brick'], steel: ['steel'] };
  const lookup = {};
  for (const [key, cats] of Object.entries(MAP)) {
    const match = liveRates.find(r => cats.includes(r.category));
    if (match) lookup[key] = { min: match.minRate, max: match.maxRate, unit: match.unit, isLive: true };
  }
  return lookup;
}

function MaterialRow({ name, qty, priceRange, liveRange, onRequest }) {
  const t = useT();
  const range = liveRange || priceRange;
  const minCost = Math.round(qty * range.min);
  const maxCost = Math.round(qty * range.max);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{t(`custest.mat.${name}`)}</p>
            {liveRange && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" /> Live
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-bold text-gray-800 text-base">{qty.toLocaleString('en-IN')}</span>
            {' '}{range.unit}
          </p>
        </div>
        <div className="text-right mr-3">
          <p className="text-xs text-gray-400">{t('custest.estCost')}</p>
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
  const t = useT();
  const [form, setForm] = useState({ area: '', floors: '1', projectType: 'house', quality: 'standard' });
  const [result, setResult] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [liveLookup, setLiveLookup] = useState({});

  const projectTypes = PROJECT_TYPE_KEYS.map(p => ({ ...p, label: t(p.labelKey) }));
  const qualityOptions = QUALITY_KEYS.map(q => ({ ...q, label: t(q.labelKey), desc: t(q.descKey) }));

  useEffect(() => {
    axios.get('/api/rates').then(r => {
      setLiveLookup(buildLiveLookup(r.data.rates || []));
    }).catch(() => {});
  }, []);

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
    const label = t(`custest.mat.${materialName}`);
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

  const totalMinCost = result?.items.reduce((s, i) => s + i.qty * (liveLookup[i.name] || PRICE_RANGE[i.name]).min, 0);
  const totalMaxCost = result?.items.reduce((s, i) => s + i.qty * (liveLookup[i.name] || PRICE_RANGE[i.name]).max, 0);
  const hasLiveRates = result?.items.some(i => liveLookup[i.name]);

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
              <h1 className="text-xl font-bold">{t('custest.title')}</h1>
              <p className="text-indigo-100 text-sm mt-0.5">{t('custest.sub')}</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <button onClick={() => setShowInfo(s => !s)}
          className="w-full flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-left">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
            <Info className="w-4 h-4 shrink-0" />
            {t('custest.infoBtn')}
          </div>
          {showInfo ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
        </button>
        {showInfo && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800 space-y-1.5 -mt-2">
            <p>{t('custest.infoNote1')}</p>
            <p>{t('custest.infoNote2')}</p>
            <p>{t('custest.infoNote3')}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={calculate} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{t('custest.formTitle')}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custest.area')}</label>
              <input value={form.area} onChange={e => set('area', e.target.value)}
                type="number" min="50" max="100000" required placeholder="1000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custest.floors')}</label>
              <select value={form.floors} onChange={e => set('floors', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {[1,2,3,4,5].map(f => (
                  <option key={f} value={f}>{t('custest.floorOpt', { n: f, s: f > 1 ? 's' : '' })}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t('custest.projType')}</label>
            <div className="grid grid-cols-2 gap-2">
              {projectTypes.map(p => (
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
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">{t('custest.quality')}</label>
            <div className="grid grid-cols-3 gap-2">
              {qualityOptions.map(q => (
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
            <Calculator className="w-4 h-4" /> {t('custest.calculate')}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                {t('custest.estMaterials')}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {t('custest.sqftFloors', { area: result.area.toLocaleString('en-IN'), floors: result.floors, s: result.floors > 1 ? 's' : '' })}
                </span>
              </h2>
            </div>

            {/* Total cost */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">{t('custest.totalCost')}</p>
                {hasLiveRates && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3" /> {t('custest.liveRates')}
                  </p>
                )}
              </div>
              <p className="font-black text-indigo-800">
                ₹{Math.round(totalMinCost).toLocaleString('en-IN')} – ₹{Math.round(totalMaxCost).toLocaleString('en-IN')}
              </p>
            </div>

            <p className="text-xs text-gray-400 px-1">{t('custest.quoteNote')}</p>

            <div className="space-y-2">
              {result.items.map(item => (
                <MaterialRow
                  key={item.name}
                  name={item.name}
                  qty={item.qty}
                  priceRange={PRICE_RANGE[item.name]}
                  liveRange={liveLookup[item.name] || null}
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
              <Plus className="w-4 h-4" /> {t('custest.quoteAll')}
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
