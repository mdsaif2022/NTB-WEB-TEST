import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoModeBannerProps {
  isVisible: boolean;
}

export default function DemoModeBanner({ isVisible }: DemoModeBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Demo Mode Active
              </p>
              <p className="text-xs text-yellow-700">
                Firebase authentication is disabled. Set up Firebase to enable user registration and login.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/auth/login">
              <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                <Settings className="w-4 h-4 mr-1" />
                Setup Guide
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              onClick={() => {
                // Hide the banner for this session
                sessionStorage.setItem('hideDemoBanner', 'true');
                window.location.reload();
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
