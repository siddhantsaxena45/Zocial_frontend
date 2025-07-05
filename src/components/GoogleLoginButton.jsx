// components/GoogleLoginButton.jsx
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post(
        "https://zocial-backend-m52y.onrender.com/api/v1/user/google-login",
        { token: credential },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(`${res.data.user.username} logged in with Google`);
        dispatch(setAuthUser(res.data.user));
        navigate("/"); // Redirect to homepage or dashboard
      }
    } catch (err) {
      
      toast.error("Google login failed");
    }
  };

  return (<>
    <div className="mb-4">
      <GoogleOAuthProvider clientId="51124827144-tlbnav5dcfmcq51fjq9v1e73smetc2jr.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => {
          
            toast.error("Google login failed");
          }}
          
        />
      </GoogleOAuthProvider>
    </div>
  </>
  );
};

export default GoogleLoginButton;
