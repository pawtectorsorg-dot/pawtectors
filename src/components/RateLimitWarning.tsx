import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RateLimitWarningProps {
  show: boolean;
  onDismiss: () => void;
}

const RateLimitWarning = ({ show, onDismiss }: RateLimitWarningProps) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show, onDismiss]);

  if (!show) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Alert className="mb-4 bg-orange-50 border-orange-200">
      <Clock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-600">
        <div>
          <p className="font-medium">Rate limit active</p>
          <p className="text-sm mt-1">
            You can try again in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
          <p className="text-xs text-orange-500 mt-2">
            This temporary limit helps protect our service. Thank you for your patience.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default RateLimitWarning;