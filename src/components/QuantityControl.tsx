import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md',
}: QuantityControlProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2 p-2',
      button: 'w-8 h-8',
      icon: 14,
      text: 'text-base min-w-[40px]',
    },
    md: {
      container: 'gap-3 p-2',
      button: 'w-10 h-10',
      icon: 16,
      text: 'text-lg min-w-[50px]',
    },
    lg: {
      container: 'gap-4 p-3',
      button: 'w-14 h-14',
      icon: 20,
      text: 'text-2xl min-w-[60px]',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center bg-white rounded-2xl shadow-soft-md ${classes.container}`}>
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${classes.button} rounded-xl bg-beige flex items-center justify-center touch-manipulation active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Minus size={classes.icon} className="text-deep-green" />
      </button>
      <span className={`text-deep-green text-center font-medium ${classes.text}`}>
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${classes.button} rounded-xl bg-beige flex items-center justify-center touch-manipulation active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Plus size={classes.icon} className="text-deep-green" />
      </button>
    </div>
  );
}
