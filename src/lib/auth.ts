import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuthSession, RoleName } from "@/types";

const SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret-key-change-in-production");
const ACCESS_TOKEN_EXPIRY = "7d";
const ACCESS_TOKEN_EXPIRY_EXTENDED = "30d"; // "Remember Me" extended expiry
const REFRESH_TOKEN_EXPIRY = "30d";
const REFRESH_TOKEN_EXPIRY_EXTENDED = "90d"; // "Remember Me" extended refresh expiry

// ─── Token Creation ───────────────────────────────────────────

export async function createAccessToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

// ─── Token Verification ───────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.type !== "refresh") return null;
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// ─── Session Management ───────────────────────────────────────

export async function createSession(
  userId: string,
  roleName: RoleName,
  roleId: string,
  email: string,
  fullName: string,
  isVerified: boolean,
  isActive: boolean,
  ipAddress?: string,
  userAgent?: string,
  rememberMe?: boolean
): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionPayload: AuthSession = {
    sessionId: "",
    userId,
    email,
    fullName,
    roleName,
    roleId,
    isVerified,
    isActive,
  };

  // Use extended expiry when "Remember Me" is checked
  const accessTokenExpiry = rememberMe ? ACCESS_TOKEN_EXPIRY_EXTENDED : ACCESS_TOKEN_EXPIRY;
  const refreshTokenExpiry = rememberMe ? REFRESH_TOKEN_EXPIRY_EXTENDED : REFRESH_TOKEN_EXPIRY;

  const accessToken = await new SignJWT({ ...sessionPayload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiry)
    .sign(SECRET_KEY);

  const refreshToken = await new SignJWT({ userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiry)
    .sign(SECRET_KEY);

  // Session DB expiry matches access token expiry
  const sessionExpiryMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionExpiryMs);

  const session = await prisma.session.create({
    data: {
      userId,
      accessToken,
      refreshToken,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  // Update session payload with actual session ID and re-sign
  sessionPayload.sessionId = session.id;
  const finalAccessToken = await createAccessToken(sessionPayload);

  // Update the session with the final access token
  await prisma.session.update({
    where: { id: session.id },
    data: { accessToken: finalAccessToken },
  });

  // Update user last login
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });

  // Set cookies
  const cookieStore = await cookies();
  cookieStore.set("access_token", finalAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  const refreshCookieExpiryMs = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + refreshCookieExpiryMs),
    path: "/",
  });

  return { accessToken: finalAccessToken, refreshToken };
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  // Verify session still exists in database
  const session = await prisma.session.findFirst({
    where: {
      id: payload.sessionId,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) return null;

  // Verify user is still active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  });

  if (!user || !user.isActive) return null;

  return {
    sessionId: payload.sessionId,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    roleName: user.role.roleName as RoleName,
    roleId: user.roleId,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.sessionId) {
      await prisma.session.deleteMany({
        where: { id: payload.sessionId },
      });
    }
  }

  // Also delete all expired sessions for cleanup
  if (refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload?.userId) {
      await prisma.session.deleteMany({
        where: {
          userId: refreshPayload.userId,
          expiresAt: { lt: new Date() },
        },
      });
    }
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function refreshSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return null;

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload) {
    cookieStore.delete("refresh_token");
    cookieStore.delete("access_token");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: refreshPayload.userId },
    include: { role: true, profile: true },
  });

  if (!user || !user.isActive) {
    cookieStore.delete("refresh_token");
    cookieStore.delete("access_token");
    return null;
  }

  // Delete old session
  const oldAccessToken = cookieStore.get("access_token")?.value;
  if (oldAccessToken) {
    const oldPayload = await verifyAccessToken(oldAccessToken);
    if (oldPayload?.sessionId) {
      await prisma.session.delete({
        where: { id: oldPayload.sessionId },
      }).catch(() => {}); // Ignore if already deleted
    }
  }

  // Create new session
  await createSession(
    user.id,
    user.role.roleName as RoleName,
    user.roleId,
    user.email,
    user.fullName,
    user.isVerified,
    user.isActive
  );

  return getSession();
}