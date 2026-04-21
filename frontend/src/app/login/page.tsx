import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login | YPIS ERP",
  description: "Sign in to YPIS ERP System",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
