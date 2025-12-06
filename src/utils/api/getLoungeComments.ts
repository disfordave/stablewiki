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

export async function fetchComments({
  pageId,
  commentId,
  hPage,
  sortBy,
}: {
  pageId: string;
  commentId: string;
  hPage: number;
  sortBy: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/${pageId}/${commentId}?hPage=${hPage}&sortBy=${sortBy}`,
  );
  if (!response.ok) {
    return null;
  }
  return await response.json();
}

export async function fetchSingleComment({
  pageId,
  commentId,
}: {
  pageId: string;
  commentId: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/lounge/${pageId}/single/${commentId}`,
  );
  if (!response.ok) {
    return null;
  }
  return await response.json();
}
