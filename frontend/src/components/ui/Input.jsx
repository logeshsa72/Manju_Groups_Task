export default function Input({ label, error, required, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input className={`input-base ${error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`} {...rest} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
