import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../firebase";
import axios from "axios";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../auth.context";

const GoogleButton = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleGoogleLogin = async () => {
    try {
      // Google popup
      const result = await signInWithPopup(auth, provider);

      const googleUser = result.user;

      // Send data to backend
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await axios.post(
        `${baseUrl}/api/auth/google`,
        {
          username: googleUser.displayName || googleUser.email.split("@")[0],
          email: googleUser.email,
        },
        {
          withCredentials: true,
        }
      );

      // Update auth context with the user returned from POST response
      setUser(response.data.user);

      navigate("/dashboard");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <button
      type="button"
      className="button google-button"
      onClick={handleGoogleLogin}
    >
      Continue with Google
    </button>
  );
};

export default GoogleButton;