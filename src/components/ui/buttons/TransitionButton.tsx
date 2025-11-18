/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
      className={`flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium text-nowrap transition-colors duration-300 ${className || ""}`}
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
  disabled,
}: {
  className?: string;
  action?: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  useButtonWithoutForm?: boolean;
  title?: string;
  disabled?: boolean;
}) {
  if (useButtonWithoutForm) {
    return (
      <button
        type="submit"
        title={title}
        aria-label={title}
        className={`flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium transition-colors duration-300 ${className || ""}`}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <form action={action}>
      <button
        type="submit"
        className={`flex w-fit cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 font-medium transition-colors duration-300 ${className || ""}`}
        title={title}
        aria-label={title}
        disabled={disabled}
      >
        {children}
      </button>
    </form>
  );
}

export { TransitionLinkButton, TransitionFormButton };
