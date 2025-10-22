import { redirect } from "next/navigation";

export default function SignupPage() {
  async function handleSignup(formData: FormData) {
    "use server";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    if (res.ok) {
      // Redirect to signin page with success message
      redirect(`/`);
    } else {
      const data = await res.json();
      redirect(
        `/signup?error=${encodeURIComponent(
          data.error || "An unexpected error occurred"
        )}`
      );
    }
  }
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Sign Up</h1>
      <form action={handleSignup} className="flex flex-col gap-4 mt-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
