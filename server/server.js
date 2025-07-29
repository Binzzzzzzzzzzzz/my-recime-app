  const express = require('express');
  const cors = require('cors');
  const sqlite3 = require('sqlite3').verbose();
  const axios = require('axios');

  const app = express();
  const port = 3001;

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('後端服務運行正常 - ReciMe API');
  });

  const db = new sqlite3.Database('recipes.db', (err) => {
    if (err) {
      console.error('資料庫連接失敗:', err.message);
    } else {
      db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          image TEXT,
          ingredients TEXT NOT NULL,
          url TEXT,
          category TEXT
        )
      `);
      console.log('資料庫連接成功');
    }
  });

  app.get('/api/recipes', (req, res) => {
    db.all('SELECT * FROM recipes', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows.map(row => ({
        ...row,
        ingredients: row.ingredients.split(',').map(item => item.trim())
      })));
    });
  });

  app.post('/api/recipes', (req, res) => {
    const { name, description, image, ingredients, url, category } = req.body;
    if (!name || !description || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: '名稱、描述和原料為必填項，且原料必須為非空陣列' });
      return;
    }
    const sql = `INSERT INTO recipes (name, description, image, ingredients, url, category) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, description, image, ingredients.join(','), url, category], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, description, image, ingredients, url, category });
    });
  });

  app.put('/api/recipes/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, image, ingredients, url, category } = req.body;
    console.log('Received PUT request for ID:', id, 'Data:', req.body);
    if (!name || !description || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: '名稱、描述和原料為必填項，且原料必須為非空陣列' });
      return;
    }
    const sql = `UPDATE recipes SET name = ?, description = ?, image = ?, ingredients = ?, url = ?, category = ? WHERE id = ?`;
    db.run(sql, [name, description, image, ingredients.join(','), url, category, id], (err) => {
      if (err) {
        console.error('Database error:', err.message);
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id, name, description, image, ingredients, url, category });
    });
  });

  app.delete('/api/recipes/:id', (req, res) => {
      const { id } = req.params;
      db.run('DELETE FROM recipes WHERE id = ?', id, (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.json({ message: '食譜已刪除' });
      });
    });

    app.post('/api/import-recipe', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: '請提供有效的 URL' });
    }
    try {
      let importedRecipe = { name: '未命名食譜', ingredients: [], description: '', image: '', category: '' };

      // 簡單檢測平台並解析
      if (url.includes('instagram.com')) {
        // 假設從描述中提取（實際需要正則或 API）
        importedRecipe = {
          name: 'Instagram 食譜',
          description: '從 Instagram 導入',
          ingredients: ['待解析原料'],
          image: url, // 使用帖子 URL 作為臨時圖片
        };
      } else if (url.includes('tiktok.com')) {
        importedRecipe = {
          name: 'TikTok 食譜',
          description: '從 TikTok 導入',
          ingredients: ['待解析原料'],
          image: url,
        };
      } else if (url.includes('youtube.com')) {
        importedRecipe = {
          name: 'YouTube 食譜',
          description: '從 YouTube 導入',
          ingredients: ['待解析原料'],
          image: url,
        };
      } else if (url.includes('facebook.com')) {
        importedRecipe = {
          name: 'Facebook 食譜',
          description: '從 Facebook 導入',
          ingredients: ['待解析原料'],
          image: url,
        };
      } else {
        // 其他網站使用現有邏輯
        const response = await axios.get(url);
        // 這裡需要更複雜的解析邏輯（例如使用第三方庫如 Cheerio）
        importedRecipe = {
          name: '網站食譜',
          description: response.data || '無描述',
          ingredients: ['待解析原料'],
          image: '',
        };
      }

      res.json(importedRecipe);
    } catch (err) {
      res.status(500).json({ error: '無法從 URL 導入食譜，請檢查連結或平台支援' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });