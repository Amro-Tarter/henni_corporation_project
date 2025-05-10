import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X, AlertCircle } from 'lucide-react';

/**
 * Enhanced editable field component with improved UX
 * 
 * Props:
 * - field: unique field name (e.g. 'username')
 * - value: current value to display
 * - onUpdate: callback (fieldName, newValue) => void to persist changes
 * - multiline: true for textarea, false for input
 * - label: optional label for the field
 * - placeholder: placeholder text for input/textarea
 * - validate: optional validation function that returns error message or null
 * - inputType: type of input (text, email, password, etc.)
 * - autoFocus: whether to focus the input when editing starts
 * - maxLength: maximum character length
 * - className: additional classes for the container
 */
export default function EditableField({
  field,
  value,
  onUpdate,
  multiline = false,
  label,
  placeholder = "Enter value...",
  validate,
  inputType = "text",
  autoFocus = true,
  maxLength,
  className = ""
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState(null);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef(null);

  // Reset temp value when external value changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Set focus on input when editing starts
  useEffect(() => {
    if (editing && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing, autoFocus]);

  const startEditing = () => {
    setEditing(true);
    setTempValue(value);
    setError(null);
  };

  const handleSave = () => {
    if (validate) {
      const validationError = validate(tempValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    onUpdate(field, tempValue);
    setEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setTempValue(value);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const inputProps = {
    value: tempValue,
    onChange: (e) => setTempValue(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder,
    className: `w-full border rounded ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} outline-none transition-colors p-2`,
    ref: inputRef,
    maxLength,
    "aria-invalid": error ? "true" : "false",
    "aria-label": label || field
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      
      <div className="relative group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}>
        
        {editing ? (
          <div className="space-y-2">
            {multiline ? (
              <textarea
                rows={3}
                {...inputProps}
              />
            ) : (
              <input
                type={inputType}
                {...inputProps}
              />
            )}
            
            {error && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle size={12} className="mr-1" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                aria-label="Save changes">
                <Check size={16} className="mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded transition-colors"
                aria-label="Cancel editing">
                <X size={16} className="mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="min-h-6 flex items-center cursor-text rounded p-2 hover:bg-gray-50 transition-colors"
            onClick={startEditing}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && startEditing()}
            role="button"
            aria-label={`Edit ${label || field}`}>
            
            <div className="flex-1 break-words">
              {value || <span className="text-gray-400 italic">{placeholder}</span>}
            </div>
            
            <Pencil
              size={16}
              className={`ml-2 text-gray-500 ${hovering ? 'opacity-100' : 'opacity-0'} transition-opacity`}
            />
          </div>
        )}
      </div>
      
      {/* Keyboard shortcuts help */}
      {editing && (
        <div className="text-xs text-gray-500 mt-1">
          {multiline 
            ? "Press Ctrl+Enter to save, Esc to cancel" 
            : "Press Enter to save, Esc to cancel"}
        </div>
      )}
    </div>
  );
}

// Example usage:
/*
function ProfileForm() {
  const [userData, setUserData] = useState({
    name: "John Doe",
    bio: "Software developer with 5 years experience",
    email: "john@example.com"
  });

  const handleUpdate = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const validateEmail = (email) => {
    if (!email.includes('@')) return "Please enter a valid email address";
    return null;
  };

  return (
    <div className="space-y-6">
      <EditableField
        field="name"
        value={userData.name}
        onUpdate={handleUpdate}
        label="Full Name"
      />
      
      <EditableField
        field="email"
        value={userData.email}
        onUpdate={handleUpdate}
        label="Email Address"
        validate={validateEmail}
        inputType="email"
      />
      
      <EditableField
        field="bio"
        value={userData.bio}
        onUpdate={handleUpdate}
        label="Biography"
        multiline={true}
        placeholder="Tell us about yourself..."
      />
    </div>
  );
}
*/