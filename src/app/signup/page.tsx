// import { redirect } from "next/navigation";

export default function SignupPage() {
    // async function handleSignup(formData: FormData) {
    //     "use server"
    //     const username = formData.get("username")?.toString() || "";
    //     const password = formData.get("password")?.toString() || "";

    //     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ username, password }),
    //     });

    //     if (res.ok) {
    //         // Redirect to signin page with success message
    //         redirect(`/`);
    //     } else {
    //         const data = await res.json();
    //         redirect(`/signup?error=${encodeURIComponent(data.error || "An unexpected error occurred")}`);
    //     }
    // }
    return (
        <div>
        <h1>Sign Up</h1>
        <p>This is a demo project, therefore user creation is disabled.</p>
        </div>
    )
}