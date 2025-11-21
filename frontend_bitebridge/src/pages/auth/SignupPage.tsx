import { useState, type ChangeEvent, type FormEvent } from 'react';
import authApi from '../../services/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const {setAuthUser} = useAuth();
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
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Password do not match")
      return;
    }

    if (!profileImage) {
      setError('Profile Image is Required')
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
      alert("success: "+ response.data)
      console.log(response.data)
      setError(response.data.message)
      setAuthUser(response.data.user)
      if(formData.role==="vendor") navigate('/create-vendor')
      else navigate('/')
    } catch (err: any) {
      console.log('Signup failed:', err.response.data);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        console.log(err.response)
      } else if (err.message) {
        console.log(err.response)
        setError(err.message);
      } else {
        setError('An error occurred during signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Name Input */}
        <div>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel" // Use 'tel' for better mobile support
            id="phone"
            name="phone"
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* Role Select */}
        <div>
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="customer">I am a Customer</option>
            <option value="vendor">I am a Vendor</option>
          </select>
        </div>

        {/* Profile Image Input */}
        <div>
          <label htmlFor="profileImage">Profile Image</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*" // Only accept image files
            onChange={handleFileChange}
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password" // Use 'password' type to hide characters
            id="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Error Display */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p>already a user? <span><Link to="/login">Login</Link></span></p>
      </form>
    </div>
  );
}

export default SignupPage