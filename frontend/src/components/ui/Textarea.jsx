export default function Textarea({ label, error, required, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea rows={3} className={`input-base resize-none ${error ? "border-red-400" : ""}`} {...rest} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
