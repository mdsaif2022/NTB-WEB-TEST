import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { currentUser, sendVerificationEmail, refreshUserData } = useFirebaseAuth();
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    // Refresh user data to check verification status
    refreshUserData();
  }, [currentUser, navigate, refreshUserData]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      await sendVerificationEmail();
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      // Error is handled in the context
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      await currentUser?.reload();
      await refreshUserData();
      
      if (currentUser?.emailVerified) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Verify Email - NTB Tours</title>
        <meta name="description" content="Please verify your email address to complete your registration" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email Address Display */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Email sent to:</p>
                    <p className="text-sm text-emerald-700 font-mono">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Please check your email and click the verification link.</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Check your spam/junk folder if you don't see the email</li>
                      <li>• The verification link will expire in 1 hour</li>
                      <li>• You must verify your email before booking tours</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckVerification}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3"
                >
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>I've Verified My Email</span>
                  </div>
                </Button>

                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3"
                >
                  {isResending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you're having trouble verifying your email, please contact our support team.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">support@ntbtours.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">📞 +880 1234 567890</span>
                  </div>
                </div>
              </div>

              {/* Back to Login and Website */}
              <div className="text-center space-y-3">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
                
                <div className="text-gray-400">•</div>
                
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 font-medium hover:underline"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Website</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
