import pg from 'pg';
import bcrypt from 'bcrypt';

const products = [
  {
    name: 'Enamel Camp Mug',
    description: 'Steel mug with a chip-resistant enamel coat. Holds 350 ml.',
    category: 'kitchen',
    price_cents: 1800,
    compare_at_price_cents: null,
    stock: 40,
    is_new: false,
  },
  {
    name: 'Cast Iron Skillet, 26 cm',
    description: 'Pre-seasoned, heavy-bottomed, and good for a lifetime of eggs.',
    category: 'kitchen',
    price_cents: 5400,
    compare_at_price_cents: 6800,
    stock: 12,
    is_new: false,
  },
  {
    name: 'Beechwood Spoon Set',
    description: 'Three spoons in oiled beech: stirring, slotted, and tasting.',
    category: 'kitchen',
    price_cents: 2200,
    compare_at_price_cents: null,
    stock: 3,
    is_new: true,
  },
  {
    name: 'Stoneware Mixing Bowl',
    description: 'Glazed stoneware bowl, 3 litres, with a pouring lip.',
    category: 'kitchen',
    price_cents: 3900,
    compare_at_price_cents: null,
    stock: 0,
    is_new: false,
  },
  {
    name: 'Waxed Canvas Tote',
    description: 'Heavy waxed cotton with leather handles. Gets better with wear.',
    category: 'carry',
    price_cents: 6500,
    compare_at_price_cents: null,
    stock: 18,
    is_new: true,
  },
  {
    name: 'Leather Key Fob',
    description: 'Vegetable-tanned leather loop with a solid brass ring.',
    category: 'carry',
    price_cents: 1200,
    compare_at_price_cents: 1600,
    stock: 55,
    is_new: false,
  },
  {
    name: 'Wool Blanket',
    description: 'Woven from undyed wool, 130 × 180 cm. Warm without being heavy.',
    category: 'home',
    price_cents: 11800,
    compare_at_price_cents: null,
    stock: 7,
    is_new: false,
  },
  {
    name: 'Linen Tea Towels (Set of 2)',
    description: 'Stonewashed linen that dries fast and softens with every wash.',
    category: 'home',
    price_cents: 2400,
    compare_at_price_cents: 3000,
    stock: 30,
    is_new: false,
  },
  {
    name: 'Brass Desk Lamp',
    description: 'Solid brass lamp with an adjustable arm and a cloth cord.',
    category: 'home',
    price_cents: 14500,
    compare_at_price_cents: null,
    stock: 1,
    is_new: true,
  },
  {
    name: 'Carpenter Pencils (Pack of 6)',
    description: 'Flat graphite pencils that will not roll off the bench.',
    category: 'workshop',
    price_cents: 800,
    compare_at_price_cents: null,
    stock: 120,
    is_new: false,
  },
  {
    name: 'Steel Tape Measure, 5 m',
    description: 'Metal case, belt clip, and a hook that stays put.',
    category: 'workshop',
    price_cents: 1900,
    compare_at_price_cents: null,
    stock: 25,
    is_new: false,
  },
  {
    name: 'Ash Handle Hammer',
    description: 'Forged steel head on a hand-shaped ash handle. 450 g.',
    category: 'workshop',
    price_cents: 4200,
    compare_at_price_cents: 4900,
    stock: 9,
    is_new: true,
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment (see .env.example)`);
  }
  return value;
}

async function seed() {
  const client = new pg.Client({ connectionString: requireEnv('DATABASE_URL') });
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');

  await client.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, passwordHash],
    );
    console.log(admin.rowCount ? `Created admin ${adminEmail}` : `Admin ${adminEmail} exists`);

    const { rows } = await client.query<{ count: string }>('SELECT count(*) FROM products');
    if (Number(rows[0]?.count) > 0) {
      console.log('Products table is not empty, skipping products');
    } else {
      for (const p of products) {
        await client.query(
          `INSERT INTO products
             (name, description, category, price_cents, compare_at_price_cents, stock, is_new)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            p.name,
            p.description,
            p.category,
            p.price_cents,
            p.compare_at_price_cents,
            p.stock,
            p.is_new,
          ],
        );
      }
      console.log(`Inserted ${products.length} products`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
