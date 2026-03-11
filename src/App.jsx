import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { pagesConfig } from "./pages.config";
import PageNotFound from "./lib/PageNotFound";
import Login from "./pages/Login";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated && currentPageName !== "Login") {
    return <Navigate to="/Login" replace />;
  }

  // Se o usuário está autenticado mas está acessando o login, vai pro app principal
  if (isAuthenticated && currentPageName === "Login") {
    return <Navigate to="/" replace />;
  }

  if (currentPageName === "Login") {
    return <>{children}</>;
  }

  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/Login"
              element={
                <LayoutWrapper currentPageName="Login">
                  <Login />
                </LayoutWrapper>
              }
            />
            <Route
              path="/"
              element={
                <LayoutWrapper currentPageName={mainPageKey}>
                  <MainPage />
                </LayoutWrapper>
              }
            />
            {Object.entries(Pages).map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                }
              />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
