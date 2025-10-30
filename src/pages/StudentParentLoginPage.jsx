import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

export default function StudentParentLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loading, studentParentLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    await studentParentLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <Helmet>
        <title>Student & Parent Login - Edu Portal</title>
        <meta name="description" content="Secure login portal for students and parents to access their performance dashboard and insights." />
        <meta property="og:title" content="Student & Parent Login - Edu Portal" />
        <meta property="og:description" content="Secure login portal for students and parents to access their performance dashboard and insights." />
      </Helmet>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-effect border-white/10">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mb-4"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold gradient-text-alt">Student & Parent Portal</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your portal username and password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter student or family username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
               <Link to="/login" className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                 <GraduationCap className="w-4 h-4 mr-2" />
                 Are you a Staff member? Login Here
               </Link>
             </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}