import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost/api_financas/logout.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if(data.status === "success") {
        sessionStorage.removeItem("user");
        navigate("/login");
      }else {
        console.error("Erro no logout:", data.message);
      }
    }catch(error) {
      console.error("Erro ao efetuar logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Finanças Pessoais</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                {user.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Rennan Alves. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Layout;