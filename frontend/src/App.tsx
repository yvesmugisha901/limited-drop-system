import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DropPage from './pages/DropPage';
import ProductsListPage from './pages/ProductsListPage';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleAuth = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setSelectedProductId(null);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleBack = () => {
    setSelectedProductId(null);
  };

  if (!token) {
    return <LoginPage onAuth={handleAuth} />;
  }

  if (selectedProductId) {
    return (
      <DropPage
        productId={selectedProductId}
        onLogout={handleLogout}
        onBack={handleBack}
      />
    );
  }

  return (
    <ProductsListPage
      onSelectProduct={handleSelectProduct}
      onLogout={handleLogout}
    />
  );
}

export default App;