import { describe, expect, it } from "vitest";
import { passwordMatches, SESSION_MS, signSession, verifySession } from "@/server/auth/token";

const secret = "s".repeat(48);

describe("desk session tokens", () => {
  it("accepts a fresh token signed with the right secret", () => {
    expect(verifySession(signSession(secret, 1000), secret, 2000)).toBe(true);
  });

  it("rejects expired, tampered or foreign tokens", () => {
    const t = signSession(secret, 1000);
    expect(verifySession(t, secret, 1000 + SESSION_MS + 1)).toBe(false);
    const [exp, sig] = t.split(".");
    expect(verifySession(`${Number(exp) + 999999}.${sig}`, secret, 2000)).toBe(false);
    expect(verifySession(t, "x".repeat(48), 2000)).toBe(false);
    expect(verifySession(undefined, secret)).toBe(false);
    expect(verifySession("garbage", secret)).toBe(false);
  });

  it("compares passwords exactly", () => {
    expect(passwordMatches("correct horse battery", "correct horse battery")).toBe(true);
    expect(passwordMatches("correct horse batter", "correct horse battery")).toBe(false);
    expect(passwordMatches("anything", "")).toBe(false);
  });
});
