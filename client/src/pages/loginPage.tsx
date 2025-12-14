// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { useAppDispatch, useAppSelector } from "@/hooks/redux";
// import { loginUser } from "@/app/features/signInSlice";
// import { fetchCurrentUser } from "@/app/features/authSlice";
// import { schemaSignIn, type SigninFormData } from "@/lib/validationSchemas";
// import { ArrowLeft } from "lucide-react";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { loading, error } = useAppSelector((state) => state.login);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SigninFormData>({
//     resolver: zodResolver(schemaSignIn),
//     mode: "onTouched",
//   });

//   const onSubmit = async (data: SigninFormData) => {
//     const result = await dispatch(loginUser(data));
//     if (loginUser.fulfilled.match(result)) {
//       toast.success("Logged in successfully!");
//       await dispatch(fetchCurrentUser());
//       navigate("/dashboard");
//     } else if (loginUser.rejected.match(result)) {
//       toast.error(result.payload as string);
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
//       {/* Background pattern */}
//       <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

//       {/* Back Button */}
//       <motion.button
//         onClick={() => navigate("/")} 
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
//       >
//         <ArrowLeft size={18} />
       
//       </motion.button>

//       {/* Glassmorphism Login Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className="w-full max-w-sm sm:max-w-md relative z-10 mt-8"
//       >
//         <Card className="bg-white/10 border-white/20 backdrop-blur-lg shadow-2xl">
//           <CardHeader>
//             <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
//               Welcome Back
//             </CardTitle>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               {/* Email */}
//               <div>
//                 <Label htmlFor="email" className="text-gray-200">
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   {...register("email")}
//                   className="bg-white/10 border-white/20 text-white placeholder-gray-300"
//                 />
//                 {errors.email && (
//                   <p className="text-red-400 text-sm mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>

//               {/* Password */}
//               <div>
//                 <Label htmlFor="password" className="text-gray-200">
//                   Password
//                 </Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   {...register("password")}
//                   className="bg-white/10 border-white/20 text-white placeholder-gray-300"
//                 />
//                 {errors.password && (
//                   <p className="text-red-400 text-sm mt-1">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               {/* Login Button */}
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-md hover:brightness-110 transition-all duration-200"
//               >
//                 {loading ? "Logging in..." : "Log In"}
//               </Button>
//             </form>

//             {/* Signup link */}
//             <div className="flex justify-center mt-4 text-sm text-gray-300">
//               <p>
//                 Don’t have an account?{" "}
//                 <button
//                   onClick={() => navigate("/signup")}
//                   className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
//                 >
//                   Sign Up
//                 </button>
//               </p>
//             </div>

//             {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }


import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser } from "@/app/features/signInSlice";
import { fetchCurrentUser } from "@/app/features/authSlice";
import { schemaSignIn, type SigninFormData } from "@/lib/validationSchemas";
import { ArrowLeft } from "lucide-react";
import type { User } from "@/types/User";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(schemaSignIn),
    mode: "onTouched",
  });

  const onSubmit = async (data: SigninFormData) => {
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      toast.success("Logged in successfully!");

      const userResult = await dispatch(fetchCurrentUser());

      if (fetchCurrentUser.fulfilled.match(userResult)) {
        const user = userResult.payload as User; // ✅ typed user
        // Role-based redirect
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } else if (loginUser.rejected.match(result)) {
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

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

      {/* Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm sm:max-w-md relative z-10 mt-8"
      >
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
              Welcome Back
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...register("email")}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-md hover:brightness-110 transition-all duration-200"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            {/* Signup link */}
            <div className="flex justify-center mt-4 text-sm text-gray-300">
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
