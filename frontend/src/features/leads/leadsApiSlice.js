import { apiSlice } from "../../app/apiSlice";

export const leadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({ url: "/leads", params }),
      providesTags: (result) =>
        result
          ? [...result.leads.map(({ id }) => ({ type: "Lead", id })), { type: "Lead", id: "LIST" }]
          : [{ type: "Lead", id: "LIST" }],
    }),
    getLead: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (r, e, id) => [{ type: "Lead", id }],
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: "/leads", method: "POST", body }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "Dashboard"],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "Lead", id }, { type: "Lead", id: "LIST" }, "Dashboard"],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({ url: `/leads/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "Dashboard"],
    }),
    addLeadNote: builder.mutation({
      query: ({ id, note }) => ({ url: `/leads/${id}/notes`, method: "POST", body: { note } }),
      invalidatesTags: (r, e, { id }) => [{ type: "Lead", id }],
    }),
    uploadLeadAttachment: builder.mutation({
      query: ({ id, formData }) => ({ url: `/leads/${id}/attachments`, method: "POST", body: formData }),
      invalidatesTags: (r, e, { id }) => [{ type: "Lead", id }],
    }),
    importLeads: builder.mutation({
      query: (formData) => ({ url: "/leads/import", method: "POST", body: formData }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useAddLeadNoteMutation,
  useUploadLeadAttachmentMutation,
  useImportLeadsMutation,
} = leadsApiSlice;
