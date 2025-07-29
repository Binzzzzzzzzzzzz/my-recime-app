import React, { useEffect, useState } from 'react';
import axios from 'axios';

const emptyRecipe = {
  name: '',
  description: '',
  image: '',
  ingredients: '',
  url: '',
  category: '',
};

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyRecipe);
  const [editId, setEditId] = useState(null);

  const fetchRecipes = async () => {
    const response = await axios.get('/api/recipes');
    setRecipes(response.data);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      ingredients: form.ingredients.split(',').map(s => s.trim()),
    };
    if (editId) {
      await axios.put(`/api/recipes/${editId}`, payload);
    } else {
      await axios.post('/api/recipes', payload);
    }
    setForm(emptyRecipe);
    setEditId(null);
    fetchRecipes();
  };

  const handleEdit = recipe => {
    setForm({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(', ')
        : recipe.ingredients,
    });
    setEditId(recipe.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這筆食譜嗎？')) return;
    await axios.delete(`/api/recipes/${id}`);
    fetchRecipes();
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyRecipe);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">🍽 我的食譜清單</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">名稱</label>
          <input
            name="name"
            placeholder="名稱"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">分類</label>
          <input
            name="category"
            placeholder="分類"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">圖片網址</label>
          <input
            name="image"
            placeholder="圖片網址"
            value={form.image}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">食譜連結</label>
          <input
            name="url"
            placeholder="食譜連結"
            value={form.url}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">原料（用逗號分隔）</label>
          <input
            name="ingredients"
            placeholder="原料（用逗號分隔）"
            value={form.ingredients}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">描述</label>
          <input
            name="description"
            placeholder="描述"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {editId ? '更新' : '新增'}食譜
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              取消編輯
            </button>
          )}
        </div>
      </form>
      {recipes.length === 0 ? (
        <p>載入中...</p>
      ) : (
        recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white border rounded p-4 mb-4 shadow">
            <h2 className="text-lg font-bold">{recipe.name}</h2>
            <p><strong>分類：</strong>{recipe.category}</p>
            <p>{recipe.description}</p>
            <ul className="list-disc ml-6">
              {Array.isArray(recipe.ingredients)
                ? recipe.ingredients.map((item, idx) => <li key={idx}>{item}</li>)
                : null}
            </ul>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.name}
                className="max-w-full h-auto mt-2 rounded"
              />
            )}
            {recipe.url && (
              <p>
                🔗 <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">食譜連結</a>
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(recipe)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded"
              >
                編輯
              </button>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                刪除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default App;