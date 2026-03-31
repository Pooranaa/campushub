require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../config/db");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createAccountIfMissing = async ({ name, email, passwordHash, role, department_id = null, club_id = null }) => {
  const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);

  if (existing.length) {
    return { email, created: false };
  }

  await db.execute(
    `INSERT INTO users (name, email, password, role, department_id, club_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, department_id, club_id]
  );

  return { email, created: true };
};

const seedCoordinatorAccounts = async () => {
  const defaultPassword = process.env.DEFAULT_COORDINATOR_PASSWORD || "CampusHub@123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const [departments] = await db.execute("SELECT id, name FROM departments ORDER BY name ASC");
  const [clubs] = await db.execute("SELECT id, name FROM clubs ORDER BY name ASC");

  const results = [];

  for (const department of departments) {
    results.push(
      await createAccountIfMissing({
        name: `${department.name} Department Coordinator`,
        email: `${slugify(department.name)}.dept@campushub.local`,
        passwordHash,
        role: "department_coordinator",
        department_id: department.id
      })
    );
  }

  for (const club of clubs) {
    results.push(
      await createAccountIfMissing({
        name: `${club.name} Club Coordinator`,
        email: `${slugify(club.name)}.club@campushub.local`,
        passwordHash,
        role: "club_coordinator",
        club_id: club.id
      })
    );
  }

  console.log("Coordinator account seeding complete.");
  console.log(`Default password: ${defaultPassword}`);

  results.forEach((result) => {
    console.log(`${result.created ? "Created" : "Skipped"}: ${result.email}`);
  });

  await db.end();
};

seedCoordinatorAccounts().catch(async (error) => {
  console.error("Could not seed coordinator accounts.", error);
  await db.end();
  process.exit(1);
});
