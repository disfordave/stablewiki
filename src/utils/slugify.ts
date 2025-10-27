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

function slugify(text: string): string {
  return text.toString().trim().replace(/\s+/g, "_"); // Replace spaces with _
  // .replace(/[^\w\-]+/g, "") // Remove all non-word chars
  // .replace(/\_\_+/g, "_") // Replace multiple _ with single _
  // .replace(/^_+/, "") // Trim _ from start of text
  // .replace(/_+$/, ""); // Trim _ from end of text
}

export { slugify };
