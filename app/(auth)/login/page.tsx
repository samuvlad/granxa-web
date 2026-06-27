"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Sprout } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useLogin } from "@/lib/queries";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const token = await login.mutateAsync({ username, password });
      setToken(token.access_token);
      router.push(nextPath);
    } catch (err) {
      setError(getApiErrorMessage(err, "Non foi posible iniciar sesión"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-1.5">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={login.isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contrasinal</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={login.isPending}
        />
      </div>

      {error ? (
        <Alert variant="destructive" title="Erro de acceso">
          <p>{error}</p>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={login.isPending || !username || !password}
      >
        <LogIn className="size-4" />
        {login.isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Sprout className="size-6" />
        </div>
        <h1 className="text-xl font-semibold">Granxa Maps</h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-sm text-muted-foreground text-center">
        Cargando…
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Sprout className="size-6" />
        </div>
        <h1 className="text-xl font-semibold">Granxa Maps</h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
      </div>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
