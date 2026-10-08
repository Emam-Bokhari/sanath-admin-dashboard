import Cookies from "js-cookie"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useLoginAdminMutation } from "../../redux/features/auth/authApi"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [viewPassword, setViewPassword] = useState(false)
    const [login] = useLoginAdminMutation()

    useEffect(() => {
        const savedEmail = Cookies.get("email");
        const savedPassword = Cookies.get("password");
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (acceptTerms) {
            Cookies.set("email", email);
            Cookies.set("password", password);
        }

        try {
            const response = await login({ email, password })?.unwrap();
            if (response?.success) {
                toast.success(response?.message);
                Cookies.set("accessToken", response?.data?.token);
                Cookies.set("role", response?.data?.user?.role);
                window.location.replace("/")
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#f7f8fc] to-[#eef2ff] px-4">
            <Card className="w-full max-w-md rounded-2xl shadow-lg" data-aos="zoom-in">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center">
                        <img src="/logo.png" className='w-full max-w-20 h-14 object-cover overflow-visible scale-70' alt="Logo" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                        Welcome back
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <Label className="mb-2">Email</Label>
                            <Input
                                type="email"
                                placeholder="enter email..."
                                className="h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="mb-2">Password</Label>
                            <div className="relative">
                                <Input
                                    type={viewPassword ? "text" : "password"}
                                    placeholder="enter password..."
                                    className="h-11 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setViewPassword(!viewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none p-0 cursor-pointer flex items-center justify-center"
                                >
                                    {viewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    checked={acceptTerms}
                                    onChange={() => setAcceptTerms(!acceptTerms)}
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                />
                                <Label htmlFor="terms" className="text-sm cursor-pointer">
                                    Remember Me
                                </Label>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary font-medium hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
