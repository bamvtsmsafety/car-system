import { useRef } from 'react';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import { useT } from '../context/LanguageContext';

const fileIcon = (type) => {
  if (type.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4 text-gray-500" />;
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUpload({ files = [], onChange, label, accept = '*', maxMB = 10 }) {
  const t = useT();
  const inputRef = useRef(null);
  const displayLabel = label || t('fileUpload', 'defaultLabel');

  const handleFiles = async (selected) => {
    const tooBig = [...selected].filter((f) => f.size > maxMB * 1024 * 1024);
    if (tooBig.length) {
      alert(`${t('fileUpload', 'tooLarge')} ${maxMB}MB ${t('fileUpload', 'tooLargeEnd')}`);
    }
    const valid = [...selected].filter((f) => f.size <= maxMB * 1024 * 1024);
    const encoded = await Promise.all(valid.map(toBase64));
    onChange([...files, ...encoded]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Paperclip className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-sm text-gray-500">{displayLabel}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {t('fileUpload', 'hint')} {maxMB}{t('fileUpload', 'hintUnit')}
        </p>
      </div>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, idx) => (
            <li key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm">
              {fileIcon(f.type)}
              <span className="flex-1 truncate text-gray-700">{f.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(f.size)}</span>
              <button type="button" onClick={() => remove(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FileList({ files = [], title }) {
  if (!files.length) return null;
  return (
    <div className="space-y-1">
      {title && <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>}
      {files.map((f, idx) => (
        <a
          key={idx}
          href={f.data}
          download={f.name}
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors group"
        >
          {fileIcon(f.type)}
          <span className="flex-1 truncate text-gray-700 group-hover:text-blue-700">{f.name}</span>
          <span className="text-xs text-gray-400 shrink-0">{formatSize(f.size)}</span>
        </a>
      ))}
    </div>
  );
}
