import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Error state component for displaying user-friendly error messages
 * Handles validation errors, parsing errors, and file read errors
 */
export function ErrorState({ error, onRetry, onDismiss }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Parse error type for better messaging
  const getErrorDetails = () => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('yaml parsing')) {
      return {
        title: 'Invalid YAML Format',
        description: 'The file contains syntax errors. Please check your YAML formatting.',
        icon: '📝',
      };
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        title: 'Validation Error',
        description: 'The portfolio file structure is invalid.',
        icon: '⚠️',
      };
    }
    
    if (message.includes('file type') || message.includes('too large')) {
      return {
        title: 'File Error',
        description: 'There was a problem with the selected file.',
        icon: '📁',
      };
    }
    
    return {
      title: 'Error Loading Portfolio',
      description: 'An unexpected error occurred.',
      icon: '❌',
    };
  };

  const { title, description, icon } = getErrorDetails();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full p-6 border-destructive/50">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Error Icon */}
          <div className="relative">
            <div className="text-5xl mb-2">{icon}</div>
            <AlertCircle className="absolute -top-1 -right-1 h-6 w-6 text-destructive" />
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Error Message */}
          <div className="w-full p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <p className="text-sm text-destructive font-mono break-words">
              {errorMessage}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full pt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                className="flex-1"
              >
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="outline"
                className="flex-1"
              >
                Dismiss
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground pt-2">
            <p>
              Need help? Check the{' '}
              <a
                href="#"
                className="underline hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Link to documentation or examples
                }}
              >
                example portfolio files
              </a>
              {' '}for the correct format.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
