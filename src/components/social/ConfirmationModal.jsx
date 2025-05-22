import React from 'react';

const ConfirmationModal = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  element = "fire" // or pass your theme element for color
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-xl p-6 max-w-xs w-full text-center shadow-2xl border-2 border-${element}-accent`}>
        <h3 className={`text-xl font-bold mb-2 text-${element}`}>{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded bg-${element}-soft text-${element}-accent font-semibold hover:bg-gray-100 transition`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded bg-${element} text-white font-semibold hover:bg-${element}-accent transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
