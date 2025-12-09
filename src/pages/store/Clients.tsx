// import React, { useState } from "react";
// import axios from "axios";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Plus, Edit, Trash2 } from "lucide-react";
// import Button from "../../components/Button";
// import { baseUrl } from "../../Api-Service/ApiUrls";
// import { useParams } from "react-router-dom";

// const BASE_URL = `${baseUrl}/our-client/`;

// type Client = {
//   id: number;
//   title: string;
//   created_by: string;
//   vendor: number;
//   image_url: string;
// };

// type ClientFormState = {
//   title: string;
//   image_file: File | null;
// };

// export default function Clients() {
//   const queryClient = useQueryClient();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingClient, setEditingClient] = useState<Client | null>(null);
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [deleteClient, setDeleteClient] = useState<Client | null>(null);
//     const { id } = useParams<{ id: any }>();

//   const [formData, setFormData] = useState<ClientFormState>({
//     title: "",
//     image_file: null,
//   });

//   /* --------------------------- Queries --------------------------- */
//   const { data: clients, isLoading } = useQuery<{ clients: Client[] }>({
//     queryKey: ["our-client"],
//     queryFn: async () => {
//       const res = await axios.get(`${BASE_URL}?vendorId=${id}`);
//       return res.data;
//     },
//   });

//   /* --------------------------- Mutations --------------------------- */
//   const upsertMutation = useMutation({
//     mutationFn: async (payload: ClientFormState) => {
//       const fd = new FormData();
//       fd.append("title", payload.title);
//       fd.append("created_by", `vendor${id}`);
//       fd.append("vendor", id);
//       if (payload.image_file) fd.append("image_file", payload.image_file);
//       if (!payload.image_file && editingClient) {
//   fd.append("keep_existing_image", editingClient.image_url); 
// }


//       if (editingClient) {
//         return axios.put(`${BASE_URL}${editingClient.id}/`, fd, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       } else {
//         return axios.post(BASE_URL, fd, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["our-client"] });
//       closeModal();
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: number) => axios.delete(`${BASE_URL}${id}/`),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["our-client"] });
//       closeDeleteConfirm();
//     },
//   });

//   /* --------------------------- Handlers --------------------------- */
//   const openAddModal = () => {
//     setEditingClient(null);
//     setFormData({ title: "", image_file: null });
//     setIsModalOpen(true);
//   };

//   const openEditModal = (client: Client) => {
//     setEditingClient(client);
//     setFormData({
//       title: client?.title || "",
//       image_file: null,
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingClient(null);
//   };

//   const openDeleteConfirm = (client: Client) => {
//     setDeleteClient(client);
//     setDeleteModal(true);
//   };

//   const closeDeleteConfirm = () => {
//     setDeleteClient(null);
//     setDeleteModal(false);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     upsertMutation.mutate(formData);
//   };

//   const handleDeleteConfirmed = () => {
//     if (!deleteClient) return;
//     deleteMutation.mutate(deleteClient.id);
//   };

//   /* --------------------------- Render --------------------------- */
//   return (
//     <div className="">
//       <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <h1 className="text-2xl font-bold">Clients</h1>
//         <Button onClick={openAddModal} className="flex">
//           <Plus className="h-4 w-4 mr-2 my-auto" />
//           Add Client
//         </Button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 ">
//         {isLoading ? (
//           <div className="p-6 text-center">Loading...</div>
//         ) : clients?.clients?.length ? (
//           <table className="min-w-full divide-y divide-gray-300">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-semibold">S.No</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold">Image</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
//                 {/* <th className="px-4 py-2 text-left text-sm font-semibold">Created By</th> */}
//                 <th className="px-4 py-2 text-sm font-semibold text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {clients.clients.map((client: Client, idx: number) => (
//                 <tr key={client.id}>
//                   <td className="px-4 py-2 text-sm">{idx + 1}</td>
//                   <td className="px-4 py-2 text-sm">
//                     <img src={client.image_url} alt={client.title} className="w-12 h-12 object-cover rounded" />
//                   </td>
//                   <td className="px-4 py-2 text-sm">{client.title}</td>
//                   {/* <td className="px-4 py-2 text-sm">{client.created_by}</td> */}
//                   <td className="px-4 py-2 text-sm text-center space-x-2">
//                     <Button variant="outline" onClick={() => openEditModal(client)}>
//                       <Edit className="inline-block h-4 w-4 mr-1" />
//                       Edit
//                     </Button>
//                     <Button variant="outline" onClick={() => openDeleteConfirm(client)}>
//                       <Trash2 className="inline-block h-4 w-4 mr-1" />
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="p-6 text-center text-blue-600 font-bold">No Clients Found</div>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <h2 className="text-lg font-semibold mb-4">
//               {editingClient ? "Edit Client" : "Add Client"}
//             </h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={formData.title}
//                 onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
//                 className="w-full border px-3 py-2 rounded"
//               />
//               {/* <input
//                 type="text"
//                 placeholder="Created By"
//                 value={formData.created_by}
//                 onChange={(e) => setFormData((s) => ({ ...s, created_by: e.target.value }))}
//                 className="w-full border px-3 py-2 rounded"
//               /> */}
//               {/* <input
//                 type="text"
//                 placeholder="Vendor ID"
//                 value={formData.vendor}
//                 onChange={(e) => setFormData((s) => ({ ...s, vendor: e.target.value }))}
//                 className="w-full border px-3 py-2 rounded"
//               /> */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setFormData((s) => ({ ...s, image_file: e.target.files?.[0] || null }))}
//                 className="w-full border px-3 py-2 rounded"
//               />

