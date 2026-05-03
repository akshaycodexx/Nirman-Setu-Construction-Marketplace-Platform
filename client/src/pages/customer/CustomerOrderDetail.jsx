import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'quoted', 'confirmed', 'dispatched', 'delivered'];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CustomerOrderDetail() {
  const { orderId } = useParams();
  const { customer, authHeader } = useCustomer();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () =>
    axios.get(`/api/customer/orders/${orderId}`, { headers: authHeader() })
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await axios.put(`/api/customer/orders/${orderId}/cancel`, {}, { headers: authHeader() });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayAdvance = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Payment gateway failed to load. Check your internet.'); return; }

      const { data } = await axios.post(
        `/api/customer/orders/${orderId}/payment/create`,
        {},
        { headers: authHeader() }
      );

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Nirman Setu',
        description: `Advance for order ${orderId}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: customer?.name,
          contact: customer?.phone,
          email: customer?.email || '',
        },
        theme: { color: '#3B82F6' },
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              `/api/customer/orders/${orderId}/payment/verify`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: authHeader() }
            );
            setOrder(verifyData.order);
            toast.success('Payment successful! Order confirmed.');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <CustomerLayout>
      <div className="flex items-center justify-center py-24 text-gray-400">Loading...</div>
    </CustomerLayout>
  );

  if (!order) return (
    <CustomerLayout>
      <div className="text-center py-24">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Order not found.</p>
        <Link to="/customer/orders" className="text-blue-500 text-sm mt-2 block">← Back to orders</Link>
      </div>
    </CustomerLayout>
  );

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const canPay = order.status === 'quoted' && order.payment.status === 'none' && order.quote?.amount;
  const canCancel = order.status === 'pending';

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/customer/orders" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{order.orderId}</h1>
            <p className="text-gray-500 text-sm capitalize">{order.category}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusBadge status={order.status} />
            {order.payment.status !== 'none' && <PaymentBadge status={order.payment.status} />}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h2>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= stepIndex ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 capitalize text-center">{step}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < stepIndex ? 'bg-blue-500' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote + Pay section */}
        {order.quote?.amount && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Quote from Nirman Setu</h2>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{order.quote.amount.toLocaleString('en-IN')}</p>
                {order.quote.breakdown && (
                  <p className="text-gray-500 text-sm mt-1 whitespace-pre-wrap">{order.quote.breakdown}</p>
                )}
              </div>
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
            </div>

            {canPay && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-blue-800 text-sm font-medium mb-1">
                  Advance required: ₹{Math.ceil(order.quote.amount * 0.3).toLocaleString('en-IN')} (30%)
                </p>
                <p className="text-blue-600 text-xs mb-3">Pay the advance to confirm your order and start processing.</p>
                <button
                  onClick={handlePayAdvance}
                  disabled={paying}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Pay Advance</>}
                </button>
              </div>
            )}

            {order.payment.status === 'advance_paid' && (
              <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Advance of ₹{order.payment.advanceAmount?.toLocaleString('en-IN')} paid. Order confirmed!</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items Ordered
          </h2>
          <div className="divide-y divide-gray-50">
            {order.items.map((item, i) => (
              <div key={i} className="py-2 flex justify-between">
                <span className="text-gray-800 text-sm">{item.name}</span>
                <span className="text-gray-500 text-sm">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Delivery Details
          </h2>
          <div className="space-y-1.5 text-sm text-gray-700">
            <p>{order.delivery.address}, {order.delivery.city}</p>
            {order.delivery.pincode && <p className="text-gray-500">Pincode: {order.delivery.pincode}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date(order.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-gray-400">·</span>
              <span className="capitalize">{order.delivery.slot}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Your Notes</h2>
            <p className="text-gray-600 text-sm">{order.notes}</p>
          </div>
        )}

        {/* Timeline */}
        {order.timeline?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Activity</h2>
            <div className="space-y-3">
              {[...order.timeline].reverse().map((t, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="capitalize font-medium text-gray-800">{t.status}</span>
                    {t.note && <span className="text-gray-500"> — {t.note}</span>}
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(t.at).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
