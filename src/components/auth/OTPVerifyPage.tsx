import Cookies from "js-cookie";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCountdown } from "../../hooks/useCountdown";
import { useResendOTPMutation, useVerifyOTPMutation } from "../../redux/features/auth/authApi";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

const OTPVerifyPage = () => {
    const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [verifyOTP] = useVerifyOTPMutation();
    const navigate = useNavigate();

    const { timeLeft, finished, start } = useCountdown({ storageKey: "otpExpiry" });
    const [resendOtp] = useResendOTPMutation();

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < 4) {
            toast.error("Please enter the complete OTP");
            return;
        }

        const email = Cookies.get("resetEmail");
        if (!email) {
            toast.error("Reset Email Not Found!");
            return;
        }

        try {
            const res = await verifyOTP({ email, oneTimeCode: Number(otpCode) }).unwrap();
            if (res?.success) {
                Cookies.set("verifyToken", res?.data);
                Cookies.remove("resetEmail");
                toast.success(res?.message);
                navigate("/new-password");
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (!/^\d+$/.test(pastedData)) {
            toast.error("Please paste only numbers");
            return;
        }

        const digits = pastedData.slice(0, 4).split("");
        const newOtp = [...otp];

        digits.forEach((digit, i) => {
            if (index + i < 4) {
                newOtp[index + i] = digit;
            }
        });

        setOtp(newOtp);

        const nextIndex = Math.min(index + digits.length, 3);
        inputsRef.current[nextIndex]?.focus();
    };

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 3) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = async () => {
        setOtp(Array(4).fill(""));

        try {
            const email = Cookies.get("email");
            const res = await resendOtp({ email }).unwrap();
            if (res?.success) {
                toast.success(res.message);
                start();
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message);
        }
    };

    return (
        <div className="flex flex-col w-full items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-[90%] mx-auto md:w-full max-w-xl p-0 sm:p-10" data-aos="zoom-in">
                <CardHeader className="flex flex-col items-center space-y-3">
                    <img src="/logo.png" className='w-full max-w-20 h-14 object-cover overflow-visible scale-70' alt="Logo" />
                    <h2 className="text-2xl font-bold text-center">OTP Verification</h2>
                    <p className='text-md text-center text-slate-500 font-sans'>
                        Enter the OTP sent to your email
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-2 mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputsRef.current[index] = el; }}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={(e) => handlePaste(e, index)}
                                maxLength={1}
                                className="border-2 border-gray-300 p-2 text-center w-12 h-12 rounded text-xl font-semibold focus:border-blue-500 focus:outline-none"
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleVerify}
                        disabled={finished || otp.join("").trim().length < 4}
                        className="w-full mx-auto px-6 py-2 rounded mb-4 font-semibold"
                    >
                        Verify OTP
                    </Button>

                    <p className="mb-2 text-center">
                        Time left:{" "}
                        <span className="font-bold text-red-500">
                            {finished ? "Expired" : `${minutes}:${seconds}`}
                        </span>
                    </p>

                    <Button
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={!finished}
                        className={`w-full mx-auto px-4 py-2 rounded font-semibold ${finished
                            ? 'bg-primary! text-white! cursor-not-allowed'
                            : 'border-gray-500! border-2! hover:bg-gray-200! transition-all! duration-300!'
                        }`}
                    >
                        Resend OTP
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default OTPVerifyPage;
