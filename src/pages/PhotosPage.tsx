import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type PhotoRecord } from '@/lib/supabase';
import { generateCoverColors } from '@/lib/coverGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage } from '@/components/editor/utils/uploadImage';
import Icon from '@/components/icons';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

// ── Types ──

interface PhotoItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string | null;
  colors: [string, string];
}

interface PolaroidSpot {
  x: number;
  y: number;
  rotation: number;
  z: number;
}

// ── Random scatter ──

function scatter(count: number): PolaroidSpot[] {
  return Array.from({ length: count }, () => ({
    x: 6 + Math.random() * 70,
    y: 4 + Math.random() * 70,
    rotation: (Math.random() - 0.5) * 7,
    z: Math.floor(Math.random() * 10),
  }));
}

// ── Notebook doodles (viewBox 0 0 1000 1000) ──

const notebookDoodles = (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    viewBox="0 0 1000 1000"
    preserveAspectRatio="none"
  >
    {/* Star — top right */}
    <path d="M870,90 L873,65 L876,90 L901,93 L876,96 L873,121 L870,96 L845,93 Z"
      fill="none" stroke="rgba(139,119,90,0.15)" strokeWidth="1.5" />
    {/* Spiral — left margin */}
    <path d="M65,380 C65,350 95,350 95,380 C95,410 65,410 65,380 C65,320 125,320 125,380"
      fill="none" stroke="rgba(139,119,90,0.12)" strokeWidth="1.2" />
    {/* Wavy underline — bottom area */}
    <path d="M520,820 Q535,813 550,820 Q565,827 580,820 Q595,813 610,820"
      fill="none" stroke="rgba(139,119,90,0.13)" strokeWidth="1" />
    {/* Dots cluster */}
    <circle cx="780" cy="520" r="2" fill="rgba(139,119,90,0.12)" />
    <circle cx="790" cy="525" r="1.3" fill="rgba(139,119,90,0.09)" />
    <circle cx="774" cy="530" r="1.5" fill="rgba(139,119,90,0.1)" />
    {/* Small cross / plus */}
    <path d="M230,160 L230,180 M220,170 L240,170"
      fill="none" stroke="rgba(139,119,90,0.1)" strokeWidth="0.8" />
    {/* Tiny heart-ish scribble */}
    <path d="M160,620 C160,615 163,610 166,612 C169,610 172,615 172,620 C172,628 166,633 166,633 C166,633 160,628 160,620 Z"
      fill="none" stroke="rgba(139,119,90,0.1)" strokeWidth="0.8" />
  </svg>
);

// ── NotebookBackground ──

function NotebookBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Paper base color */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(175deg, #f6f1e4 0%, #f1e9d6 40%, #ede3cc 100%)' }}
      />
      {/* Ruled lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, rgba(156,138,115,0.1) 27px, rgba(156,138,115,0.1) 28px)',
          maskImage:
            'linear-gradient(to right, transparent 5%, black 7.5%, black 92.5%, transparent 95%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 5%, black 7.5%, black 92.5%, transparent 95%)',
        }}
      />
      {/* Red margin line */}
      <div
        className="absolute top-0 bottom-0"
        style={{ left: '7%', width: '1px', background: 'rgba(185,130,120,0.15)' }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(156,138,115,0.18) 100%)',
        }}
      />
      {/* Doodles */}
      {notebookDoodles}
    </div>
  );
}

// ── PolaroidCard ──

function PolaroidCard({
  photo,
  spot,
  onView,
  onDelete,
  isAdmin,
}: {
  photo: PhotoItem;
  spot: PolaroidSpot;
  onView: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  return (
    <motion.div
      className="absolute group cursor-pointer"
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        zIndex: spot.z,
      }}
      whileHover={{
        y: -10,
        scale: 1.04,
        zIndex: 50,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      onClick={onView}
    >
      {/* Tape */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 rounded-sm"
        style={{
          width: '36%',
          height: '14px',
          background: 'rgba(255,255,245,0.55)',
          border: '1px solid rgba(200,190,170,0.18)',
          transform: `rotate(${(spot.x * 13) % 6 - 3}deg)`,
        }}
      />

      {/* Card body */}
      <div
        className="bg-white rounded-sm flex flex-col"
        style={{
          width: 'clamp(140px, 18vw, 200px)',
          padding: 'clamp(6px, 0.8vw, 10px)',
          paddingBottom: 'clamp(26px, 3.2vw, 34px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100">
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})`,
              }}
            />
          )}
        </div>

        {/* Caption */}
        <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-2 px-0.5 truncate leading-tight">
          {photo.title}
        </p>
      </div>

      {/* Delete button (admin only) */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white shadow border border-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] z-20"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

// ── LightboxModal ──

function LightboxModal({
  photo,
  onClose,
}: {
  photo: PhotoItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Polaroid */}
      <motion.div
        className="bg-white rounded-sm flex flex-col shadow-2xl"
        style={{
          width: 'min(420px, 85vw)',
          padding: 'min(16px, 2vw)',
          paddingBottom: 'min(42px, 5vw)',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-square overflow-hidden rounded-sm bg-gray-100">
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})`,
              }}
            />
          )}
        </div>
        <p className="text-center text-base font-medium text-gray-600 mt-3">
          {photo.title}
        </p>
        {photo.date && (
          <p className="text-center text-xs text-gray-400 mt-1">{photo.date}</p>
        )}
      </motion.div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-lg"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── AddPhotoForm ──

