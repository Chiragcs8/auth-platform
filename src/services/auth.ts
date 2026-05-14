import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, verifyAccessToken } from "@/lib/auth";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { ROLE_DASHBOARD_MAP, PASSWORD_RESET_EXPIRY_MS } from "@/config/constants";
import type { RoleName, ApiResponse } from "@/types";

// ─── Login Service ────────────────────────────────────────────

export async function loginService(
  formData: unknown,
  ipAddress?: string,
  userAgent?: string
): Promise<ApiResponse<{ redirectUrl: string }>> {
  const validated = loginSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { email, password, rememberMe } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  if (!user.isActive) {
    return { success: false, error: "Your account has been deactivated" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Log failed login attempt
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_FAILED",
        module: "auth",
        ipAddress,
      },
    });
    return { success: false, error: "Invalid email or password" };
  }

  // Create session (extend expiry if "Remember Me" is checked)
  await createSession(
    user.id,
    user.role.roleName as RoleName,
    user.roleId,
    user.email,
    user.fullName,
    user.isVerified,
    user.isActive,
    ipAddress,
    userAgent,
    rememberMe
  );

  // Log successful login
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "LOGIN_SUCCESS",
      module: "auth",
      ipAddress,
    },
  });

  const redirectUrl = ROLE_DASHBOARD_MAP[user.role.roleName as RoleName] || "/client/dashboard";

  return { success: true, data: { redirectUrl } };
}

// ─── Register Service ─────────────────────────────────────────

export async function registerService(
  formData: unknown,
  ipAddress?: string
): Promise<ApiResponse<{ redirectUrl: string }>> {
  const validated = registerSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { fullName, email, password, roleName } = validated.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Find role
  const role = await prisma.role.findUnique({
    where: { roleName },
  });

  if (!role) {
    return { success: false, error: "Invalid role selected" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user with profile (nested create)
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      roleId: role.id,
      isVerified: false,
      isActive: true,
      profile: {
        create: {},
      },
    },
  });

  // Log registration
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "REGISTER",
      module: "auth",
      ipAddress,
    },
  });

  // Create session (auto-login after registration)
  await createSession(
    user.id,
    role.roleName as RoleName,
    role.id,
    user.email,
    user.fullName,
    user.isVerified,
    user.isActive,
    ipAddress
  );

  const redirectUrl = ROLE_DASHBOARD_MAP[roleName] || "/client/dashboard";

  return { success: true, data: { redirectUrl } };
}

// ─── Logout Service ───────────────────────────────────────────

export async function logoutService(): Promise<ApiResponse> {
  await deleteSession();
  return { success: true, message: "Logged out successfully" };
}

// ─── Forgot Password Service ──────────────────────────────────
// JWT-based password recovery: verifies current password, then generates
// a reset token and returns it directly (no email dependency).

export async function forgotPasswordService(
  formData: unknown,
  ipAddress?: string
): Promise<ApiResponse<{ token: string }>> {
  const validated = forgotPasswordSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { email, currentPassword } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "No account found with this email address" };
  }

  if (!user.isActive) {
    return { success: false, error: "Your account has been deactivated" };
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Delete any existing reset tokens for this user
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id },
  });

  // Generate reset token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Log password reset request
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      module: "auth",
      ipAddress,
    },
  });

  return {
    success: true,
    message: "Current password verified. You can now reset your password.",
    data: { token },
  };
}

// ─── Reset Password Service ───────────────────────────────────

export async function resetPasswordService(
  formData: unknown,
  ipAddress?: string
): Promise<ApiResponse> {
  const validated = resetPasswordSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { token, password } = validated.data;

  // Find valid reset token
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!resetRecord) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  if (resetRecord.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordReset.delete({ where: { token } });
    return { success: false, error: "Reset token has expired" };
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);

  // Update user password
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash },
  });

  // Delete all sessions for this user (force re-login)
  await prisma.session.deleteMany({
    where: { userId: resetRecord.userId },
  });

  // Delete the reset token
  await prisma.passwordReset.delete({ where: { token } });

  // Log password reset
  await prisma.activityLog.create({
    data: {
      userId: resetRecord.userId,
      action: "PASSWORD_RESET_COMPLETED",
      module: "auth",
      ipAddress,
    },
  });

  return { success: true, message: "Password has been reset successfully" };
}

// ─── Email Verification Service ───────────────────────────────

export async function verifyEmailService(
  token: string,
  ipAddress?: string
): Promise<ApiResponse> {
  // For now, we use a simple token-based verification
  // In production, this would send an email with a verification link
  const accessToken = token;
  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    return { success: false, error: "Invalid verification token" };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.isVerified) {
    return { success: false, error: "Email is already verified" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  // Log email verification
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "EMAIL_VERIFIED",
      module: "auth",
      ipAddress,
    },
  });

  return { success: true, message: "Email verified successfully" };
}