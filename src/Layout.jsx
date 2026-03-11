import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Factory,
  ArrowLeftRight,
  Menu,
  X,
  Flame,
  Users,
  LogOut,
  UsersRound
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Itens", icon: Package, page: "Supplies" },
  { name: "Produtos", icon: Boxes, page: "Products" },
  { name: "Produção", icon: Factory, page: "Production" },
  { name: "Movimentações", icon: ArrowLeftRight, page: "Movements" },
  { name: "Clientes", icon: UsersRound, page: "Clients" },
  { name: "Usuários", icon: Users, page: "Users" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <span className="font-semibold text-stone-800">Velas</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav className={`
        lg:hidden fixed top-16 left-0 right-0 bg-white z-40 border-b border-stone-200
        transform transition-transform duration-200
        ${mobileMenuOpen ? "translate-y-0" : "-translate-y-full"}
      `}>
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-600 hover:bg-stone-100"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-2 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200 flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-stone-100">
          <div className="p-2 rounded-lg bg-amber-100">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="font-semibold text-stone-800">Controle de Velas</span>
            <p className="text-xs text-stone-400">Gestão de Estoque</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "text-stone-600 hover:bg-stone-100"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-amber-600" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-xl transition-all text-red-600 hover:bg-red-50 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
          <p className="text-xs text-stone-400 text-center mt-2">
            Controle de Estoque v1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}