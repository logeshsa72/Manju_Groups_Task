import { apiSlice } from "../../app/apiSlice";

export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => "/bookings",
      providesTags: ["Booking"],
    }),
    createBooking: builder.mutation({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      invalidatesTags: ["Booking", { type: "Unit", id: "LIST" }, { type: "Lead", id: "LIST" }, "Dashboard"],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["Booking", { type: "Unit", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const { useGetBookingsQuery, useCreateBookingMutation, useCancelBookingMutation } = bookingsApiSlice;
