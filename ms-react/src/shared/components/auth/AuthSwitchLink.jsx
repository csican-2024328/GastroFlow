export const AuthSwitchLink = ({ prefixText, actionText, onClick }) => {
  const hasPrefix = Boolean(prefixText);

  return (
    <p className="text-center text-sm text-[#7A9E85]">
      {hasPrefix ? `${prefixText} ` : ''}
      <button type="button" onClick={onClick} className="text-[#4A7C59] font-medium hover:text-[#C4A882] transition-colors duration-200">
        {actionText}
      </button>
    </p>
  );
};
