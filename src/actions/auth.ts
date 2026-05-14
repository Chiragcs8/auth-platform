"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  loginService,
  registerService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
} from "@/services/auth";
import type { ApiResponse } from "@/types";

// ─── Login Action ─────────────────────────────────────────────

export async function loginAction(formData: unknown): Promise<ApiResponse<{ redirectUrl: string }> | null> {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
  const userAgent = headersList.get("user-agent") || undefined;

  const result = await loginService(formData, ipAddress, userAgent);

  if (result.success && result.data) {
    redirect(result.data.redirectUrl);
  }

  return result;
}

// ─── Register Action ──────────────────────────────────────────

export async function registerAction(formData: unknown): Promise<ApiResponse<{ redirectUrl: string }> | null> {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

  const result = await registerService(formData, ipAddress);

  if (result.success && result.data) {
    redirect(result.data.redirectUrl);
  }

  return result;
}

// ─── Logout Action ────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await logoutService();
  redirect("/login");
}

// ─── Forgot Password Action ───────────────────────────────────

export async function forgotPasswordAction(formData: unknown): Promise<ApiResponse<{ token: string }>> {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

  return await forgotPasswordService(formData, ipAddress);
}

// ─── Reset Password Action ────────────────────────────────────

export async function resetPasswordAction(formData: unknown): Promise<ApiResponse> {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

  return await resetPasswordService(formData, ipAddress);
}

// ─── Verify Email Action ──────────────────────────────────────

export async function verifyEmailAction(token: string): Promise<ApiResponse> {
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

  return await verifyEmailService(token, ipAddress);
}