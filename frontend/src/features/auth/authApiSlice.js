import { apiSlice } from "../../app/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: "/auth/login", method: "POST", body: credentials }),
    }),
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
    }),
    getUsers: builder.query({
      query: () => "/auth/users",
      providesTags: ["User"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useGetUsersQuery } = authApiSlice;