//               <div className="flex justify-end gap-4">
//                 <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={upsertMutation.isLoading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded"
//                 >
//                   {upsertMutation.isLoading ? "Saving..." : "Save"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {deleteModal && deleteClient && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
//             <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
//             <p className="text-sm mb-4">
//               Are you sure you want to delete{" "}
//               <span className="font-bold">{deleteClient.title}</span>?
//             </p>
//             <div className="flex justify-end gap-4">
//               <button type="button" onClick={closeDeleteConfirm} className="px-4 py-2 border rounded">
//                 Cancel
//               </button>
//               <button type="button" onClick={handleDeleteConfirmed} className="px-4 py-2 bg-red-600 text-white rounded">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import Button from "../../components/Button";
import { baseUrl } from "../../Api-Service/ApiUrls";
import { useParams } from "react-router-dom";

const BASE_URL = `${baseUrl}/our-client/`;

type Client = {
  id: number;
  title: string;
  created_by: string;
  vendor: number;
  image_url: string;
};

type ClientFormState = {
  title: string;
  image_file: File | null;
  preview_url: string | null; // ⭐ Preview support
};

export default function Clients() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: any }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<ClientFormState>({
    title: "",
    image_file: null,
    preview_url: null,
  });

  /* --------------------------- Queries --------------------------- */
  const { data: clients, isLoading } = useQuery<{ clients: Client[] }>({
    queryKey: ["our-client"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}?vendorId=${id}`);
      return res.data;
    },
  });

  /* --------------------------- Mutations --------------------------- */
  const upsertMutation = useMutation({
    mutationFn: async (payload: ClientFormState) => {
      const fd = new FormData();
      fd.append("title", payload.title);
      fd.append("vendor", id);

      // 👉 Created by only on NEW item
      if (!editingClient) {
        fd.append("created_by", `vendor${id}`);
      }

      // 👉 Updated by only when EDITING
      if (editingClient) {
        fd.append("updated_by", `vendor${id}`);
      }

      // 👉 Image (only append if selected)
      if (payload.image_file) {
        fd.append("image_file", payload.image_file);
      }

      if (editingClient) {
        // 🔥 PUT request for update
        return axios.put(`${BASE_URL}${editingClient.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // 🚀 POST request for create
        return axios.post(BASE_URL, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["our-client"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => axios.delete(`${BASE_URL}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["our-client"] });
      closeDeleteConfirm();
    },
  });

  /* --------------------------- Handlers --------------------------- */
  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      title: "",
      image_file: null,
      preview_url: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      title: client.title,
      image_file: null,
      preview_url: client.image_url, // ⭐ Existing image preview
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const openDeleteConfirm = (client: Client) => {
    setDeleteClient(client);
    setDeleteModal(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteClient(null);
    setDeleteModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteClient) return;
    deleteMutation.mutate(deleteClient.id);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={openAddModal} className="flex">
          <Plus className="h-4 w-4 mr-2 my-auto" />
          Add Client
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 ">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : clients?.clients?.length ? (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">S.No</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-2 text-sm font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {clients.clients.map((client: Client, idx: number) => (
                <tr key={client.id}>
                  <td className="px-4 py-2 text-sm">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm">
                    <img src={client.image_url} alt={client.title} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-2 text-sm">{client.title}</td>
                  <td className="px-4 py-2 text-sm text-center space-x-2">
                    <Button variant="outline" onClick={() => openEditModal(client)}>
                      <Edit className="inline-block h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => openDeleteConfirm(client)}>
                      <Trash2 className="inline-block h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-blue-600 font-bold">No Clients Found</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? "Edit Client" : "Add Client"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
                className="w-full border px-3 py-2 rounded"
              />

              {/* ⭐ Preview Image */}
              {formData.preview_url && (
                <img
                  src={formData.preview_url}
                  alt="Preview"
                  className="w-28 h-28 object-cover rounded mx-auto border"
                />
              )}

              {/* ⭐ File Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({
                    ...prev,
                    image_file: file,
                    preview_url: file ? URL.createObjectURL(file) : prev.preview_url,
                  }));
                }}
                className="w-full border px-3 py-2 rounded"
              />

              <div className="flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {upsertMutation.isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && deleteClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-sm mb-4">
              Are you sure you want to delete{" "}
              <span className="font-bold">{deleteClient.title}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeDeleteConfirm} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteConfirmed} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
