import Link from "next/link";

function TransitionLinkButton({
  className,
  href,
  children,
  title,
}: {
  className?: string;
  href: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Link
      className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium text-nowrap transition-colors duration-300 ${className || ""}`}
      href={href}
      title={title}
      aria-label={title}
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
  title,
}: {
  className?: string;
  action?: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  useButtonWithoutForm?: boolean;
  title?: string;
}) {
  if (useButtonWithoutForm) {
    return (
      <button
        type="submit"
        title={title}
        aria-label={title}
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium transition-colors duration-300 ${className || ""}`}
      >
        {children}
      </button>
    );
  }

  return (
    <form action={action}>
      <button
        type="submit"
        className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium transition-colors duration-300 ${className || ""}`}
      >
        {children}
      </button>
    </form>
  );
}

export { TransitionLinkButton, TransitionFormButton };
