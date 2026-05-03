import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SupplierLayout from '../../components/SupplierLayout';
import { useSupplier } from '../../context/SupplierContext';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, Package, MapPin, Calendar, Truck, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, desc: 'Tumhe assign kiya gaya hai' },
  { key: 'dispatched', label: 'Dispatched', icon: Truck, desc: 'Material bhej diya' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Customer tak pahunch gaya' },
];
const FLOW = ['confirmed', 'dispatched', 'delivered'];

export default function SupplierOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useSupplier();
  const socketRef = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  const fetchOrder = () =>
    axios.get(`/api/supplier/orders/${orderId}`, { headers: getAuthHeaders() })
      .then(r => setOrder(r.data.order))
      .catch(() => toast.error('Order nahi mila'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchOrder(); }, [orderId]);

  // Real-time: join order room, re-fetch on admin update
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !orderId) return;
    socket.emit('join:order', orderId);
    const handler = () => fetchOrder();
    socket.on('order:updated', handler);
    return () => {
      socket.off('order:updated', handler);
      socket.emit('leave:order', orderId);
    };
  }, [socketRef, orderId]);

  const nextStatus = order ? FLOW[FLOW.indexOf(order.status) + 1] : null;

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const { data } = await axios.put(
        `/api/supplier/orders/${orderId}/status`,
        { status: nextStatus, supplierNote: note },
        { headers: getAuthHeaders() }
      );
      setOrder(data.order);
      setNote('');
      toast.success(`Status updated: ${nextStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      </SupplierLayout>
    );
  }

  if (!order) {
    return (
      <SupplierLayout>
        <div className="text-center py-16 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Order nahi mila</p>
        </div>
      </SupplierLayout>
    );
  }

  const currentIdx = FLOW.indexOf(order.status);

  return (
    <SupplierLayout>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate('/supplier/orders')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-gray-900">{order.orderId}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'dispatched' ? 'bg-orange-100 text-orange-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>{order.status}</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" /> Order Items
              <span className="ml-auto text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{order.category}</span>
            </h3>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 font-mono text-sm bg-gray-50 px-3 py-1 rounded-lg">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-medium text-yellow-700">Note: </span>{order.notes}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> Delivery Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Address</span><span className="text-gray-800 font-medium">{order.delivery?.address}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">City</span><span className="text-gray-800 font-medium">{order.delivery?.city} {order.delivery?.pincode && `— ${order.delivery.pincode}`}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Date</span><span className="text-gray-800 font-medium">{new Date(order.delivery?.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Slot</span><span className="text-gray-800 font-medium capitalize">{order.delivery?.slot}</span></div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Activity</h3>
              <div className="space-y-3">
                {order.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium capitalize text-gray-800">{t.status}</span>
                      {t.note && <span className="text-gray-500"> — {t.note}</span>}
                      <p className="text-xs text-gray-400">{new Date(t.at).toLocaleString('en-IN')} by {t.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Progress</h3>
            <div className="space-y-0">
              {STATUS_STEPS.map((s, i) => {
                const isDone = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}>
                        <s.icon className={`w-3.5 h-3.5 ${isDone ? 'text-white' : 'text-gray-300'}`} />
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-emerald-300' : 'bg-gray-100'}`} style={{ minHeight: '20px' }} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                      {isCurrent && <p className="text-xs text-emerald-600 mt-0.5">{s.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Update button */}
          {nextStatus && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Update to: <span className="text-emerald-600 capitalize">{nextStatus}</span>
              </h3>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={nextStatus === 'dispatched' ? 'e.g. Truck no. JH01A1234' : 'e.g. Customer ne receive kiya'}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none mb-3"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 capitalize"
              >
                {updating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Truck className="w-4 h-4" /> Mark as {nextStatus}</>}
              </button>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Order Complete!</p>
              <p className="text-sm text-green-600 mt-1">Successfully delivered</p>
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
