
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { sendOtp } from "@/app/features/otp/sendOtp";
import type { SendOtpPayload } from "@/types/User";
import { schemaSignup } from "@/lib/validationSchemas";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface SignupFormValues {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.sendOtp);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schemaSignup),
    mode: "onTouched",
  });

  const onSubmit = async (data: SignupFormValues) => {
    const { firstName, lastName, email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload: SendOtpPayload = {
      firstName,
      lastName: lastName || "",
      email,
      password,
    };

    const resultAction = await dispatch(sendOtp(payload));

    if (sendOtp.fulfilled.match(resultAction)) {
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", {
        state: { email, firstName, lastName, password },
      });
    } else {
      toast.error(error || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black px-4 sm:px-6">
      {/* Background squares */}
      <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 grid-rows-6 sm:grid-rows-8 opacity-10">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className="border border-white/20 backdrop-blur-sm"
          ></div>
        ))}
      </div>

     {/* Back Button */}
      <motion.button
        onClick={() => navigate("/")} 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
      >
        <ArrowLeft size={18} />
       
      </motion.button>

      {/* Glassmorphism card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xs sm:max-w-md md:max-w-lg mt-16"
      >
        <Card className="bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl px-4 py-6 sm:px-6 sm:py-8">
          <CardHeader className="mb-4 sm:mb-6">
            <CardTitle className="text-center text-white text-xl sm:text-2xl font-bold">
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name */}
              <div>
                <Input
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className="bg-white/10 text-white border-white/20 placeholder:text-gray-300"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <Input
                type="text"
                placeholder="Last Name (optional)"
                {...register("lastName")}
                className="bg-white/10 text-white border-white/20 placeholder:text-gray-300"
              />

              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="bg-white/10 text-white border-white/20 placeholder:text-gray-300"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="bg-white/10 text-white border-white/20 placeholder:text-gray-300"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="bg-white/10 text-white border-white/20 placeholder:text-gray-300"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:brightness-110 disabled:opacity-50 text-sm sm:text-base py-2 sm:py-3"
              >
                {loading ? "Sending OTP..." : "Sign Up"}
              </Button>

              {/* Already have an account */}
              <p className="text-center text-gray-300 text-sm mt-3">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-400 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
