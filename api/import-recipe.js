// api/import-recipe.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { url: recipeUrl } = req.body;
  if (!recipeUrl) return res.status(400).json({ error: '缺少 URL' });

  try {
    const result = await pool.query(
      'INSERT INTO recipes (name, description, ingredients, image, url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      ['測試食譜', '從 URL 導入', JSON.stringify(['待解析原料']), '', recipeUrl, '未知']
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '伺服器錯誤', detail: err.message });
  }
};
