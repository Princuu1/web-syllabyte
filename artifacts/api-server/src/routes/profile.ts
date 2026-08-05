import { Router } from "express";
import { z } from "zod";
import { getSupabasePool } from "../lib/supabaseDb.js";

const router = Router();

// Local validation schemas.
// These are kept inside the API server so Vercel does not need to load
// TypeScript source files from the @workspace/api-zod workspace package.

const GetProfileParams = z.object({
rollNo: z.string().min(1),
});

const UpdateProfilePhotoParams = z.object({
rollNo: z.string().min(1),
});

const UpdateProfilePhotoBody = z.object({
photo_url: z.string().url(),
});

const LinkEmailToProfileParams = z.object({
rollNo: z.string().min(1),
});

const LinkEmailToProfileBody = z.object({
email: z.string().email(),
});

const GetProfileByEmailQueryParams = z.object({
email: z.string().email(),
});

// Supabase table
const TABLE_NAME = "students";

// Supabase column names
const COLUMN_STUDENT_NAME = "Student Name";
const COLUMN_GENDER = "Gender";
const COLUMN_DOB = "Date Of Birth";
const COLUMN_COLLEGE = "College Name";
const COLUMN_COURSE = "Course Name";
const COLUMN_SEM = "Sem";
const COLUMN_PHOTO_URL = "Photo Url";
const COLUMN_ROLL_NO = "Class Roll No";
const COLUMN_LINKED_EMAIL = "linked_email";

function mapRow(row: Record<string, unknown>) {
return {
class_roll_no: row[COLUMN_ROLL_NO] ?? row["class_roll_no"] ?? "",
student_name: row[COLUMN_STUDENT_NAME] ?? row["student_name"] ?? null,
gender: row[COLUMN_GENDER] ?? row["gender"] ?? null,
date_of_birth: row[COLUMN_DOB] ?? row["date_of_birth"] ?? null,
college_name: row[COLUMN_COLLEGE] ?? row["college_name"] ?? null,
course_name: row[COLUMN_COURSE] ?? row["course_name"] ?? null,
sem: row[COLUMN_SEM] ?? row["sem"] ?? null,
photo_url: row[COLUMN_PHOTO_URL] ?? row["photo_url"] ?? null,
linked_email: row[COLUMN_LINKED_EMAIL] ?? null,
};
}

// GET /profile/by-email?email=xxx
router.get("/by-email", async (req, res) => {
const parsed = GetProfileByEmailQueryParams.safeParse(req.query);

if (!parsed.success) {
res.status(400).json({
error: "Missing or invalid email query param",
});
return;
}

const { email } = parsed.data;
const pool = getSupabasePool();

try {
const result = await pool.query(
`SELECT * FROM "${TABLE_NAME}" WHERE "${COLUMN_LINKED_EMAIL}" = $1 LIMIT 1`,
[email],
);


if (result.rows.length === 0) {
  res.status(404).json({
    error: "No profile linked to this email",
  });
  return;
}

res.json(mapRow(result.rows[0]));


} catch (err) {
req.log.error({ err }, "Failed to fetch profile by email");


res.status(500).json({
  error: "Failed to fetch profile by email",
});


}
});

// GET /profile/:rollNo
router.get("/:rollNo", async (req, res) => {
const parsed = GetProfileParams.safeParse(req.params);

if (!parsed.success) {
res.status(400).json({
error: "Invalid roll number",
});
return;
}

const { rollNo } = parsed.data;
const pool = getSupabasePool();

try {
const result = await pool.query(
`SELECT * FROM "${TABLE_NAME}" WHERE "${COLUMN_ROLL_NO}" = $1 LIMIT 1`,
[rollNo],
);


if (result.rows.length === 0) {
  res.status(404).json({
    error: "Profile not found for this roll number",
  });
  return;
}

res.json(mapRow(result.rows[0]));


} catch (err) {
req.log.error({ err }, "Failed to fetch profile");


res.status(500).json({
  error: "Failed to fetch profile",
});


}
});

// PATCH /profile/:rollNo/link-email
router.patch("/:rollNo/link-email", async (req, res) => {
const paramsParsed = LinkEmailToProfileParams.safeParse(req.params);
const bodyParsed = LinkEmailToProfileBody.safeParse(req.body);

if (!paramsParsed.success || !bodyParsed.success) {
res.status(400).json({
error: "Invalid request",
});
return;
}

const { rollNo } = paramsParsed.data;
const { email } = bodyParsed.data;

const pool = getSupabasePool();

try {
const result = await pool.query(
`UPDATE "${TABLE_NAME}"
       SET "${COLUMN_LINKED_EMAIL}" = $1
       WHERE "${COLUMN_ROLL_NO}" = $2
       RETURNING *`,
[email, rollNo],
);


if (result.rows.length === 0) {
  res.status(404).json({
    error: "Profile not found for this roll number",
  });
  return;
}

res.json(mapRow(result.rows[0]));


} catch (err) {
req.log.error({ err }, "Failed to link email to profile");


res.status(500).json({
  error: "Failed to link email to profile",
});


}
});

// PATCH /profile/:rollNo/photo
router.patch("/:rollNo/photo", async (req, res) => {
const paramsParsed = UpdateProfilePhotoParams.safeParse(req.params);
const bodyParsed = UpdateProfilePhotoBody.safeParse(req.body);

if (!paramsParsed.success || !bodyParsed.success) {
res.status(400).json({
error: "Invalid request",
});
return;
}

const { rollNo } = paramsParsed.data;
const { photo_url } = bodyParsed.data;

const pool = getSupabasePool();

try {
const result = await pool.query(
`UPDATE "${TABLE_NAME}"
       SET "${COLUMN_PHOTO_URL}" = $1
       WHERE "${COLUMN_ROLL_NO}" = $2
       RETURNING *`,
[photo_url, rollNo],
);


if (result.rows.length === 0) {
  res.status(404).json({
    error: "Profile not found for this roll number",
  });
  return;
}

res.json(mapRow(result.rows[0]));


} catch (err) {
req.log.error({ err }, "Failed to update profile photo");


res.status(500).json({
  error: "Failed to update profile photo",
});


}
});

export default router;
