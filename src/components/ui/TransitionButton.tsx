import Link from "next/link";

function TransitionLinkButton({
  className,
  href,
  children,
}: {
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 transition-colors duration-300 text-nowrap ${className || ""}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function TransitionFormButton({
  className,
  action,
  children,
  useButtonWithoutForm = false,
}: {
  className?: string;
  action?: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  useButtonWithoutForm?: boolean;
}) {
  if (useButtonWithoutForm) {
    return (
      <button
        type="submit"
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 transition-colors duration-300 ${className || ""}`}
      >
        {children}
      </button>
    );
  }

  return (
    <form action={action}>
      <button
        type="submit"
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 transition-colors duration-300 ${className || ""}`}
      >
        {children}
      </button>
    </form>
  );
}

export { TransitionLinkButton, TransitionFormButton };
