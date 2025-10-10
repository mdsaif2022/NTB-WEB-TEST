import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Home } from 'lucide-react';

export default function PasswordlessLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [error, setError] = useState('');
  const { sendPasswordlessSignInLink, isSignInWithEmailLink, signInWithEmailLink } = useFirebaseAuth();
  const navigate = useNavigate();

  // Check if user came from an email link
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(window.location.href)) {
        const email = window.localStorage.getItem('emailForSignIn');
        if (email) {
          try {
            await signInWithEmailLink(email, window.location.href);
            navigate('/');
          } catch (error) {
            console.error('Email link sign-in error:', error);
            setError('Failed to sign in with email link. Please try again.');
          }
        } else {
          setError('Please enter your email address to complete the sign-in process.');
        }
      }
    };

    handleEmailLinkSignIn();
  }, [isSignInWithEmailLink, signInWithEmailLink, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordlessSignInLink(email);
      setIsLinkSent(true);
    } catch (error) {
      console.error('Passwordless login error:', error);
      setError('Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a sign-in link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Click the link in your email to sign in without a password. The link will expire in 1 hour.
                </AlertDescription>
              </Alert>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Email sent to:</p>
                    <p className="text-sm text-emerald-700 font-mono">{email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3"
                  onClick={() => setIsLinkSent(false)}
                >
                  Send Another Link
                </Button>
                <Link to="/auth/login">
                  <Button variant="ghost" className="w-full text-gray-600 hover:bg-gray-50 font-semibold py-3">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Passwordless Sign-In</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email to receive a secure sign-in link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Send Sign-In Link</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <Link to="/auth/login">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Regular Login
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign up here
                </Link>
              </p>
              
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
  );
}
