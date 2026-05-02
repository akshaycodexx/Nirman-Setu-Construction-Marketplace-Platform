import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plus, Trash2, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'material', label: 'Construction Material', emoji: '🧱', desc: 'Cement, Balu, Gitti, Sariya' },
  { id: 'transport', label: 'Transport', emoji: '🚛', desc: 'Truck, Dumper, Vehicle' },
  { id: 'equipment', label: 'Equipment / Machine', emoji: '🚜', desc: 'JCB, Excavator, Crane' },
];

const MATERIAL_ITEMS = ['Cement (OPC)', 'Cement (PPC)', 'Balu (River Sand)', 'Balu (M-Sand)', 'Gitti 10mm', 'Gitti 20mm', 'Gitti 40mm', 'Sariya (TMT Fe500)', 'Sariya (TMT Fe550)', 'Bricks / Eent', 'Other'];
const TRANSPORT_ITEMS = ['10-Wheeler Truck', '12-Wheeler Truck', 'Dumper', 'Mini Truck', 'Tractor', 'Other'];
const EQUIPMENT_ITEMS = ['JCB (Mini)', 'JCB (Standard)', 'Excavator', 'Concrete Mixer', 'Vibrator Machine', 'Crane', 'Other'];

const UNITS = {
  material: ['Bag', 'CFT', 'Ton', 'Cubic Meter', 'Piece', 'Unit'],
  transport: ['Trip', 'Day', 'Hour'],
  equipment: ['Hour', 'Day', 'Week'],
};

const SLOTS = [
  { id: 'morning', label: 'Morning', time: '7 AM – 12 PM' },
  { id: 'evening', label: 'Evening', time: '12 PM – 6 PM' },
  { id: 'anytime', label: 'Anytime', time: 'Flexible' },
];

const TOTAL_STEPS = 4;

const emptyItem = (category) => ({
  name: '',
  customName: '',
  quantity: '',
  unit: UNITS[category]?.[0] || 'Bag',
});

