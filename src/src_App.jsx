import { useState, useEffect } from 'react';
import axios from 'axios';
import './src_index.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    image: '',
    ingredients: [],
    url: '',
    category: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [error, setError] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/recipes');
      setRecipes(response.data);
    } catch (err) {
      setError('無法載入食譜，請檢查後端伺服器');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientsChange = (e) => {
    const ingredients = e.target.value.split(',').map((item) => item.trim());
    setNewRecipe((prev) => ({ ...prev, ingredients }));
  };

  const importRecipeFromUrl = async () => {
    if (!newRecipe.url) {
      setError('請輸入有效的 URL');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/import-recipe', { url: newRecipe.url });
      const importedRecipe = response.data;
      setNewRecipe((prev) => ({
        ...prev,
        name: importedRecipe.name,
        description: importedRecipe.description,
        image: importedRecipe.image,
        ingredients: importedRecipe.ingredients,
        category: importedRecipe.category,
      }));
      setError('');
    } catch (err) {
      setError('無法導入食譜，請檢查 URL');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecipe.name || !newRecipe.description || !newRecipe.ingredients.length) {
      setError('食譜名稱、描述和原料為必填項');
      return;
    }
    try {
      if (editingRecipe) {
        console.log('Sending to PUT:', newRecipe);
        await axios.put(`http://localhost:3001/api/recipes/${editingRecipe.id}`, newRecipe);
        setRecipes(recipes.map((recipe) =>
          recipe.id === editingRecipe.id ? { ...recipe, ...newRecipe } : recipe
        ));
        setEditingRecipe(null);
      } else {
        const response = await axios.post('http://localhost:3001/api/recipes', newRecipe);
        setRecipes([...recipes, response.data]);
      }
      setNewRecipe({ name: '', description: '', image: '', ingredients: [], url: '', category: '' });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('操作失敗，請稍後重試');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此食譜嗎？')) {
      try {
        await axios.delete(`http://localhost:3001/api/recipes/${id}`);
        setRecipes(recipes.filter((recipe) => recipe.id !== id));
      } catch (err) {
        setError('刪除失敗，請稍後重試');
      }
    }
  };

  const generateShoppingList = () => {
    const allIngredients = recipes.flatMap((recipe) => recipe.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];
    setShoppingList(uniqueIngredients);
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({ ...recipe });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingRecipe(null);
    setNewRecipe({ name: '', description: '', image: '', ingredients: [], url: '', category: '' });
    setShowForm(false);
    setError('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">我的食譜</h1>
      <div className="text-center mb-6">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={() => {
            setEditingRecipe(null);
            setNewRecipe({ name: '', description: '', image: '', ingredients: [], url: '', category: '' });
            setShowForm(true);
          }}
        >
          添加新食譜
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={generateShoppingList}
        >
          生成購物清單
        </button>
      </div>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {showForm && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingRecipe ? '編輯食譜' : '添加新食譜'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">食譜名稱</label>
              <input
                type="text"
                name="name"
                value={newRecipe.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="輸入食譜名稱"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">描述</label>
              <textarea
                name="description"
                value={newRecipe.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="輸入食譜描述"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">原料（以逗號分隔）</label>
              <input
                type="text"
                name="ingredients"
                value={newRecipe.ingredients.join(', ')}
                onChange={handleIngredientsChange}
                className="w-full p-2 border rounded"
                placeholder="例如：雞蛋, 麵粉, 牛奶"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">圖片 URL（可選）</label>
              <input
                type="text"
                name="image"
                value={newRecipe.image}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="輸入圖片 URL"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">來源 URL（可選）</label>
              <div className="flex">
                <input
                  type="text"
                  name="url"
                  value={newRecipe.url}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="輸入來源 URL"
                />
                <button
                  type="button"
                  onClick={importRecipeFromUrl}
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  導入
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">分類</label>
              <input
                type="text"
                name="category"
                value={newRecipe.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="例如：早餐, 甜點"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                {editingRecipe ? '保存編輯' : '保存食譜'}
              </button>
              {editingRecipe && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      {shoppingList.length > 0 && (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">購物清單</h2>
          <ul className="list-disc pl-5">
            {shoppingList.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 ? (
          <p className="text-center col-span-full">還沒有食譜，快來添加一個吧！</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {recipe.image && (
                <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{recipe.name}</h3>
                <p className="text-gray-600">{recipe.description}</p>
                {recipe.url && (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    查看來源
                  </a>
                )}
                {recipe.category && (
                  <p className="text-sm text-gray-500 mt-2">分類：{recipe.category}</p>
                )}
                {recipe.ingredients.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">原料：</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;