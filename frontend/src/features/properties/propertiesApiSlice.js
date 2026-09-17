import { apiSlice } from "../../app/apiSlice";

export const propertiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "/properties/projects",
      providesTags: ["Project"],
    }),
    createProject: builder.mutation({
      query: (body) => ({ url: "/properties/projects", method: "POST", body }),
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/properties/projects/${id}`, method: "PUT", body }),
      invalidatesTags: ["Project"],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({ url: `/properties/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Project"],
    }),
    createBuilding: builder.mutation({
      query: (body) => ({ url: "/properties/buildings", method: "POST", body }),
      invalidatesTags: ["Project"],
    }),
    deleteBuilding: builder.mutation({
      query: (id) => ({ url: `/properties/buildings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Project"],
    }),
    getUnits: builder.query({
      query: (params) => ({ url: "/properties/units", params }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Unit", id })), { type: "Unit", id: "LIST" }]
          : [{ type: "Unit", id: "LIST" }],
    }),
    createUnit: builder.mutation({
      query: (body) => ({ url: "/properties/units", method: "POST", body }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }, "Project", "Dashboard"],
    }),
    updateUnit: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/properties/units/${id}`, method: "PUT", body }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }, "Project", "Dashboard"],
    }),
    deleteUnit: builder.mutation({
      query: (id) => ({ url: `/properties/units/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Unit", id: "LIST" }, "Project", "Dashboard"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCreateBuildingMutation,
  useDeleteBuildingMutation,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = propertiesApiSlice;
