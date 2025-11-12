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

// Use environment variables to configure the wiki, do not hardcode values here since they may change per deployment

const WIKI_NAME = process.env.WIKI_NAME || "StableWiki Engine";
const WIKI_HOMEPAGE_LINK =
  "/wiki/" + process.env.WIKI_HOMEPAGE_LINK || "WelcomePage";
const WIKI_DESCRIPTION =
  process.env.WIKI_DESCRIPTION ||
  "StableWiki Engine is a modern, user-friendly wiki platform built with Next.js and TypeScript.";
const WIKI_COPYRIGHT_HOLDER =
  process.env.WIKI_COPYRIGHT_HOLDER || "StableWiki Engine Project";
const WIKI_COPYRIGHT_HOLDER_URL =
  process.env.WIKI_COPYRIGHT_HOLDER_URL ||
  "https://github.com/disfordave/stablewiki";
const WIKI_DISABLE_MEDIA = process.env.WIKI_DISABLE_MEDIA === "true";
const WIKI_DISABLE_SIGNUP = process.env.WIKI_DISABLE_SIGNUP === "true";
const WIKI_LICENSE_NAME = process.env.WIKI_LICENSE_NAME || "CC BY-SA 4.0";
const WIKI_LICENSE_URL =
  process.env.WIKI_LICENSE_URL ||
  "https://creativecommons.org/licenses/by-sa/4.0/";

export {
  WIKI_NAME,
  WIKI_HOMEPAGE_LINK,
  WIKI_DESCRIPTION,
  WIKI_COPYRIGHT_HOLDER,
  WIKI_COPYRIGHT_HOLDER_URL,
  WIKI_DISABLE_MEDIA,
  WIKI_DISABLE_SIGNUP,
  WIKI_LICENSE_NAME,
  WIKI_LICENSE_URL,
};
