import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 p-8">
      <h1 className="text-2xl font-bold text-stone-800">Página não encontrada</h1>
      <p className="text-stone-500">O caminho que você tentou acessar não existe.</p>
      <Link to="/" className="text-amber-700 underline">
        Voltar para o início
      </Link>
    </div>
  );
}
