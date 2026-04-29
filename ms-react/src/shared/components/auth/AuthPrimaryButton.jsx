export const AuthPrimaryButton = ({ type = 'button', loading = false, loadingText, children, disabled = false }) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className="w-full bg-[#2C4035] hover:bg-[#24362d] text-[#F8F5F0] font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:hover:bg-[#2C4035] shadow-md shadow-[#2C4035]/20"
      disabled={isDisabled}
    >
      {loading ? loadingText : children}
    </button>
  );
};