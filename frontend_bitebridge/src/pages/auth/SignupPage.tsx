import { useState, type ChangeEvent, type FormEvent } from 'react';
import authApi from '../../services/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, User } from 'lucide-react';
import toast from 'react-hot-toast';
import usePageTitle from '../../hooks/usePagetitle';

function SignupPage() {
  usePageTitle("Signup")
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: '',
  })

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("click to hua hai bhai")
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password donot Match")
      return;
    }

    if (!profileImage) {
      toast.error('Profile Image is Required')
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = new FormData();

      dataToSubmit.append('name', formData.name);
      dataToSubmit.append('email', formData.email);
      dataToSubmit.append('phone', formData.phone);
      dataToSubmit.append('role', formData.role === "vendor" ? "vendorOwner" : "customer")
      dataToSubmit.append('password', formData.password);
      dataToSubmit.append('profileImage', profileImage)

      console.log("hi")
      const response = await authApi.signup(dataToSubmit);
      alert("success: " + response.data)
      console.log(response.data)
      setError(response.data.message)
      setAuthUser(response.data.user)
      if (formData.role === "vendor") navigate('/create-vendor')
      else navigate('/')
    } catch (err: any) {
      console.log('Signup failed:', err.response.data);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
        console.log(err.response)
      } else if (err.message) {
        console.log(err.response)
        toast.error(err.message);
      } else {
        toast.error('An error occurred during signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-8 py-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create an Account</h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Role Selection Cards */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I want to join as a:</label>
          <div className="flex gap-4">

            {/* Customer Card */}
            <div
              onClick={() => setFormData({ ...formData, role: 'customer' })}
              className={`flex-1 cursor-pointer p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${formData.role === 'customer'
                  ? 'border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-500'
                  : 'border-gray-200 hover:border-orange-300 text-gray-600'
                }`}
            >
              <User size={32} className="mb-2" /> {/* Customer Icon */}
              <span className="font-bold">Customer</span>
            </div>

            {/* Vendor Card */}
            <div
              onClick={() => setFormData({ ...formData, role: 'vendor' })}
              className={`flex-1 cursor-pointer p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${formData.role === 'vendor'
                  ? 'border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-500'
                  : 'border-gray-200 hover:border-orange-300 text-gray-600'
                }`}
            >
              <Store size={32} className="mb-2" /> {/* Vendor Icon */}
              <span className="font-bold">Vendor</span>
            </div>

          </div>

          {/* Hidden Input (Form submission logic ko tootne se bachane ke liye) */}
          {/* Isse aapka purana handleChange logic fail nahi hoga, bas user click karke select karega */}
          <input type="hidden" name="role" value={formData.role} />
        </div>

        {/* Profile Image Input */}
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-300 rounded-lg"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete='true'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete='true'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 rounded-lg active:scale-95 transition-all shadow-md hover:shadow-lg"
          >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="text-center text-gray-600 mt-4 text-sm">
          Already a user? <Link to="/login" className="text-orange-600 font-bold hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;