import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import campusBg from "@/assets/campus-bg.webp";
import accreditationLogo from "@/assets/uam_acreditacion25_vertical_COLOR.jpg";
import { isAllowedAutonomaEmail } from "@/lib/permissions-api";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Acceso · UAM Aliados" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const supabaseReady = hasSupabaseConfig();

  useEffect(() => {
    if (!supabaseReady) return;

    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email;
      if (!data.session) return;
      if (!isAllowedAutonomaEmail(email)) {
        await supabase.auth.signOut();
        toast.error("Solo se permite acceso con Google desde @autonoma.edu.co");
        return;
      }
      navigate({ to: "/alianzas/aliados", replace: true });
    });
  }, [navigate, supabaseReady]);

  const signInGoogle = async () => {
    if (!supabaseReady) {
      toast.error("Supabase no está conectado. Debes conectar la base de datos en Lovable para continuar.");
      return;
    }

    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("No fue posible iniciar sesión con Google");
      return;
    }
    if (result.redirected) return;

    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!isAllowedAutonomaEmail(email)) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("Solo se permite acceso con Google desde @autonoma.edu.co");
      navigate({ to: "/auth", replace: true });
      return;
    }

    navigate({ to: "/alianzas/aliados", replace: true });
  };

  if (!supabaseReady) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-slate-950 text-white">
        <Card className="max-w-lg border border-amber-500/40 bg-slate-900/90 p-6 text-center shadow-2xl">
          <div className="mb-4 inline-flex rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-amber-300">
            Configuración requerida
          </div>
          <h1 className="text-2xl font-bold text-white">La app no está conectada a Supabase</h1>
          <p className="mt-3 text-sm text-slate-300">
            Faltan las variables de entorno de la base de datos. Conéctala en Lovable o agrega
            VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY para restaurar el acceso.
          </p>
          <Button className="mt-5 w-full" onClick={() => window.location.reload()}>
            Recargar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen grid place-items-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 18, 41, 0.68), rgba(12, 18, 41, 0.68)), url(${campusBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl bg-white/90 p-3 shadow-2xl backdrop-blur-sm">
            <img
              src={accreditationLogo}
              alt="Logo UAM Acreditación"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-center text-white drop-shadow-sm">
            Gestión de Aliados UAM
          </h1>
          <p className="mt-1 text-center text-sm text-white/85 drop-shadow-sm">
            Universidad Autónoma de Manizales
          </p>
        </div>

        <Card className="border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Acceso reservado para usuarios con dominio @autonoma.edu.co
            </p>

            <Button variant="outline" className="w-full" onClick={signInGoogle} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando acceso...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continuar con Google
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
