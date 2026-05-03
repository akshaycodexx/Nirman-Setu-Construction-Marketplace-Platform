import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import ChatPanel from '../../components/ChatPanel';
import {
  ArrowLeft, Package, User, MapPin,
  Send, RefreshCw, Loader2, CheckCircle, AlertCircle, UserCheck, CreditCard, Receipt,
  Star, IndianRupee, Wallet, Flag
} from 'lucide-react';

const adminAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const PAYMENT_LABELS = {
  none: { label: 'Unpaid', cls: 'bg-gray-100 text-gray-600' },
  advance_paid: { label: 'Advance Paid', cls: 'bg-blue-100 text-blue-700' },
  fully_paid: { label: 'Fully Paid', cls: 'bg-green-100 text-green-700' },
  refunded: { label: 'Refunded', cls: 'bg-red-100 text-red-700' },
};

const STATUSES = ['pending', 'quoted', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Quote form
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteBreakdown, setQuoteBreakdown] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);

  // Supplier assignment
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    axios.get('/api/admin/suppliers').then(r => setSuppliers(r.data.suppliers || [])).catch(() => {});
  }, []);

  const handleAssignSupplier = async () => {
    if (!selectedSupplier) return;
    setAssigning(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${orderId}/assign-supplier`, { supplierId: selectedSupplier });
      setOrder(data.order);
      setNewStatus('confirmed');
      toast.success('Supplier assigned & order confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
    setAssigning(false);
  };

  useEffect(() => {
    axios.get(`/api/admin/orders/${orderId}`)
      .then(r => {
        setOrder(r.data.order);
        setNewStatus(r.data.order.status);
        setAdminNote(r.data.order.adminNote || '');
        if (r.data.order.quote) {
          setQuoteAmount(r.data.order.quote.amount || '');
          setQuoteBreakdown(r.data.order.quote.breakdown || '');
        }
      })
      .catch(() => toast.error('Order nahi mila'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
        adminNote,
      });
      setOrder(data.order);
      toast.success('Status updated!');
    } catch {
      toast.error('Update failed');
    }
    setSaving(false);
  };

  const handleSendQuote = async () => {
    if (!quoteAmount || !quoteBreakdown) {
      toast.error('Amount aur breakdown dono zaroori hain');
      return;
    }
    setSendingQuote(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${orderId}/quote`, {
        amount: Number(quoteAmount),
        breakdown: quoteBreakdown,
        adminNote,
      });
      setOrder(data.order);
      toast.success('Quote sent!');
    } catch {
      toast.error('Quote send failed');
    }
    setSendingQuote(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Order nahi mila</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderId}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
        {order.quote?.amount && (
          <Link to={`/receipt/${order.orderId}`} target="_blank"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
            <Receipt className="w-4 h-4" /> Receipt
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col — order info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Customer Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Name" value={order.customer?.name} />
              <InfoRow label="Phone" value={order.customer?.phone} copyable />
              {order.customer?.email && <InfoRow label="Email" value={order.customer.email} />}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" /> Order Items
              <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{order.category}</span>
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 font-mono text-sm bg-gray-50 px-3 py-1 rounded-lg">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 bg-yellow-50 rounded-xl p-3">
                <span className="font-medium text-yellow-700">Notes: </span>{order.notes}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Delivery Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Address" value={order.delivery?.address} />
              <InfoRow label="City" value={order.delivery?.city} />
              {order.delivery?.pincode && <InfoRow label="Pincode" value={order.delivery.pincode} />}
              <InfoRow label="Date" value={new Date(order.delivery?.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} />
              <InfoRow label="Slot" value={<span className="capitalize">{order.delivery?.slot}</span>} />
            </div>
          </div>

          {/* Existing quote */}
          {order.quote?.amount && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Quote Sent
              </h3>
              <div className="text-sm space-y-1">
                <p><span className="text-green-600">Amount:</span> <strong className="text-green-900 text-lg">₹{order.quote.amount.toLocaleString('en-IN')}</strong></p>
                <p><span className="text-green-600">Breakdown:</span> {order.quote.breakdown}</p>
                <p><span className="text-green-600">Sent at:</span> {new Date(order.quote.sentAt).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <PaymentCard order={order} setOrder={setOrder} orderId={orderId} />

          {/* Support Chat */}
          <ChatPanel orderId={orderId} role="admin" authHeaders={adminAuthHeader} />

          {/* Complaint */}
          {order.complaint?.text && (
            <ComplaintCard order={order} setOrder={setOrder} orderId={orderId} />
          )}

          {/* Customer Review */}
          {order.review?.rating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> Customer Review
              </h3>
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= order.review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
                <span className="ml-2 text-sm font-bold text-yellow-800">{order.review.rating}/5</span>
              </div>
              {order.review.comment && <p className="text-sm text-yellow-700 italic">"{order.review.comment}"</p>}
              <p className="text-xs text-yellow-600 mt-1">{new Date(order.review.reviewedAt).toLocaleDateString('en-IN')}</p>
            </div>
          )}
        </div>

        {/* Right col — actions */}
        <div className="space-y-4">

          {/* Assign Supplier */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-500" /> Assign Supplier
            </h3>
            {order.supplierId ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                <p className="font-semibold text-green-800 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Assigned
                </p>
                <p className="text-green-700 mt-1">{order.supplierId.name}</p>
                <p className="text-green-600 text-xs">{order.supplierId.phone} · {order.supplierId.businessName}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.filter(s => s.isActive && s.kycStatus === 'verified').map(s => (
                    <option key={s._id} value={s._id}>{s.name} — {s.phone} {s.businessName ? `(${s.businessName})` : ''}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSupplier}
                  disabled={assigning || !selectedSupplier}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {assigning ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</> : <><UserCheck className="w-4 h-4" /> Assign & Confirm</>}
                </button>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-orange-500" /> Update Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin Note (optional)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Customer ke liye note..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === order.status}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Send Quote */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-500" /> Send Quote
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Total Amount (₹)</label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={e => setQuoteAmount(e.target.value)}
                  placeholder="e.g. 17500"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Breakdown</label>
                <textarea
                  value={quoteBreakdown}
                  onChange={e => setQuoteBreakdown(e.target.value)}
                  placeholder="50 bag Cement × ₹350 = ₹17,500 (delivery included)"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <button
                onClick={handleSendQuote}
                disabled={sendingQuote || !quoteAmount || !quoteBreakdown}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {sendingQuote ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Quote</>}
              </button>
              {order.customer?.email && (
                <p className="text-xs text-gray-400 text-center">Email jayega: {order.customer.email}</p>
              )}
            </div>
          </div>
          {/* Supplier Payout */}
          {order.supplierId && (order.payment?.status === 'advance_paid' || order.payment?.status === 'fully_paid') && (
            <SupplierPayoutCard order={order} setOrder={setOrder} orderId={orderId} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function ComplaintCard({ order, setOrder, orderId }) {
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const isResolved = order.complaint?.status === 'resolved';

  const handleResolve = async () => {
    setResolving(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${orderId}/complaint/resolve`, { resolution });
      setOrder(data.order);
      toast.success('Complaint resolved!');
    } catch { toast.error('Failed to resolve'); }
    setResolving(false);
  };

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${isResolved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Flag className={`w-4 h-4 ${isResolved ? 'text-green-500' : 'text-red-500'}`} />
        Customer Complaint
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isResolved ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {isResolved ? 'Resolved' : 'Open'}
        </span>
      </h3>
      <p className="text-sm text-gray-800 bg-white/60 rounded-xl p-3 mb-2">"{order.complaint.text}"</p>
      <p className="text-xs text-gray-500 mb-3">Raised: {new Date(order.complaint.raisedAt).toLocaleString('en-IN')}</p>
      {isResolved ? (
        <div className="bg-green-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Resolution:</p>
          <p className="text-sm text-green-800">{order.complaint.resolution || '(No text)'}</p>
          <p className="text-xs text-green-600 mt-1">{new Date(order.complaint.resolvedAt).toLocaleString('en-IN')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            placeholder="Resolution note (e.g. Refund processed / Issue resolved via call)"
            rows={2}
            className="w-full border border-red-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
          <button onClick={handleResolve} disabled={resolving}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {resolving ? <><Loader2 className="w-4 h-4 animate-spin" /> Resolving...</> : <><CheckCircle className="w-4 h-4" /> Mark Resolved</>}
          </button>
        </div>
      )}
    </div>
  );
}

function SupplierPayoutCard({ order, setOrder, orderId }) {
  const [amount, setAmount] = useState(order.supplierPayout?.amount || '');
  const [note, setNote] = useState(order.supplierPayout?.note || '');
  const [saving, setSaving] = useState(false);
  const paid = order.supplierPayout?.status === 'paid';

  const handlePayout = async () => {
    if (!amount) { toast.error('Amount daalo'); return; }
    setSaving(true);
    try {
      const { data } = await axios.patch(`/api/admin/orders/${orderId}/supplier-payout`, { amount, note });
      setOrder(data.order);
      toast.success('Supplier payout marked!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${paid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-orange-500" /> Supplier Payout
      </h3>
      {paid ? (
        <div className="text-sm space-y-1">
          <p className="flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-4 h-4" /> Paid</p>
          <p className="text-green-800">Amount: <strong>₹{order.supplierPayout.amount?.toLocaleString('en-IN')}</strong></p>
          <p className="text-green-700">Date: {new Date(order.supplierPayout.paidAt).toLocaleDateString('en-IN')}</p>
          {order.supplierPayout.note && <p className="text-green-600 text-xs italic">{order.supplierPayout.note}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Supplier: <strong className="text-gray-800">{order.supplierId?.name}</strong></p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount to Pay (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="UPI / NEFT reference..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button onClick={handlePayout} disabled={saving || !amount}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><IndianRupee className="w-4 h-4" /> Mark Supplier Paid</>}
          </button>
        </div>
      )}
    </div>
  );
}

function PaymentCard({ order, setOrder, orderId }) {
  const [marking, setMarking] = useState(false);
  const p = PAYMENT_LABELS[order.payment?.status] || PAYMENT_LABELS.none;

  const handleMarkFullyPaid = async () => {
    setMarking(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${orderId}/payment`);
      setOrder(data.order);
      toast.success('Marked as fully paid!');
    } catch {
      toast.error('Failed to update payment');
    }
    setMarking(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-orange-500" /> Payment Status
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.cls}`}>{p.label}</span>
      </div>
      {order.payment?.advanceAmount ? (
        <div className="text-sm space-y-1 text-gray-600">
          <p>Advance: <strong className="text-gray-900">₹{order.payment.advanceAmount.toLocaleString('en-IN')}</strong></p>
          {order.payment.advancePaidAt && (
            <p>Paid at: {new Date(order.payment.advancePaidAt).toLocaleString('en-IN')}</p>
          )}
          {order.payment.razorpayPaymentId && (
            <p className="font-mono text-xs text-gray-400 mt-1 break-all">ID: {order.payment.razorpayPaymentId}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No payment received yet.</p>
      )}
      {order.payment?.status === 'advance_paid' && (
        <button
          onClick={handleMarkFullyPaid}
          disabled={marking}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {marking ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><CheckCircle className="w-4 h-4" /> Mark Fully Paid</>}
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value, copyable }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Copied!');
  };
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-gray-800 font-medium">{value}</p>
        {copyable && (
          <button onClick={handleCopy} className="text-orange-400 hover:text-orange-600 text-xs ml-1">copy</button>
        )}
      </div>
    </div>
  );
}
