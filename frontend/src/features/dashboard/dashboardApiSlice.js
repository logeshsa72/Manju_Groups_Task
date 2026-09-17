import { apiSlice } from "../../app/apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApiSlice;
