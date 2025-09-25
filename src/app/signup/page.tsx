import LoginBox from "@/components/loginBox";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <LoginBox startInSignup />
    </main>
  );
}