import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { HardHat, Printer, MapPin, Calendar, Phone, Mail, Package, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

const GSTIN = 'YOUR_GSTIN_HERE'; // Replace with actual GSTIN
const GST_RATE = 18; // 18% GST (CGST 9% + SGST 9%)

const HSN = {
  basic_materials: '6810', structural: '7308', wood_carpentry: '4418',
  chemicals: '3824', paint_finishing: '3210', flooring_tiling: '6907',
  doors_windows: '7308', interior_furniture: '9403', electrical: '8537',
  plumbing_sanitary: '3922', machinery: '8479', transport: '9965',
  labour: '9954', contractors: '9954', design_planning: '9983',
  shuttering: '7308', water_utilities: '3926', smart_features: '8537',
  complete_services: '9954', commercial: '9954', support_services: '9983',
};

const CAT_LABELS = {
  basic_materials: 'Basic Materials', structural: 'Structural', wood_carpentry: 'Wood & Carpentry',
  chemicals: 'Chemicals', paint_finishing: 'Paint & Finishing', flooring_tiling: 'Flooring & Tiling',
  doors_windows: 'Doors & Windows', interior_furniture: 'Interior & Furniture', electrical: 'Electrical',
  plumbing_sanitary: 'Plumbing & Sanitary', machinery: 'Machinery', transport: 'Transport',
  labour: 'Labour', contractors: 'Contractors', design_planning: 'Design & Planning',
  shuttering: 'Shuttering', water_utilities: 'Water & Utilities', smart_features: 'Smart Features',
  complete_services: 'Complete Services', commercial: 'Commercial', support_services: 'Support Services',
};

function invoiceNo(orderId) {
  return `INV-${orderId}`;
}

export default function Invoice() {
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
          setOrder(data); return;
        } catch {}
      }
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const { data } = await axios.get(`/api/admin/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          setOrder(data.order || data); return;
        } catch {}
      }
      setError('Invoice not found or access denied.');
    };
    fetchOrder().finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-400 text-sm">Loading...</div>
  );
  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <p className="text-red-500 font-medium">{error || 'Invoice not found'}</p>
      <Link to="/" className="text-sm text-blue-500 hover:underline">← Go Home</Link>
    </div>
  );

  const total = order.quote?.amount || 0;
  const baseAmount = Math.round(total / 1.18);
  const gstAmount = total - baseAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;
  const advance = order.payment?.advanceAmount || 0;
  const balance = total - advance;
  const fullyPaid = order.payment?.status === 'fully_paid';
  const hsn = HSN[order.category] || '9954';
  const invoiceDate = order.payment?.advancePaidAt
    ? new Date(order.payment.advancePaidAt)
    : new Date(order.createdAt);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          .invoice-shell { padding: 0 !important; background: white !important; }
          .invoice-card { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
        }
        @page { margin: 10mm; size: A4; }
      `}</style>

      <div className="invoice-shell min-h-screen bg-gray-100 py-8 px-4">

        {/* Toolbar */}
        <div className="no-print max-w-3xl mx-auto mb-5 flex items-center justify-between">
          <Link to={-1} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        <div className="invoice-card max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden text-gray-800">

          {/* Header */}
          <div className="px-8 py-6 border-b-2 border-orange-500">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2.5 rounded-xl shrink-0">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900 text-xl font-black tracking-tight">NIRMAN SETU</h1>
                  <p className="text-orange-500 text-xs font-semibold mt-0.5">Construction Marketplace</p>
                  <p className="text-gray-400 text-xs">Jharkhand, India</p>
                  <p className="text-gray-500 text-xs mt-0.5">GSTIN: <span className="font-mono font-semibold">{GSTIN}</span></p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span className="text-xl font-black text-gray-900 uppercase tracking-wider">GST Invoice</span>
                </div>
                <p className="text-sm font-mono font-bold text-gray-700">{invoiceNo(order.orderId)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Date: {invoiceDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Order: {order.orderId}</p>
              </div>
            </div>
          </div>

          {/* Bill To / Ship To */}
          <div className="px-8 py-5 grid grid-cols-2 gap-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
              <p className="font-bold text-gray-900 text-base">{order.customer?.name}</p>
              {order.customer?.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> +91 {order.customer.phone}
                </p>
              )}
              {order.customer?.email && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {order.customer.email}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ship To</p>
              <p className="text-sm text-gray-700 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span>{order.delivery?.address}, {order.delivery?.city}{order.delivery?.pincode ? ` — ${order.delivery.pincode}` : ''}, Jharkhand</span>
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Delivery: {new Date(order.delivery?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-left rounded-tl-lg">#</th>
                  <th className="px-3 py-2.5 text-left">Item / Description</th>
                  <th className="px-3 py-2.5 text-center">HSN</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-right rounded-tr-lg">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{item.name}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-gray-500">{hsn}</td>
                    <td className="px-3 py-2.5 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2 italic">
              Category: {CAT_LABELS[order.category] || order.category} · HSN/SAC: {hsn}
            </p>
          </div>

          {/* GST Summary */}
          {total > 0 && (
            <div className="px-8 pb-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Tax breakdown */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tax Breakdown</p>
                  <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
                    <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <span className="text-gray-600">Taxable Value</span>
                      <span className="font-semibold text-gray-800">₹{baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b border-gray-100">
                      <span className="text-gray-600">CGST @ 9%</span>
                      <span className="font-semibold text-gray-700">₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2 border-b border-gray-100">
                      <span className="text-gray-600">SGST @ 9%</span>
                      <span className="font-semibold text-gray-700">₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5 bg-orange-50">
                      <span className="font-bold text-orange-700">Total GST (18%)</span>
                      <span className="font-bold text-orange-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment summary */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Summary</p>
                  <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
                    <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <span className="text-gray-600">Invoice Total (incl. GST)</span>
                      <span className="font-bold text-gray-900 text-base">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    {advance > 0 && (
                      <div className="flex justify-between px-4 py-2 border-b border-gray-100">
                        <span className="text-gray-600">Advance Paid (30%)</span>
                        <span className="font-semibold text-blue-600">−₹{advance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className={`flex justify-between px-4 py-2.5 ${fullyPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                      <span className={`font-bold text-sm ${fullyPaid ? 'text-green-700' : 'text-orange-700'}`}>
                        {fullyPaid ? 'Fully Settled' : 'Balance Due on Delivery'}
                      </span>
                      <span className={`font-black text-lg ${fullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                        {fullyPaid ? '₹0' : `₹${balance.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                  {fullyPaid && (
                    <div className="flex items-center gap-1.5 mt-2 text-green-600 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Payment fully received
                    </div>
                  )}
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Invoice Amount in Words: </span>
                  {numberToWords(total)} Only
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="px-8 pb-5">
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1">Customer Notes</p>
                <p className="text-sm text-yellow-800">{order.notes}</p>
              </div>
            </div>
          )}

          {/* T&C + Footer */}
          <div className="bg-gray-900 px-8 py-5">
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-400">
              <div>
                <p className="font-semibold text-gray-300 mb-1">Terms & Conditions</p>
                <p>1. Payment terms as agreed during order confirmation.</p>
                <p>2. Balance amount payable on delivery in cash.</p>
                <p>3. Subject to Jharkhand jurisdiction.</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-400 mb-1">Nirman Setu</p>
                <p>WhatsApp / Call: +91 98765 43210</p>
                <p>nirman-setu.in</p>
                <p className="mt-2 text-gray-500">GSTIN: {GSTIN}</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4 flex items-center justify-between text-xs text-gray-600">
              <span>This is a computer-generated GST invoice and does not require a physical signature.</span>
              <span className="font-mono">#{invoiceNo(order.orderId)}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function numberToWords(num) {
  if (!num) return 'Zero Rupees';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = 'Rupees ' + convert(rupees);
  if (paise) result += ' and ' + convert(paise) + ' Paise';
  return result;
}
