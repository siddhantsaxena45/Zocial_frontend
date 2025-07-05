import React, { use, useEffect } from 'react'
import GoogleLoginButton from './GoogleLoginButton'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
const Login = () => {

    const [input, setInput] = useState({

        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)

    const dispatch=useDispatch()

    const navigate = useNavigate()
    const {user}=useSelector(state=>state.auth)
    useEffect(() => {
        if(user){
            navigate("/")
        }
    }, [])
    
    const handleChange = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value,
        })
    }

    const signupHandler = async (e) => {
        e.preventDefault()
     
        try {
            setLoading(true)
            const res = await axios.post("https://zocial-backend-m52y.onrender.com/api/v1/user/login", input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user))
                navigate("/")
                toast.success(res.data.message)
                setInput({

                    email: "",
                    password: "",
                })
            }

        }
        catch (err) {
            toast.error(err.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                      <h2 className="mt-10 text-center text-4xl font-bold  text-purple-900">
                        ZOCIAL
                    </h2>
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Login
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={signupHandler} className="space-y-6">
                        <div ><GoogleLoginButton /></div>

                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    onChange={handleChange}
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    required
                                    autoComplete="email"
                                    className="block w-full border-2 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Password
                                </label>

                            </div>
                            <div className="mt-2">
                                <input
                                    onChange={handleChange}
                                    id="password"
                                    name="password"
                                    value={input.password}
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="block w-full border-2 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            {loading ? <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <Loader2 className="animate-spin" />
                                Please wait ...
                            </button> :
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Login
                                </button>
                            }
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Login
