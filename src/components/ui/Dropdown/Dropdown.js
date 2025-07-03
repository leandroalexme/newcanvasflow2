import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';
import { CaretDown } from '@phosphor-icons/react';

const Dropdown = ({ options, selected, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{selected}</span>
        <CaretDown size={16} />
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option) => (
            <li
              key={option}
              className={`dropdown-item ${selected === option ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown; 