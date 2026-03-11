import { useState, useEffect } from "react";
import { http } from "../api/http";
import { UsersRound, Plus, X, Phone, Mail, BuildingIcon, Loader2, Pencil, Trash2, AlertTriangle, FileText } from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientToModify, setClientToModify] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", document: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await http.get("/api/clients");
      setClients(res.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setClientToModify(null);
    setFormData({ name: "", email: "", phone: "", document: "", address: "" });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setIsEditMode(true);
    setClientToModify(client);
    setFormData({ 
      name: client.name, 
      email: client.email, 
      phone: client.phone, 
      document: client.document, 
      address: client.address 
    });
    setError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (client) => {
    setClientToModify(client);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("O nome do cliente é obrigatório.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      if (isEditMode) {
        await http.put(`/api/clients/${clientToModify.id}`, { id: clientToModify.id, ...formData });
      } else {
        await http.post("/api/clients", formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await http.delete(`/api/clients/${clientToModify.id}`);
      setIsDeleteOpen(false);
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">Clientes</h1>
          <p className="text-stone-500 mt-1">Gerencie a sua carteira de clientes e dados de contato.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all active:scale-95 gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center items-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            Nenhum cliente cadastrado.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {clients.map((c) => (
              <div key={c.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors group">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                    <UsersRound className="w-6 h-6 text-stone-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                        {c.name}
                        <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">ID: {c.id}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-500">
                      {c.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(c)}
                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Editar Cliente"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(c)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-800">
                    {isEditMode ? "Editar Cliente" : "Novo Cliente"}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                    Insira as informações de contato.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 block">Nome do Cliente / Empresa *</label>
                <div className="relative">
                  <BuildingIcon className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-stone-900"
                    placeholder="ex: Atelier da Noiva"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 block">Documento (CPF/CNPJ)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-stone-900"
                    placeholder="000.000.000-00"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700 block">Telefone</label>
                    <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium text-stone-900"
                        placeholder="(11) 9999-9999"
                        disabled={submitting}
                    />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700 block">Email</label>
                    <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium text-stone-900"
                        placeholder="contato@..."
                        disabled={submitting}
                    />
                    </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isEditMode ? "Salvar Alterações" : "Cadastrar Cliente"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Remover Cliente?</h2>
            <p className="text-sm text-stone-500 mb-6">
                Tem certeza que deseja remover <strong>{clientToModify?.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Sim, remover"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
