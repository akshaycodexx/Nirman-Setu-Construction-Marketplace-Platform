import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { HardHat, Printer, MapPin, Calendar, Phone, Mail, Package, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Receipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      const customerToken = localStorage.getItem('customerToken');
      if (customerToken) {
        try {
          const { data } = await axios.get(`/api/customer/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${customerToken}` },
          });
          setOrder(data);
          return;
        } catch {}
      }
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const { data } = await axios.get(`/api/admin/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          setOrder(data.order || data);
          return;
        } catch {}
      }
      setError('Receipt not found or access denied.');
    };
    fetchOrder().finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      Loading receipt...
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <p className="text-red-500 font-medium">{error || 'Receipt not found'}</p>
      <Link to="/" className="text-sm text-blue-500 hover:underline">← Go Home</Link>
    </div>
  );

  const advance = order.payment?.advanceAmount || 0;
  const total = order.quote?.amount || 0;
  const balance = total > 0 ? total - advance : null;
  const fullyPaid = order.payment?.status === 'fully_paid';
  const advancePaid = order.payment?.status === 'advance_paid';

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          .receipt-shell { padding: 0 !important; background: white !important; }
          .receipt-card { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
        }
        @page { margin: 12mm; }
      `}</style>

      <div className="receipt-shell min-h-screen bg-gray-100 py-8 px-4">

        {/* Toolbar */}
        <div className="no-print max-w-2xl mx-auto mb-5 flex items-center justify-between">
          <Link to={-1} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        {/* Receipt Card */}
        <div className="receipt-card max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gray-900 px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2.5 rounded-xl shrink-0">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white text-xl font-black tracking-tight leading-none">NIRMAN SETU</h1>
                  <p className="text-orange-400 text-xs font-medium mt-0.5">Construction Marketplace</p>
                  <p className="text-gray-500 text-xs mt-0.5">Jharkhand, India</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                  RECEIPT
                </span>
                <p className="text-gray-300 text-sm font-mono mt-2">{order.orderId}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* ── Payment status banner ── */}
          {(advancePaid || fullyPaid) && (
            <div className={`px-8 py-3 flex items-center gap-2 text-sm font-semibold ${
              fullyPaid ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              {fullyPaid
                ? `Full payment of ₹${total.toLocaleString('en-IN')} received`
                : `Advance of ₹${advance.toLocaleString('en-IN')} received — Balance ₹${balance?.toLocaleString('en-IN')} pending`}
            </div>
          )}

          {/* ── Body ── */}
          <div className="px-8 py-6 space-y-6">

            {/* Bill To + Order Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                <p className="font-bold text-gray-900 text-base leading-snug">{order.customer?.name}</p>
                {order.customer?.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" /> +91 {order.customer.phone}
                  </p>
                )}
                {order.customer?.email && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" /> {order.customer.email}
                  </p>
                )}
                <p className="text-sm text-gray-500 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
                  <span>{order.delivery?.address}, {order.delivery?.city}{order.delivery?.pincode ? ` — ${order.delivery.pincode}` : ''}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-semibold text-gray-800 capitalize">{order.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Date</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(order.delivery?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Slot</span>
                  <span className="font-semibold text-gray-800 capitalize">{order.delivery?.slot}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Status</span>
                  <span className="font-semibold text-gray-800 capitalize">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200" />

            {/* Items Table */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Items Ordered
              </p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-800 text-gray-300 text-xs font-semibold uppercase tracking-wider px-4 py-2.5">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-3 text-center">Qty</span>
                  <span className="col-span-3 text-right">Unit</span>
                </div>
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-12 px-4 py-3 text-sm border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <span className="col-span-6 font-medium text-gray-800">{item.name}</span>
                    <span className="col-span-3 text-center text-gray-600 font-mono">{item.quantity}</span>
                    <span className="col-span-3 text-right text-gray-500">{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            {total > 0 && (
              <>
                <div className="border-t border-dashed border-gray-200" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Summary</p>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 flex justify-between text-sm border-b border-gray-100">
                      <span className="text-gray-600">Total Quote Amount</span>
                      <span className="font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    {advance > 0 && (
                      <div className="px-5 py-3 flex justify-between text-sm border-b border-gray-100">
                        <span className="text-gray-600">Advance Paid <span className="text-gray-400 font-normal">(30%)</span></span>
                        <span className="font-bold text-blue-600">− ₹{advance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className={`px-5 py-4 flex justify-between items-center ${fullyPaid ? 'bg-green-50' : advance > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      <span className="font-bold text-gray-800 text-sm">Balance Due</span>
                      <span className={`font-black text-lg ${fullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                        {fullyPaid ? '₹0' : balance !== null ? `₹${balance.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                  </div>
                  {order.quote?.breakdown && (
                    <p className="text-xs text-gray-400 mt-2 italic px-1">{order.quote.breakdown}</p>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-yellow-800">{order.notes}</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="bg-gray-900 px-8 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-orange-400 font-bold text-sm">Thank you for choosing Nirman Setu!</p>
                <p className="text-gray-500 text-xs mt-0.5">Jharkhand's most trusted construction marketplace</p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                <p>WhatsApp / Call: +91 98765 43210</p>
                <p>nirman-setu.in</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 text-center text-xs text-gray-600">
              This is a computer-generated receipt and does not require a physical signature.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
