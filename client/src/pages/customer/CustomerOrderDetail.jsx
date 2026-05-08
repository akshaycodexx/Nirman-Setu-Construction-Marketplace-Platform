import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { useSocket } from '../../context/SocketContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import ChatPanel from '../../components/ChatPanel';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Loader2, CheckCircle, AlertCircle, XCircle, Receipt, Star, Flag, RotateCcw } from 'lucide-react';
import useT from '../../i18n/useT';

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
  const navigate = useNavigate();
  const { customer, authHeader } = useCustomer();
  const socketRef = useSocket();
  const t = useT();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [platformFee, setPlatformFee] = useState(null);
  const [payingFee, setPayingFee] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleComplaint = async () => {
    if (!complaintText.trim()) { toast.error(t('custod.complaintEmpty')); return; }
    setSubmittingComplaint(true);
    try {
      const { data } = await axios.post(
        `/api/customer/orders/${orderId}/complaint`,
        { text: complaintText },
        { headers: authHeader() }
      );
      setOrder(data.order);
      setComplaintText('');
      toast.success(t('custod.complaintSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('custod.complaintFailed'));
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleReview = async () => {
    if (!reviewRating) { toast.error(t('custod.ratingRequired')); return; }
    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        `/api/customer/orders/${orderId}/review`,
        { rating: reviewRating, comment: reviewComment },
        { headers: authHeader() }
      );
      setOrder(data.order);
      toast.success(t('custod.reviewSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('custod.reviewFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchOrder = () =>
    axios.get(`/api/customer/orders/${orderId}`, { headers: authHeader() })
      .then(r => setOrder(r.data))
      .catch(() => toast.error(t('custod.notFound')))
      .finally(() => setLoading(false));

  const fetchFee = () =>
    axios.get(`/api/customer/orders/${orderId}/fee`, { headers: authHeader() })
      .then(r => setPlatformFee(r.data.fee))
      .catch(() => {});

  const handlePayFee = async () => {
    setPayingFee(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error(t('custod.feeGwFailed')); return; }
      const { data } = await axios.post(`/api/customer/orders/${orderId}/fee/create`, {}, { headers: authHeader() });
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Nirman Setu',
        description: `Platform fee — ${orderId}`,
        order_id: data.razorpayOrderId,
        prefill: { name: customer?.name, contact: customer?.phone },
        theme: { color: '#F97316' },
        handler: async (response) => {
          try {
            await axios.post(`/api/customer/orders/${orderId}/fee/verify`, {
              razorpayOrderId: data.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              feeId: data.feeId,
            }, { headers: authHeader() });
            setPlatformFee(null);
            toast.success(t('custod.feePaid'));
          } catch { toast.error(t('custod.feeVerifyFailed')); }
        },
        modal: { ondismiss: () => setPayingFee(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custod.feeInitFailed'));
    } finally {
      setPayingFee(false);
    }
  };

  useEffect(() => { fetchOrder(); fetchFee(); }, [orderId]);

  // Real-time: join order room, refresh on status update
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !orderId) return;

    socket.emit('join:order', orderId);

    const handleUpdate = (data) => {
      toast.success(t('custod.orderUpdate', { status: data.status }));
      fetchOrder();
    };

    socket.on('order:updated', handleUpdate);
    return () => {
      socket.off('order:updated', handleUpdate);
      socket.emit('leave:order', orderId);
    };
  }, [socketRef, orderId]);

  const handleCancel = async () => {
    if (!window.confirm(t('custod.cancelConfirm'))) return;
    setCancelling(true);
    try {
      const { data } = await axios.put(`/api/customer/orders/${orderId}/cancel`, {}, { headers: authHeader() });
      setOrder(data.order);
      toast.success(t('custod.cancelled'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('custod.cancelBtn'));
    } finally {
      setCancelling(false);
    }
  };

  const handlePayAdvance = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error(t('custod.gwFailed')); return; }

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
            toast.success(t('custod.paySuccess'));
          } catch {
            toast.error(t('custod.payVerifyFailed'));
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
      <div className="flex items-center justify-center py-24 text-gray-400">{t('custod.loading')}</div>
    </CustomerLayout>
  );

  if (!order) return (
    <CustomerLayout>
      <div className="text-center py-24">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">{t('custod.notFound')}</p>
        <Link to="/customer/orders" className="text-blue-500 text-sm mt-2 block">{t('custod.backOrders')}</Link>
      </div>
    </CustomerLayout>
  );

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const canPay = order.status === 'quoted' && order.payment.status === 'none' && order.quote?.amount;
  const canCancel = order.status === 'pending';
  const canReceipt = order.payment?.status === 'advance_paid' || order.payment?.status === 'fully_paid';

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
            {canReceipt && (
              <>
                <Link to={`/receipt/${order.orderId}`} target="_blank"
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Receipt className="w-3 h-3" /> {t('custod.receipt')}
                </Link>
                <Link to={`/invoice/${order.orderId}`} target="_blank"
                  className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 border border-orange-200 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Receipt className="w-3 h-3" /> {t('custod.gstInvoice')}
                </Link>
              </>
            )}
            {(order.status === 'delivered' || order.status === 'cancelled') && (
              <button
                onClick={() => {
                  sessionStorage.setItem('reorder_items', JSON.stringify(order.items));
                  navigate(`/request?category=${order.category}`);
                }}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> {t('custod.reorder')}
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                {t('custod.cancelBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('custod.progress')}</h2>
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
                <h2 className="text-sm font-semibold text-gray-700">{t('custod.quoteFrom')}</h2>
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
                  {t('custod.advReq', { amount: Math.ceil(order.quote.amount * 0.3).toLocaleString('en-IN') })}
                </p>
                <p className="text-blue-600 text-xs mb-3">{t('custod.advDesc')}</p>
                <button
                  onClick={handlePayAdvance}
                  disabled={paying}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('custod.processing')}</> : <><CreditCard className="w-4 h-4" /> {t('custod.payAdv')}</>}
                </button>
              </div>
            )}

            {order.payment.status === 'advance_paid' && (
              <>
                <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{t('custod.advPaid', { amount: order.payment.advanceAmount?.toLocaleString('en-IN') })}</span>
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{t('custod.balDue')}</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    ₹{(order.quote.amount - order.payment.advanceAmount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">
                    {t('custod.balCalc', { total: order.quote.amount.toLocaleString('en-IN'), adv: order.payment.advanceAmount.toLocaleString('en-IN') })}
                  </p>
                </div>
              </>
            )}
            {order.payment.status === 'fully_paid' && (
              <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{t('custod.fullyPaid', { amount: order.quote.amount.toLocaleString('en-IN') })}</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> {t('custod.itemsOrdered')}
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
            <MapPin className="w-4 h-4" /> {t('custod.deliveryDets')}
          </h2>
          <div className="space-y-1.5 text-sm text-gray-700">
            <p>{order.delivery.address}, {order.delivery.city}</p>
            {order.delivery.pincode && <p className="text-gray-500">{t('custod.pincode', { p: order.delivery.pincode })}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date(order.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-gray-400">·</span>
              <span className="capitalize">{order.delivery.slot}</span>
            </div>
          </div>
        </div>

        {/* Platform Fee (if customer needs to pay) */}
        {platformFee && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h2 className="text-sm font-bold text-orange-800">{t('custod.platformFeeTitle')}</h2>
                <p className="text-orange-700 text-xs mt-0.5">{t('custod.platformFeeNote')}</p>
                <p className="text-2xl font-black text-orange-900 mt-2">₹{platformFee.amount.toLocaleString('en-IN')}</p>
                {platformFee.note && <p className="text-xs text-orange-600 italic mt-0.5">{platformFee.note}</p>}
              </div>
            </div>
            <button onClick={handlePayFee} disabled={payingFee}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {payingFee ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('custod.processing')}</> : <><CreditCard className="w-4 h-4" /> {t('custod.payFee')}</>}
            </button>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">{t('custod.yourNotes')}</h2>
            <p className="text-gray-600 text-sm">{order.notes}</p>
          </div>
        )}

        {/* Complaint Section */}
        {!['pending', 'cancelled'].includes(order.status) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {order.complaint?.text ? (
              <>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Flag className={`w-4 h-4 ${order.complaint.status === 'resolved' ? 'text-green-500' : 'text-red-500'}`} />
                  {t('custod.complaint')}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-1 ${order.complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {order.complaint.status === 'resolved' ? t('custod.complaintResolved') : t('custod.complaintOpen')}
                  </span>
                </h2>
                <p className="text-sm text-gray-700 bg-red-50 rounded-xl p-3 mb-2">"{order.complaint.text}"</p>
                <p className="text-xs text-gray-400">{new Date(order.complaint.raisedAt).toLocaleDateString('en-IN')}</p>
                {order.complaint.resolution && (
                  <div className="mt-3 bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">{t('custod.adminResp')}</p>
                    <p className="text-sm text-green-800">{order.complaint.resolution}</p>
                    <p className="text-xs text-green-600 mt-1">{new Date(order.complaint.resolvedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400" /> {t('custod.problemTitle')}
                </h2>
                <textarea
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  placeholder={t('custod.problemPlaceholder')}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none mb-3"
                />
                <button onClick={handleComplaint} disabled={!complaintText.trim() || submittingComplaint}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                  {submittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  {t('custod.raiseComplaint')}
                </button>
              </>
            )}
          </div>
        )}

        {/* Review Section */}
        {order.status === 'delivered' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {order.review?.rating ? (
              <>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {t('custod.yourReview')}
                </h2>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= order.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">{order.review.rating}/5</span>
                </div>
                {order.review.comment && <p className="text-sm text-gray-600 italic">"{order.review.comment}"</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(order.review.reviewedAt).toLocaleDateString('en-IN')}</p>
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> {t('custod.rateExp')}
                </h2>
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <button key={s}
                      onMouseEnter={() => setReviewHover(s)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(s)}
                      className="p-0.5 transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 transition-colors ${
                        s <= (reviewHover || reviewRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-200'
                      }`} />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {[null, t('custod.rating.1'), t('custod.rating.2'), t('custod.rating.3'), t('custod.rating.4'), t('custod.rating.5')][reviewRating]}
                    </span>
                  )}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder={t('custod.reviewPlaceholder')}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-3"
                />
                <button onClick={handleReview} disabled={!reviewRating || submittingReview}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  {submittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('custod.submitting')}</> : <><Star className="w-4 h-4 fill-gray-900" /> {t('custod.submitReview')}</>}
                </button>
              </>
            )}
          </div>
        )}

        {/* Support Chat */}
        <ChatPanel orderId={orderId} role="customer" authHeaders={authHeader} />

        {/* Timeline */}
        {order.timeline?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('custod.activity')}</h2>
            <div className="space-y-3">
              {[...order.timeline].reverse().map((entry, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="capitalize font-medium text-gray-800">{entry.status}</span>
                    {entry.note && <span className="text-gray-500"> — {entry.note}</span>}
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(entry.at).toLocaleString('en-IN')}</p>
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
