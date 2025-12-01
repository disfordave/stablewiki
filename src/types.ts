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

import { Role } from "@prisma/client";

export interface Page {
  id: string;
  title: string;
  content: string;
  slug: string[];
  author?: {
    id: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
  }[];
  isRedirect?: boolean;
  redirectTargetSlug?: string;
  comments?: Comment[];
  accessLevel: number;
  backlinks: {
    general: SimplePageData[];
    user: SimplePageData[];
    redirects: SimplePageData[];
    media: SimplePageData[];
    categories: SimplePageData[];
  };
}

interface SimplePageData {
  title: string;
  slug: string;
  isRedirect: boolean;
}

export interface PageRevisionData {
  totalPages: number;
  revisions: Revision[];
}

export interface Revision {
  id: string;
  version: number;
  title: string;
  content: string;
  createdAt: string;
  author?: { id: string; username: string };
  summary: string;
  page?: {
    title: string;
  };
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  role: Role;
  token: string;
  createdAt: Date;
  status: number;
}

export interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string;
  role: Role;
  createdAt: Date;
  status: number;
}

export interface Comment {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author?: {
    id: string;
    username: string;
  };
}
