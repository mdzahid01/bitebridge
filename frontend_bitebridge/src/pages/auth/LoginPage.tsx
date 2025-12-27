import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Eye, LogIn, AlertCircle, EyeOff } from "lucide-react"; // ✅ Icons import kiye
import authApi from "../../services/authApi";
import { useAuth } from "../../context/AuthContext"; 
import usePageTitle from "../../hooks/usePageTitle";

function LoginPage() {
  usePageTitle("Login")
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword,setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      const response = await authApi.login(credentials);

      if (response.data.user) {
        setAuthUser(response.data.user);
        navigate('/');
      }

    } catch (err: any) {
      console.log("Login failed:", err);
      setError(err.response?.data?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 bg-gray-50">
      
      {/* 2. Main Card Container */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        
        {/* 3. Header Section with Icon */}
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 shadow-sm">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="true"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
                </label>
                {/* Optional: Forgot Password Link */}
                <Link to="/forgot-password" className="text-xs text-orange-600 hover:underline">
                    Forgot Password?
                </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer text-gray-400">
                {showPassword ?<Eye size={20}  onClick={()=>setShowPassword(prev=>!prev)} />:<EyeOff size={20}  onClick={()=>setShowPassword(prev=>!prev)} />}
              </div>
              <input
                type={showPassword?"text":"password"}
                name="password"
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="true"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
                <>Logging in...</>
            ) : (
                <>Login <LogIn size={18} /></>
            )}
          </button>

          {/* Footer Link */}
          <p className="text-center text-gray-600 mt-6 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;