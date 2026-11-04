"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { adminRequest } from "./api";
export default function AdminLogin({ configured }: { configured: boolean }) {
  const [username, setUsername] = useState("");
  const [setup, setSetup] = useState(false),
    [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <main id="main-content" className="admin-login">
      <Link href="/" className="classroom-wordmark">
        <span className="classroom-logo">
          <Code2 size={23} />
        </span>
        <span>
          Код<span>Лаб</span>
        </span>
      </Link>
      <section>
        <span className="admin-login-icon">
          <LockKeyhole size={25} />
        </span>
        <h1>
          Сурагч бүрийн ахицыг
          <br />
          нэг дороос.
        </h1>
        <p>Сурагчдын ажил, ахицыг хянаж, ангиар нь зохион байгуулаарай.</p>
        {configured ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              try {
                const result = await adminRequest<{ setupRequired?: boolean }>(
                  "/api/admin/session",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      username,
                      password,
                      ...(setup ? { newPassword } : {}),
                    }),
                  },
                );
                if (result.setupRequired) {
                  setSetup(true);
                  setBusy(false);
                  return;
                }
                setPassword("");
                window.location.reload();
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : "Холболтын алдаа",
                );
                setBusy(false);
              }
            }}
          >
            <label htmlFor="admin-username">
              Нэвтрэх нэр эсвэл сургуулийн имэйл
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setSetup(false);
                setNewPassword("");
                setError("");
              }}
              aria-invalid={!!error}
              aria-describedby="admin-login-error"
            />
            <label htmlFor="admin-password">Админ нууц үг</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={password}
              maxLength={1024}
              aria-invalid={!!error}
              aria-describedby="admin-login-error"
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
            />
            {setup && (
              <label>
                Шинэ нууц үг (12 буюу түүнээс олон тэмдэгт)
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  minLength={12}
                  maxLength={1024}
                  required
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
            )}
            <p id="admin-login-error" role="alert" className="admin-error">
              {error}
            </p>
            <button className="admin-primary" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={17} />
                  Нэвтэрч байна…
                </>
              ) : (
                <>
                  Нэвтрэх
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        ) : (
          <p className="admin-error">
            Админ нууц үг хараахан тохируулагдаагүй байна.
          </p>
        )}
        <p className="admin-login-note">
          <LockKeyhole size={13} />
          Зөвхөн багш, админд зориулсан хэсэг.
        </p>
      </section>
      <Link href="/" className="classroom-back">
        <ArrowLeft size={15} />
        Хичээл сонгох
      </Link>
    </main>
  );
}
