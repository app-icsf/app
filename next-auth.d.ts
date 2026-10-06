import "next-auth";
declare module "next-auth" {
  interface Session { user: { id: string; role: string; perms: string[]; name?: string | null; email?: string | null } }
}
