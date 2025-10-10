import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Key, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useFirebaseAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setIsEmailSent(true);
    } catch (error) {
      // Error is handled in the context, but we can also show it here
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isEmailSent) {
    return (
      <>
        <Helmet>
          <title>Password Reset Sent - NTB Tours</title>
          <meta name="description" content="Password reset email has been sent to your email address" />
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
                <CardDescription className="text-gray-600">
                  Password reset instructions have been sent
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Success Message */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p className="font-medium">Password reset email sent successfully!</p>
                      <p className="text-sm">
                        We've sent password reset instructions to <strong>{email}</strong>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the password reset link in the email</li>
                    <li>• Create a new secure password</li>
                    <li>• Sign in with your new password</li>
                  </ul>
                </div>

                {/* Email Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email sent to:</p>
                      <p className="text-sm text-gray-700 font-mono">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setIsEmailSent(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Send to Different Email</span>
                    </div>
                  </Button>

                  <Link to="/auth/login">
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3"
                    >
                      <div className="flex items-center space-x-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Login</span>
                      </div>
                    </Button>
                  </Link>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                    Still having trouble?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    If you don't receive the email within a few minutes, please check your spam folder or contact support.
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
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password - NTB Tours</title>
        <meta name="description" content="Reset your password to regain access to your account" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleInputChange}
                      className={`pl-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Information */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">How it works:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Enter your registered email address</li>
                      <li>• We'll send you a password reset link</li>
                      <li>• Click the link to create a new password</li>
                      <li>• Sign in with your new password</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

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
