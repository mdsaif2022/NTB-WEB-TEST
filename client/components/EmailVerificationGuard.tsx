import React from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, RefreshCw, Home } from 'lucide-react';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export default function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { currentUser, userData, sendVerificationEmail, loading } = useFirebaseAuth();
  const [isResending, setIsResending] = React.useState(false);

  // If no user is logged in, show children (login will be handled by other components)
  if (!currentUser) {
    return <>{children}</>;
  }

  // If user is logged in but email is not verified, show verification screen
  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Email Verification Required</CardTitle>
              <CardDescription className="text-gray-600">
                Please verify your email address to access the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You must verify your email address before you can access the website. Check your email for the verification link.
                </AlertDescription>
              </Alert>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Email to verify:</p>
                    <p className="text-sm text-emerald-700 font-mono">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={async () => {
                    if (isResending) return;
                    setIsResending(true);
                    try {
                      await sendVerificationEmail();
                    } catch (error) {
                      console.error('Error sending verification email:', error);
                    } finally {
                      setIsResending(false);
                    }
                  }}
                  disabled={isResending || loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-2">
                    {isResending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </div>
                </Button>
                
                <Link to="/auth/verify-email">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Check Verification Status</span>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Back to Website</span>
                    </div>
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't see the email? Check your spam folder or{' '}
                  <button 
                    onClick={async () => {
                      if (isResending) return;
                      setIsResending(true);
                      try {
                        await sendVerificationEmail();
                      } catch (error) {
                        console.error('Error sending verification email:', error);
                      } finally {
                        setIsResending(false);
                      }
                    }}
                    disabled={isResending || loading}
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'sending...' : 'resend it'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in and email is verified, show children
  return <>{children}</>;
}
