import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vercel 會自動將 [id].js 的 id 放在 req.query.id
  const id = parseInt(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: '無效的食譜 ID' });
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '找不到食譜' });
      }
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { name, description, ingredients, image, url, category } = req.body;
      const result = await pool.query(
        'UPDATE recipes SET name = $1, description = $2, ingredients = $3, image = $4, url = $5, category = $6 WHERE id = $7 RETURNING *',
        [name, description, JSON.stringify(ingredients), image, url, category, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: '找不到要更新的食譜' });
      }
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const result = await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: '找不到要刪除的食譜' });
      }
      return res.status(200).json({ message: '刪除成功' });
    }

    return res.status(405).json({ error: '不支援的請求方法' });
  } catch (err) {
    console.error('API 錯誤：', err);
    return res.status(500).json({ error: '伺服器錯誤', detail: err.message });
  }
}