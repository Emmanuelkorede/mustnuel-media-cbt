// =============================================================================
// src/components/CBT/Calculator.jsx
// =============================================================================

import { useState, useCallback } from 'react';
import Modal from '../ui/Modal';

const BUTTONS = [
  ['AC', '+/-', '%', '÷'],
  ['7',  '8',   '9', '×'],
  ['4',  '5',   '6', '−'],
  ['1',  '2',   '3', '+'],
  ['0',         '.', '='],
];

function calculate(a, op, b) {
  const n1 = parseFloat(a);
  const n2 = parseFloat(b);
  if (isNaN(n1) || isNaN(n2)) return 'Error';
  switch (op) {
    case '+': return n1 + n2;
    case '−': return n1 - n2;
    case '×': return n1 * n2;
    case '÷': return n2 === 0 ? 'Error' : n1 / n2;
    default:  return n2;
  }
}

function formatDisplay(value) {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  const fixed = parseFloat(num.toPrecision(12));
  return String(fixed);
}

function CalcButton({ label, onPress, wide = false, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-surface-2 text-text-primary',
    operator: 'bg-primary text-white',
    function: 'bg-primary/12 text-primary',
    equals: 'bg-accent text-white',
  };

  return (
    <button
      onPointerDown={() => onPress(label)}
      className={`
        flex items-center justify-center
        rounded-2xl text-lg font-semibold h-14
        active:scale-95 transition-transform select-none cursor-pointer
        ${wide ? 'col-span-2' : ''}
        ${variantClasses[variant] ?? variantClasses.default}
      `}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {label}
    </button>
  );
}

function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [operand, setOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingNew, setWaitingNew] = useState(false);

  const press = useCallback((key) => {
    if (key === 'AC') {
      setDisplay('0');
      setOperand(null);
      setOperator(null);
      setWaitingNew(false);
      return;
    }

    if (key === '+/-') {
      setDisplay((d) => d === '0' ? '0' : String(parseFloat(d) * -1));
      return;
    }

    if (key === '%') {
      setDisplay((d) => String(parseFloat(d) / 100));
      return;
    }

    if (key === '.') {
      if (waitingNew) { setDisplay('0.'); setWaitingNew(false); return; }
      if (!display.includes('.')) setDisplay((d) => d + '.');
      return;
    }

    if (key === '=') {
      if (operator && operand !== null) {
        const result = calculate(operand, operator, display);
        setDisplay(formatDisplay(String(result)));
        setOperand(null);
        setOperator(null);
        setWaitingNew(true);
      }
      return;
    }

    if (['÷', '×', '−', '+'].includes(key)) {
      if (operator && operand !== null && !waitingNew) {
        const result = calculate(operand, operator, display);
        setOperand(formatDisplay(String(result)));
        setDisplay(formatDisplay(String(result)));
      } else {
        setOperand(display);
      }
      setOperator(key);
      setWaitingNew(true);
      return;
    }

    if (waitingNew) {
      setDisplay(key);
      setWaitingNew(false);
    } else {
      setDisplay((d) => {
        if (d === '0') return key;
        if (d.length >= 12) return d;
        return d + key;
      });
    }
  }, [display, operand, operator, waitingNew]);

  return { display, press };
}

export default function Calculator({ isOpen, onClose }) {
  const { display, press } = useCalculator();

  const getVariant = (label) => {
    if (['÷', '×', '−', '+'].includes(label)) return 'operator';
    if (['AC', '+/-', '%'].includes(label))    return 'function';
    if (label === '=')                          return 'equals';
    return 'default';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calculator">
      <div className="flex flex-col gap-4">
        {/* Display Panel */}
        <div className="rounded-2xl px-5 py-4 text-right bg-surface-2 border border-border">
          <p 
            className="text-4xl font-bold truncate text-text-primary font-mono"
          >
            {display}
          </p>
        </div>

        {/* Button Keyboard Grid */}
        <div className="grid grid-cols-4 gap-2">
          {BUTTONS.flat().map((label, i) => (
            <CalcButton
              key={`${label}-${i}`}
              label={label}
              wide={label === '0'}
              variant={getVariant(label)}
              onPress={press}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}