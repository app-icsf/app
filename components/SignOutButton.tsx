import { signOut } from "@/auth";

export default function SignOutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
      <button className="w-full h-11 rounded-lg bg-surface-container text-on-surface text-label-md">Cerrar sesión</button>
    </form>
  );
}
