import AdminShell from "../../components/admin/AdminShell";

// Todas as telas do painel exigem sessão; /admin/login fica fora deste grupo.
export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
