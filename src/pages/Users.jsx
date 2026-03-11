import { useState, useEffect } from "react";
import { http } from "../api/http";
import { User, Plus, X, ShieldCheck, KeyRound, Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToModify, setUserToModify] = useState(null);
  
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await http.get("/api/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setUserToModify(null);
    setFormData({ username: "", password: "" });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setUserToModify(user);
    setFormData({ username: user.username, password: "" }); // Password empty unless they want to change it
    setError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToModify(user);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setError("O nome de usuário é obrigatório.");
      return;
    }
    if (!isEditMode && !formData.password) {
      setError("A senha é obrigatória para novos usuários.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      if (isEditMode) {
        await http.put(`/api/auth/${userToModify.id}`, formData);
      } else {
        await http.post("/api/auth/register", formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setError("Este nome de usuário já existe.");
      } else {
        setError("Erro ao salvar usuário.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await http.delete(`/api/auth/${userToModify.id}`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-800">Usuários</h1>
          <p className="text-stone-500 mt-1">Gerencie quem tem acesso ao sistema de controle.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all active:scale-95 gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center items-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-stone-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                        {u.username}
                        <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">ID: {u.id}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Acesso Autorizado</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(u)}
                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Editar Usuário"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(u)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover Usuário"
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
                    {isEditMode ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                    {isEditMode ? "Modifique as credenciais de acesso." : "Crie uma nova credencial de acesso."}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 block">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-stone-900"
                    placeholder="ex: joao.silva"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 block">
                    {isEditMode ? "Nova Senha (deixe em branco para manter)" : "Senha Temporária"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-stone-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-stone-900"
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isEditMode ? "Salvar Alterações" : "Cadastrar Usuário"
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
            <h2 className="text-xl font-bold text-stone-800 mb-2">Remover Usuário?</h2>
            <p className="text-sm text-stone-500 mb-6">
                Tem certeza que deseja remover o acesso de <strong>{userToModify?.username}</strong>? Esta ação não pode ser desfeita.
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
