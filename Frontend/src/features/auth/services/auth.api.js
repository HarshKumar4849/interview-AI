import axios from "axios";
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api/auth`,
    withCredentials: true
});

export async function register({ username, email, password }) {
    try {
        const response = await api.post("/register", {
            username,
            email,
            password
        });
        return response.data;
    } catch (err) {
        console.error("Error registering user:", err);
        const message = err.response?.data?.message || "Registration failed. Please try again.";
        throw new Error(message);
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/login", {
            email,
            password
        });
        return response.data;
    } catch (err) {
        console.error("Error logging in user:", err);
        const message = err.response?.data?.message || "Login failed. Please check your credentials.";
        throw new Error(message);
    }
}

export async function logout() {
    try {
        const response = await api.get("/logout");
        return response.data;
    } catch (err) {
        console.log("Error logging out user:", err);
    }
}

export async function getMe() {
    try {
        const response = await api.get("/get-me");
        return response.data;
    } catch (err) {
        console.log("Error getting user data:", err);
    }
}