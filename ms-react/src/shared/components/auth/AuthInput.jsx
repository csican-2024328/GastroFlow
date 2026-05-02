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
      <label htmlFor={id} className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-2 text-sm text-[#1A1A1A] bg-[#F8F5F0] placeholder:text-[#6b6b6b] border border-[#c9b898] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C4035] focus:border-transparent transition-all duration-200"
        {...register(id, rules)}
      />

      {error ? (
        <p className="text-[#C87A55] text-xs mt-1">{error.message}</p>
      ) : (
        <p className="invisible text-xs mt-1">&nbsp;</p>
      )}
    </div>
  );
};
