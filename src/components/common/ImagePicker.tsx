import { useRef, useState } from 'react';
import { Upload, Link2, Loader, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

interface Props {
  /** Current image URL (controlled). Empty string = nothing selected. */
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary folder name (e.g. "events", "celebrities", "avatars"). */
  folder?: string;
  /** Aspect ratio class for the preview tile (e.g. "aspect-video"). */
  previewAspect?: string;
  /** Visible label above the field. */
  label?: string;
  /** Marks the field required in the label. */
  required?: boolean;
  /** Help text shown below the field. */
  hint?: string;
}

/**
 * Image picker supporting BOTH direct upload (multipart → Cloudinary via
 * the backend's /api/uploads/image route) AND pasting an existing URL.
 * Shows a live preview and a Clear button.
 */
export default function ImagePicker({
  value,
  onChange,
  folder,
  previewAspect = 'aspect-video',
  label,
  required,
  hint,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const pickFile = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setError('Please choose an image file (JPG, PNG, WEBP, GIF or AVIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('File is larger than 8 MB — please pick a smaller image.');
      return;
    }
    setError('');
    setUploading(true);
    setProgress(`Uploading ${file.name}…`);
    try {
      const out = await api.uploads.image(file, folder);
      onChange(out.url);
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.status === 503
          ? 'Image upload is not configured on the server yet.'
          : err.message
        : 'Upload failed.';
      setError(msg);
    }
    setUploading(false);
    setProgress('');
  };

  const clear = () => onChange('');

  return (
    <div className="block">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[#A0A0C0] text-xs font-medium">
            {label}{required && ' *'}
          </span>
          {value && (
            <button
              type="button"
              onClick={clear}
              className="text-[#6060A0] hover:text-[#EF4444] text-[10px] flex items-center gap-1 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {value ? (
        <div className={`relative ${previewAspect} rounded-xl overflow-hidden bg-[#1C1C3A] border border-[rgba(124,58,237,0.25)] mb-2`}>
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
          />
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md border border-white/15 text-white hover:bg-black/80 transition-all flex items-center gap-1.5"
          >
            <Upload size={12} /> Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className={`w-full ${previewAspect} mb-2 rounded-xl bg-[#1C1C3A] border-2 border-dashed border-[rgba(124,58,237,0.3)] hover:border-[rgba(124,58,237,0.6)] hover:bg-[rgba(124,58,237,0.06)] transition-all flex flex-col items-center justify-center gap-2 text-[#A0A0C0] hover:text-white`}
        >
          {uploading ? (
            <>
              <Loader size={22} className="animate-spin text-[#A78BFA]" />
              <span className="text-xs">{progress}</span>
            </>
          ) : (
            <>
              <ImageIcon size={26} className="text-[#A78BFA]" />
              <span className="text-xs font-semibold">Click to upload — or paste a URL below</span>
              <span className="text-[10px] text-[#6060A0]">JPG · PNG · WEBP · GIF · up to 8 MB</span>
            </>
          )}
        </button>
      )}

      {/* URL input */}
      <div className="relative">
        <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6060A0]" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or click upload above"
          className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm font-mono transition-colors"
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFile}
      />

      {hint && !error && (
        <p className="text-[#6060A0] text-xs mt-1.5">{hint}</p>
      )}

      {error && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-xs flex items-start gap-1.5">
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
