export const AuthInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  rules,
  error,
  autoComplete,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#F0EDE8] mb-1.5">
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 text-sm text-[#F0EDE8] bg-[#1A3D25] placeholder:text-[#3B5E45] border border-[#2D5C3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent transition-all duration-200"
        {...register(id, rules)}
      />

      {error ? (
        <p className="text-red-400 text-xs mt-1">{error.message}</p>
      ) : (
        <p className="invisible text-xs mt-1">&nbsp;</p>
      )}
    </div>
  );
};
