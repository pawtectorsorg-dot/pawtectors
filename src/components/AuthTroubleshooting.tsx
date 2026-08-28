import { AlertTriangle, Wifi, RefreshCw, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthTroubleshootingProps {
  show: boolean;
  errorMessage: string;
  onRetry: () => void;
  onDismiss: () => void;
}

const AuthTroubleshooting = ({ show, errorMessage, onRetry, onDismiss }: AuthTroubleshootingProps) => {
  if (!show) return null;

  const is400Error = errorMessage.includes('400') || errorMessage.toLowerCase().includes('bad request');
  const isRateLimit = errorMessage.toLowerCase().includes('too many');
  const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch');

  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertTriangle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-600">
        <div className="space-y-3">
          <p className="font-medium">Having trouble? Here's what you can try:</p>
          
          {is400Error && (
            <div className="space-y-2">
              <p className="text-sm font-medium">🔍 Check your input:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Make sure your email format is correct (example@domain.com)</li>
                <li>• Password should be at least 6 characters</li>
                <li>• Remove any extra spaces from email/password</li>
              </ul>
            </div>
          )}

          {isRateLimit && (
            <div className="space-y-2">
              <p className="text-sm font-medium">⏱️ Rate limiting active:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Wait 2-3 minutes before trying again</li>
                <li>• This protects our service from abuse</li>
                <li>• Your account is safe</li>
              </ul>
            </div>
          )}

          {isNetworkError && (
            <div className="space-y-2">
              <p className="text-sm font-medium">🌐 Connection issues:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Disable VPN if you're using one</li>
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">💡 General tips:</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• <Wifi className="h-3 w-3 inline mr-1" />Try refreshing the page</li>
              <li>• <RefreshCw className="h-3 w-3 inline mr-1" />Clear browser cache and cookies</li>
              <li>• <Mail className="h-3 w-3 inline mr-1" />Check if you got a confirmation email</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try Again
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Hide Tips
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AuthTroubleshooting;