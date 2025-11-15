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

import { getThemeColor } from "@/utils";
import { MarkdownComp } from "../ui/MarkdownComp";
import { TransitionLinkButton } from "../ui/buttons/TransitionButton";
import {
  ArrowPathIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";

function MdPageButtons({
  decodedSlug,
  oldVersion,
  isRedirect,
}: {
  decodedSlug: string;
  oldVersion?: boolean;
  isRedirect?: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {oldVersion ? (
          <TransitionLinkButton
            href={`/wiki/${decodedSlug}${isRedirect ? "?preventRedirect=true" : ""}`}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <ArrowPathIcon className="inline size-5" />
            Latest Page
          </TransitionLinkButton>
        ) : (
          <>
            <TransitionLinkButton
              href={`/wiki/${decodedSlug}/_lounge`}
              className={`${getThemeColor().bg.base} ${getThemeColor().bg.hover} text-white`}
            >
              <ChatBubbleBottomCenterTextIcon className="inline size-5" />
              Lounge
            </TransitionLinkButton>
            <TransitionLinkButton
              href={`/wiki/${decodedSlug}?action=edit`}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <PencilSquareIcon className="inline size-5" />
              Edit Page
            </TransitionLinkButton>
          </>
        )}
        <TransitionLinkButton
          href={`/wiki/${decodedSlug}?action=history`}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          <DocumentTextIcon className="inline size-5" />
          History
        </TransitionLinkButton>
        <div className="flex-1"></div>
      </div>
    </>
  );
}

export default function StableMarkdown({
  content,
  oldVersion = false,
  slug = "",
  isRedirect = false,
}: {
  content: string;
  oldVersion?: boolean;
  slug: string;
  isRedirect?: boolean;
}) {
  const decodedSlug = decodeURIComponent(slug);
  return (
    <div className="flex h-full flex-col">
      <MarkdownComp content={content} />
      <div className="flex-1"></div>
      <MdPageButtons
        decodedSlug={decodedSlug}
        oldVersion={oldVersion}
        isRedirect={isRedirect}
      />
    </div>
  );
}
