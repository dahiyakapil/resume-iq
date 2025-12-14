// import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
// import type { SigninFormData } from "@/lib/validationSchemas";
// import type { AuthResponse, User } from "@/types/User";
// import { signin } from "../services/authApi";


// interface AuthState {
//   loading: boolean;
//   error: string | null;
//   user: User | null;
// }

// const initialState: AuthState = {
//   loading: false,
//   error: null,
//   user: null,
// };

// // Async thunk with no `any`
// export const loginUser = createAsyncThunk<
//   AuthResponse,            // ✅ Return type
//   SigninFormData,          // ✅ Argument type
//   { rejectValue: string }  // ✅ Rejection value type
// >(
//   "auth/signinUser",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await signin(formData); // Must return `AuthResponse`
//       return response;
//     } catch (err) {
//       if (err instanceof Error) {
//         return rejectWithValue(err.message);
//       }
//       return rejectWithValue("Failed to sign in");
//     }
//   }
// );

// const signinSlice = createSlice({
//   name: "login",
//   initialState,
//   reducers: {
//     clearSigninError: (state) => {
//       state.error = null;
//     },
//     logout: (state) => {
//       state.user = null;
//       localStorage.removeItem("token");
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         localStorage.setItem("token", action.payload.token);
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Failed to sign in";
//       });
//   },
// });

// export const { clearSigninError, logout } = signinSlice.actions;
// export default signinSlice.reducer;




import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { SigninFormData } from "@/lib/validationSchemas";
import type { AuthResponse, User } from "@/types/User";
import { signin } from "../services/authApi";
import axios from "axios";

interface AuthState {
  loading: boolean;
  error: string | null;
  user: User | null;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  user: null,
};

// Async thunk with strict typing
export const loginUser = createAsyncThunk<
  AuthResponse,            // success payload
  SigninFormData,          // argument type
  { rejectValue: string }  // rejection payload
>(
  "auth/signinUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await signin(formData);
      return response;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message ?? "Server error");
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to sign in");
    }
  }
);

const signinSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    clearSigninError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        const token = action.payload.token;
        if (token) {
          localStorage.setItem("token", token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to sign in"; // ✅ no any
      });
  },
});

export const { clearSigninError, logout } = signinSlice.actions;
export default signinSlice.reducer;
