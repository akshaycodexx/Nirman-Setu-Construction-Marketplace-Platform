import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SupplierLayout from '../../components/SupplierLayout';
import { useSupplier } from '../../context/SupplierContext';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, Package, MapPin, Truck, CheckCircle, Loader2, AlertCircle, Camera, ThumbsUp, ThumbsDown } from 'lucide-react';
import useT from '../../i18n/useT';

const STATUS_STEP_KEYS = [
  { key: 'confirmed',  labelKey: 'suppod.step.confirmed',  icon: CheckCircle, descKey: 'suppod.step.confirmedDesc' },
  { key: 'dispatched', labelKey: 'suppod.step.dispatched', icon: Truck,        descKey: 'suppod.step.dispatchedDesc' },
  { key: 'delivered',  labelKey: 'suppod.step.delivered',  icon: CheckCircle, descKey: 'suppod.step.deliveredDesc' },
];
const FLOW = ['confirmed', 'dispatched', 'delivered'];

export default function SupplierOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useSupplier();
  const socketRef = useSocket();
  const t = useT();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [responding, setResponding] = useState(false);

  const statusSteps = STATUS_STEP_KEYS.map(s => ({ ...s, label: t(s.labelKey), desc: t(s.descKey) }));

  const fetchOrder = () =>
    axios.get(`/api/supplier/orders/${orderId}`, { headers: getAuthHeaders() })
      .then(r => setOrder(r.data.order))
      .catch(() => toast.error(t('suppod.fetchFail')))
      .finally(() => setLoading(false));

  useEffect(() => { fetchOrder(); }, [orderId]);

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

  const handleAccept = async () => {
    setResponding(true);
    try {
      const { data } = await axios.put(`/api/supplier/orders/${orderId}/accept`, {}, { headers: getAuthHeaders() });
      setOrder(data.order);
      toast.success(t('suppod.accepted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('suppod.acceptFail'));
    }
    setResponding(false);
  };

  const handleDecline = async () => {
    setResponding(true);
    try {
      const { data } = await axios.put(`/api/supplier/orders/${orderId}/decline`, { reason: declineReason }, { headers: getAuthHeaders() });
      setOrder(data.order);
      toast.success(t('suppod.declined'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('suppod.declineFail'));
    }
    setResponding(false);
  };

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
      toast.success(t('suppod.statusUpdated', { status: nextStatus }));
    } catch (err) {
      toast.error(err.response?.data?.message || t('suppod.statusUpdateFail'));
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> {t('suppod.loading')}
        </div>
      </SupplierLayout>
    );
  }

  if (!order) {
    return (
      <SupplierLayout>
        <div className="text-center py-16 text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>{t('suppod.notFound')}</p>
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

      {/* Accept / Decline banner */}
      {order.supplierStatus === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-0">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">{t('suppod.assignedMsg')}</p>
              <p className="text-amber-600 text-sm mt-0.5">{t('suppod.declineNote')}</p>
            </div>
          </div>
          {!showDeclineForm ? (
            <div className="flex gap-3">
              <button onClick={handleAccept} disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                {t('suppod.acceptKaro')}
              </button>
              <button onClick={() => setShowDeclineForm(true)} disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                <ThumbsDown className="w-4 h-4" /> {t('suppod.declineKaro')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                placeholder={t('suppod.declinePlaceholder')}
                className="w-full border border-amber-300 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowDeclineForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                  {t('suppod.wapas')}
                </button>
                <button onClick={handleDecline} disabled={responding}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t('suppod.confirmDecline')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" /> {t('suppod.orderItems')}
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
                <span className="font-medium text-yellow-700">{t('suppod.noteLabel')}</span>{order.notes}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> {t('suppod.deliveryInfo')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">{t('suppod.addr')}</span><span className="text-gray-800 font-medium">{order.delivery?.address}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">{t('suppod.city')}</span><span className="text-gray-800 font-medium">{order.delivery?.city} {order.delivery?.pincode && `— ${order.delivery.pincode}`}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">{t('suppod.date')}</span><span className="text-gray-800 font-medium">{new Date(order.delivery?.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">{t('suppod.slot')}</span><span className="text-gray-800 font-medium capitalize">{order.delivery?.slot}</span></div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">{t('suppod.activity')}</h3>
              <div className="space-y-3">
                {order.timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium capitalize text-gray-800">{entry.status}</span>
                      {entry.note && <span className="text-gray-500"> — {entry.note}</span>}
                      <p className="text-xs text-gray-400">{new Date(entry.at).toLocaleString('en-IN')} by {entry.by}</p>
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
            <h3 className="font-semibold text-gray-800 mb-4">{t('suppod.progress')}</h3>
            <div className="space-y-0">
              {statusSteps.map((s, i) => {
                const isDone = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}>
                        <s.icon className={`w-3.5 h-3.5 ${isDone ? 'text-white' : 'text-gray-300'}`} />
                      </div>
                      {i < statusSteps.length - 1 && (
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
                {t('suppod.updateTo')} <span className="text-emerald-600 capitalize">{nextStatus}</span>
              </h3>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={nextStatus === 'dispatched' ? t('suppod.notePh.dispatched') : t('suppod.notePh.delivered')}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none mb-3"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 capitalize"
              >
                {updating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('suppod.updating')}</>
                  : <><Truck className="w-4 h-4" /> {t('suppod.markAs', { status: nextStatus })}</>}
              </button>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">{t('suppod.complete')}</p>
              <p className="text-sm text-green-600 mt-1">{t('suppod.delivered')}</p>
            </div>
          )}

          {/* Delivery Proof */}
          {order.status === 'delivered' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-500" /> {t('suppod.proofTitle')}
              </h3>
              {order.deliveryProof?.submittedAt ? (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 bg-gray-50 rounded-xl p-3">{order.deliveryProof.note || t('suppod.noNote')}</p>
                  {order.deliveryProof.photoUrl && (
                    <a href={order.deliveryProof.photoUrl} target="_blank" rel="noreferrer"
                      className="block text-blue-500 hover:underline text-xs break-all">
                      {t('suppod.viewPhoto')}
                    </a>
                  )}
                  <p className="text-xs text-gray-400">
                    {t('suppod.proofSubmittedAt')}{new Date(order.deliveryProof.submittedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={proofNote}
                    onChange={e => setProofNote(e.target.value)}
                    placeholder={t('suppod.proofNotePh')}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('suppod.proofPhoto')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setProofFile(e.target.files[0] || null)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium"
                    />
                    {proofFile && <p className="text-xs text-gray-400 mt-1">{proofFile.name}</p>}
                  </div>
                  <button
                    onClick={async () => {
                      if (!proofNote.trim()) { toast.error(t('suppod.proofNoteRequired')); return; }
                      setSubmittingProof(true);
                      try {
                        let photoUrl = '';
                        if (proofFile) {
                          const formData = new FormData();
                          formData.append('photo', proofFile);
                          const { data: uploadData } = await axios.post(
                            '/api/supplier/upload-proof',
                            formData,
                            { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
                          );
                          photoUrl = uploadData.url;
                        }
                        const { data } = await axios.post(
                          `/api/supplier/orders/${orderId}/proof`,
                          { note: proofNote, photoUrl },
                          { headers: getAuthHeaders() }
                        );
                        setOrder(data.order);
                        toast.success(t('suppod.proofSubmitted'));
                      } catch (err) {
                        toast.error(err.response?.data?.message || t('suppod.proofFail'));
                      } finally {
                        setSubmittingProof(false);
                      }
                    }}
                    disabled={submittingProof || !proofNote.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingProof
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('suppod.submitting')}</>
                      : <><Camera className="w-4 h-4" /> {t('suppod.submitProof')}</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