function AddPhotoForm({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({ title: '', date: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      setError(`上传失败：${err.message || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('photos').insert({
      title: form.title,
      date: form.date,
      image_url: form.imageUrl || null,
      cover_colors: generateCoverColors(form.title || Date.now().toString()),
    });
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold mb-4">添加日常碎片</h3>
        <div className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded-lg border border-border text-sm"
            placeholder="标题 *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="w-full px-3 py-2 rounded-lg border border-border text-sm"
            placeholder="日期（如 2026-05）"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {form.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={form.imageUrl}
                  alt="预览"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white text-xs hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-3 py-4 rounded-lg border-2 border-dashed border-border text-sm text-text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {uploading ? '上传中...' : '📷 选择本地图片（选填）'}
              </button>
            )}
          </div>
          <input
            className="w-full px-3 py-2 rounded-lg border border-border text-sm"
            placeholder="或粘贴图片链接 URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm text-text-muted"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '添加'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ── PhotosPage ──

export default function PhotosPage() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<PhotoItem | null>(null);

  const fetch = useCallback(async () => {
    setFetchError('');
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setFetchError(error.message);
      setLoading(false);
      return;
    }
    if (data)
      setItems(
        (data as PhotoRecord[]).map((r) => ({
          id: r.id,
          title: r.title,
          date: r.date,
          imageUrl: r.image_url,
          colors:
            r.cover_colors?.length === 2
              ? (r.cover_colors as [string, string])
              : (['#6a5a4a', '#1a1a2a'] as [string, string]),
        })),
      );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('photos').delete().eq('id', deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (!error) {
      fetch();
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  }

  // Generate scatter positions when items change
  const spots = useMemo(() => scatter(items.length), [items.length]);

  // Notebook container height — scales with photo count
  const notebookMinHeight = Math.max(650, items.length * 190 + 280);

  return (
    <>
      <Helmet>
        <title>照片 — 大猪</title>
        <meta name="description" content="日常照片" />
      </Helmet>

      <main className="min-h-screen pt-20 pb-20">
        <div className="content-width">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <motion.h1
                className="text-4xl font-bold text-text-primary tracking-tight mb-2"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                日常碎片
              </motion.h1>
              <p className="text-text-muted">生活里的瞬间</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="check" size={16} /> 添加
              </button>
            )}
          </div>

          {/* Error */}
          {fetchError && (
            <p className="text-red-500 text-sm mb-4">读取错误：{fetchError}</p>
          )}

          {/* Loading */}
          {loading && <p className="text-text-muted text-sm">加载中...</p>}

          {/* Empty */}
          {!loading && items.length === 0 && (
            <p className="text-text-muted text-sm">
              暂无日常碎片，点右上角「添加」
            </p>
          )}

          {/* Notebook + Polaroids */}
          {!loading && items.length > 0 && (
            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                minHeight: `${notebookMinHeight}px`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.03)',
              }}
            >
              <NotebookBackground />

              {/* Scattered polaroids */}
              {items.map((item, i) => (
                <PolaroidCard
                  key={item.id}
                  photo={item}
                  spot={spots[i]}
                  onView={() => setViewPhoto(item)}
                  onDelete={() => setDeleteTarget(item.id)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1d1d1f] text-white text-[14px] rounded-full shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              删除成功
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {showForm && (
            <AddPhotoForm onClose={() => setShowForm(false)} onAdded={fetch} />
          )}
          {deleteTarget && (
            <DeleteConfirmModal
              onClose={() => setDeleteTarget(null)}
              onConfirm={handleDelete}
              deleting={deleting}
            />
          )}
          {viewPhoto && (
            <LightboxModal
              photo={viewPhoto}
              onClose={() => setViewPhoto(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