export default function RequestOrder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);

  const [form, setForm] = useState({
    category: params.get('category') || '',
    items: [emptyItem(params.get('category') || 'material')],
    delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' },
    customer: { name: '', phone: '', email: '' },
    notes: '',
  });

  useEffect(() => {
    if (params.get('category')) setStep(2);
  }, []);

  const itemOptions = {
    material: MATERIAL_ITEMS,
    transport: TRANSPORT_ITEMS,
    equipment: EQUIPMENT_ITEMS,
  }[form.category] || [];

  const setCategory = (cat) => {
    setForm(f => ({ ...f, category: cat, items: [emptyItem(cat)] }));
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, emptyItem(f.category)] }));
  };

  const removeItem = (i) => {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  };

  const updateItem = (i, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: value };
      return { ...f, items };
    });
  };

  const updateDelivery = (field, value) => {
    setForm(f => ({ ...f, delivery: { ...f.delivery, [field]: value } }));
  };

  const updateCustomer = (field, value) => {
    setForm(f => ({ ...f, customer: { ...f.customer, [field]: value } }));
  };

  const canNext = () => {
    if (step === 1) return !!form.category;
    if (step === 2) {
      return form.items.every(it => {
        const name = it.name === 'Other' ? it.customName : it.name;
        return name && it.quantity && Number(it.quantity) > 0;
      });
    }
    if (step === 3) {
      return form.delivery.address && form.delivery.city && form.delivery.date;
    }
    if (step === 4) {
      return form.customer.name && /^[6-9]\d{9}$/.test(form.customer.phone);
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: form.items.map(it => ({
          name: it.name === 'Other' ? it.customName : it.name,
          quantity: Number(it.quantity),
          unit: it.unit,
        })),
      };
      const customerToken = localStorage.getItem('customerToken');
      const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      const { data } = await axios.post('/api/orders/request', payload, { headers });
      setSubmittedOrderId(data.orderId);
      toast.success('Order submitted! We will contact you shortly.');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Success screen
  if (submittedOrderId) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Request Submitted!</h1>
            <p className="text-gray-500 mb-6">
              Hum 2 ghante ke andar call/WhatsApp karenge best quote ke saath.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Tumhara Order ID</p>
              <p className="text-2xl font-black text-orange-500 tracking-wider">{submittedOrderId}</p>
              <p className="text-xs text-gray-400 mt-1">Is ID se order track kar sakte ho</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/track/${submittedOrderId}`)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => { setSubmittedOrderId(null); setStep(1); setForm({ category: '', items: [emptyItem('material')], delivery: { address: '', city: '', pincode: '', date: '', slot: 'anytime' }, customer: { name: '', phone: '', email: '' }, notes: '' }); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                Nayi Request
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Category', 'Items', 'Delivery', 'Contact'].map((label, i) => (
              <span key={label} className={`text-xs ${i + 1 <= step ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Kya chahiye?</h2>
              <p className="text-gray-500 text-sm mb-6">Category select karo</p>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      form.category === cat.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{cat.label}</p>
                      <p className="text-sm text-gray-500">{cat.desc}</p>
                    </div>
                    {form.category === cat.id && (
                      <CheckCircle className="w-5 h-5 text-orange-500 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Kya kya chahiye?</h2>
              <p className="text-gray-500 text-sm mb-6">Items aur quantity batao</p>
              <div className="space-y-4">
                {form.items.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                    {form.items.length > 1 && (
                      <button
                        onClick={() => removeItem(i)}
                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Item {i + 1}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <select
                          value={item.name}
                          onChange={e => updateItem(i, 'name', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                        >
                          <option value="">-- Select --</option>
                          {itemOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      {item.name === 'Other' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item ka naam batao</label>
                          <input
                            type="text"
                            value={item.customName}
                            onChange={e => updateItem(i, 'customName', e.target.value)}
                            placeholder="Jaise: Fly Ash Brick"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          />
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', e.target.value)}
                            placeholder="e.g. 50"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <select
                            value={item.unit}
                            onChange={e => updateItem(i, 'unit', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                          >
                            {(UNITS[form.category] || ['Unit']).map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-3 flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Aur item add karo
              </button>
            </div>
          )}

          {/* Step 3: Delivery */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Delivery Details</h2>
              <p className="text-gray-500 text-sm mb-6">Kahan aur kab chahiye?</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Address <span className="text-red-400">*</span></label>
                  <textarea
                    value={form.delivery.address}
                    onChange={e => updateDelivery('address', e.target.value)}
                    placeholder="Gali, mohalla, landmark..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.delivery.city}
                      onChange={e => updateDelivery('city', e.target.value)}
                      placeholder="Ranchi"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.delivery.pincode}
                      onChange={e => updateDelivery('pincode', e.target.value)}
                      placeholder="834001"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={form.delivery.date}
                    onChange={e => updateDelivery('date', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Slot</label>
                  <div className="flex gap-3">
                    {SLOTS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => updateDelivery('slot', s.id)}
                        className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm transition-all ${
                          form.delivery.slot === s.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                            : 'border-gray-100 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs opacity-70">{s.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Details</h2>
              <p className="text-gray-500 text-sm mb-6">Quote is number pe milega</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aapka Naam <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.customer.name}
                    onChange={e => updateCustomer('name', e.target.value)}
                    placeholder="Poora naam"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone <span className="text-red-400">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.customer.phone}
                      onChange={e => updateCustomer('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  {form.customer.phone && !/^[6-9]\d{9}$/.test(form.customer.phone) && (
                    <p className="text-red-400 text-xs mt-1">Valid 10-digit number daalo</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="email"
                    value={form.customer.email}
                    onChange={e => updateCustomer('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Koi special requirement hai toh batao..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-2">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Order Summary</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="text-gray-400">Category:</span> {CATEGORIES.find(c => c.id === form.category)?.label}</p>
                    <p><span className="text-gray-400">Items:</span> {form.items.map(it => `${it.name === 'Other' ? it.customName : it.name} (${it.quantity} ${it.unit})`).join(', ')}</p>
                    <p><span className="text-gray-400">Delivery:</span> {form.delivery.city}, {new Date(form.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Submit Request</>
              )}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
