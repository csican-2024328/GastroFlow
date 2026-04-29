export const AuthSwitchLink = ({ prefixText, actionText, onClick }) => {
  const hasPrefix = Boolean(prefixText);

  return (
    <p className="text-center text-sm text-[#4b4b4b]">
      {hasPrefix ? `${prefixText} ` : ''}
      <button type="button" onClick={onClick} className="text-[#C87A55] font-medium hover:text-[#2C4035] transition-colors duration-200">
        {actionText}
      </button>
    </p>
  );
};
