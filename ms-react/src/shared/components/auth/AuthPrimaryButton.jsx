export const AuthPrimaryButton = ({ type = 'button', loading = false, loadingText, children, disabled = false }) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className="w-full bg-[#4A7C59] hover:bg-[#3B5E45] text-[#F0EDE8] font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:hover:bg-[#4A7C59] shadow-md shadow-[#0D2818]/20"       
      disabled={isDisabled}
    >
      {loading ? loadingText : children}
    </button>
  );
};