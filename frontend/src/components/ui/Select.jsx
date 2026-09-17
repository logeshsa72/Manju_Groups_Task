export default function Select({ label, error, required, options = [], placeholder, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select className={`input-base ${error ? "border-red-400" : ""}`} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
