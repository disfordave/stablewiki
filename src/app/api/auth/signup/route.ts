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

import { prisma } from "@/lib/prisma";
// import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { WIKI_DISABLE_SIGNUP } from "@/config";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    username,
    password,
    passwordConfirm,
    consent,
    recoveryQuestionFirst,
    recoveryQuestionSecond,
    recoveryQuestionThird,
    recoveryAnswerFirst,
    recoveryAnswerSecond,
    recoveryAnswerThird,
  } = body;

  if (WIKI_DISABLE_SIGNUP) {
    return Response.json(
      { error: "User signup has been disabled." },
      { status: 403 },
    );
  }

  if (
    !username ||
    !password ||
    !passwordConfirm ||
    !consent ||
    !recoveryQuestionFirst ||
    !recoveryQuestionSecond ||
    !recoveryQuestionThird ||
    !recoveryAnswerFirst ||
    !recoveryAnswerSecond ||
    !recoveryAnswerThird
  ) {
    return Response.json(
      { error: "Username, password, and consent are required" },
      { status: 400 },
    );
  }

  if (password !== passwordConfirm) {
    return Response.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    return Response.json(
      {
        error:
          "Username must be 3-20 characters long and can only contain letters, numbers, and underscores",
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 },
    );
  }

  if (
    recoveryQuestionFirst === recoveryQuestionSecond ||
    recoveryQuestionFirst === recoveryQuestionThird ||
    recoveryQuestionSecond === recoveryQuestionThird
  ) {
    return Response.json(
      { error: "Recovery questions must be unique" },
      { status: 400 },
    );
  }

  if (
    recoveryQuestionFirst.trim().length < 9 ||
    recoveryQuestionSecond.trim().length < 9 ||
    recoveryQuestionThird.trim().length < 9
  ) {
    return Response.json(
      { error: "Recovery questions must be at least 9 characters long" },
      { status: 400 },
    );
  }

  if (
    recoveryAnswerFirst.trim().length < 3 ||
    recoveryAnswerSecond.trim().length < 3 ||
    recoveryAnswerThird.trim().length < 3
  ) {
    return Response.json(
      { error: "Recovery answers must be at least 3 characters long" },
      { status: 400 },
    );
  }

  if (!consent) {
    return Response.json(
      { error: "You must agree to the terms and conditions" },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return Response.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedRecoveryAnswerFirst = await bcrypt.hash(
      recoveryAnswerFirst,
      10,
    );
    const hashedRecoveryAnswerSecond = await bcrypt.hash(
      recoveryAnswerSecond,
      10,
    );
    const hashedRecoveryAnswerThird = await bcrypt.hash(
      recoveryAnswerThird,
      10,
    );

    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: "USER", // Default role
        recoveryQuestionFirst,
        recoveryQuestionSecond,
        recoveryQuestionThird,
        recoveryAnswerFirst: hashedRecoveryAnswerFirst,
        recoveryAnswerSecond: hashedRecoveryAnswerSecond,
        recoveryAnswerThird: hashedRecoveryAnswerThird,
      },
    });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    let token;

    const response = Response.json({
      message: "Signup successful! Welcome aboard!",
      user: {
        id: newUser.id,
        username: newUser.username,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        token,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to sign up user" }, { status: 500 });
  }
}
