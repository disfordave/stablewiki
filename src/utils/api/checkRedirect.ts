/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

export function checkRedirect(
  content: string,
  slug: string,
): {
  isRedirect: boolean;
  isLoop: boolean;
  targetSlug: string | null;
} {
  const match = content.match(/^#REDIRECT\s+\[\[([^\]]+)\]\]/im);
  if (match) {
    const targetSlug = match[1].trim();
    if (targetSlug === slug) {
      return { isLoop: true, targetSlug: null, isRedirect: false };
    }
    return { isLoop: false, targetSlug, isRedirect: true };
  }
  return { isLoop: false, targetSlug: null, isRedirect: false };
}
