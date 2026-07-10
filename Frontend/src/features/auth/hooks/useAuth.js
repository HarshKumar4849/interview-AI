import { useContext } from "react"
import { AuthContext } from "../auth.context.jsx"
import { login,register,logout } from "../services/auth.api.js"
import { useEffect } from "react"

// here we are managing state layer of the application and providing the context to the components that need it.
export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    // here we are managing the state of the user and loading state and providing the functions to login, register and logout.

    // jab tak user login nahi hota tab tak loading true rahega aur jab user login ho jata hai tab loading false ho jata hai.
    const handleLogin = async (email, password) => {
        setLoading(true)
        try {
            const data = await login({email, password})
            setUser(data.user)
            return data.user;
        } catch (error) {
            console.log("Login failed:", error)
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({username, email, password}) => {
        setLoading(true)
        try {
            const data = await register({username, email, password})
            return data;
        } catch (error) {
            console.log("Register failed:", error)
            throw error;
        } finally {
            setLoading(false)
        }
    }

    // ye function logout ke liye hai jo ki user ko logout karta hai aur user ko null set karta hai.
    //jab tak user logout nahi hota tab tak loading true rahega aur jab user logout ho jata hai tab loading false ho jata hai.
    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.log("Logout failed:", error)
        } finally {
            setLoading(false)
        }
    }


    return { user, loading, handleLogin, handleRegister, handleLogout }
}