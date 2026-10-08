import Cookies from "js-cookie"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useForgetPasswordMutation } from "../../redux/features/auth/authApi"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [forgetPassword] = useForgetPasswordMutation()

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await forgetPassword({ email }).unwrap();
      if (res?.success) {
        toast.success(res?.message);
        Cookies.set("resetEmail", email);
        const expiryTime = Date.now() + 3 * 60 * 1000;
        Cookies.set("otpExpiry", expiryTime.toString());
        navigate("/otp-verify");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#f7f8fc] to-[#eef2ff] px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg" data-aos="zoom-in">
        <form onSubmit={handleForgotPassword}>
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <img src="/logo.png" className='w-full max-w-20 h-14 object-cover overflow-visible scale-70' alt="Logo" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a reset link
            </p>
          </CardHeader>

          <CardContent className="space-y-6 mt-3">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="enter email..."
                className="h-11"
              />
            </div>

            <Button className="w-full h-11 text-base">
              Send Reset Link
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to Login
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
