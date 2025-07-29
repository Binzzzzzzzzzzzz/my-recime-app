import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await pool.query('SELECT * FROM recipes ORDER BY id DESC');
    res.status(200).json(result.rows.map(row => {
      let ingredients = row.ingredients;
      if (typeof ingredients === 'string') {
        try {
          ingredients = JSON.parse(ingredients);
        } catch {
          ingredients = [ingredients]; // 不合法 JSON 直接包成陣列
        }
      }
      return { ...row, ingredients };
    }));
    return;
  }

  if (req.method === 'POST') {
    const { name, description, image, ingredients, url, category } = req.body;
    if (!name || !description || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: '名稱、描述和原料為必填項，且原料必須為非空陣列' });
      return;
    }
    const result = await pool.query(
      `INSERT INTO recipes (name, description, image, ingredients, url, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, image, JSON.stringify(ingredients), url, category]
    );
    res.status(201).json(result.rows[0]);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name, description, image, ingredients, url, category } = req.body;
    if (!id || !name || !description || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: '所有欄位皆為必填' });
      return;
    }
    const result = await pool.query(
      `UPDATE recipes SET name=$1, description=$2, image=$3, ingredients=$4, url=$5, category=$6 WHERE id=$7 RETURNING *`,
      [name, description, image, JSON.stringify(ingredients), url, category, id]
    );
    res.status(200).json(result.rows[0]);
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}