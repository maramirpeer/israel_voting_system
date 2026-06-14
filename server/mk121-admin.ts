import type { Express, Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import {
  approvePreliminaryProposalForAdmin,
  deletePreliminaryProposalForAdmin,
  getPreliminaryProposalsForAdmin,
} from "./mk121";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidAdminToken(req: Request) {
  const expected = process.env.ADMIN_SIGNUPS_TOKEN;
  const provided = normalize(req.header("x-admin-token") || req.header("authorization")?.replace(/^Bearer\s+/i, ""));

  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

export function registerMK121AdminRoutes(app: Express) {
  app.get("/api/admin/mk121/preliminary-proposals", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const proposals = await getPreliminaryProposalsForAdmin();
    res.json({ ok: true, ...proposals });
  });

  app.post("/api/admin/mk121/preliminary-proposals/:type/:id/approve", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const type = req.params.type === "question" ? "question" : req.params.type === "bill" ? "bill" : null;
    const id = Number(req.params.id);

    if (!type || !Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid preliminary proposal." });
      return;
    }

    const approved = await approvePreliminaryProposalForAdmin(type, id);

    if (!approved) {
      res.status(404).json({ error: "Preliminary proposal was not found or could not be approved." });
      return;
    }

    res.json({ ok: true, type, id, supporters: 1000, status: "published" });
  });

  app.delete("/api/admin/mk121/preliminary-proposals/:type/:id", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const type = req.params.type === "question" ? "question" : req.params.type === "bill" ? "bill" : null;
    const id = Number(req.params.id);

    if (!type || !Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid preliminary proposal." });
      return;
    }

    const deleted = await deletePreliminaryProposalForAdmin(type, id);

    if (!deleted) {
      res.status(404).json({ error: "Preliminary proposal was not found or could not be deleted." });
      return;
    }

    res.json({ ok: true, type, id, deleted: true });
  });
}
