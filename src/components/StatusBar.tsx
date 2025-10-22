import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { checkConnectionStatus } from '../services/litellm';

interface ConnectionStatus {
  isConnected: boolean;
  model: string;
  baseUrl: string;
  lastChecked: Date;
  error?: string;
}

export function StatusBar() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const connectionStatus = await checkConnectionStatus();
      setStatus(connectionStatus);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus({
        isConnected: false,
        model: 'Unknown',
        baseUrl: 'Unknown',
        lastChecked: new Date(),
        error: 'Failed to check status'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking connection...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">HiperGator Status: Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">HiperGator Status: Failed</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkStatus}
            disabled={isChecking}
            className="h-6 px-2"
          >
            {isChecking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Model: {status.model}
        </div>
        
        {!status.isConnected && status.error && (
          <div className="text-xs text-red-600">
            {status.error.includes('401') ? 'API Key Issue' : 
             status.error.includes('database') ? 'Service Unavailable' : 
             'Network Error'}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Last checked: {status.lastChecked.toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}
