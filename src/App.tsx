import './App.css';
import './fontawesome';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes/Routes';
import Layout from './components/Layout';
import ModalContextProvider from './state/modal-context';
import AuthContextProvider from './state/auth-context';
import ProductsContextProvider from './state/products-context';
import CartContextProvider from './state/cart-context';
import SearchContextProvider from './state/search-context';

const App = () => {
  return (
    <AuthContextProvider>
      <ModalContextProvider>
        <ProductsContextProvider>
          <CartContextProvider>
            <SearchContextProvider>
              <BrowserRouter>
                <Layout>
                  <Routes />
                </Layout>
              </BrowserRouter>
            </SearchContextProvider>
          </CartContextProvider>
        </ProductsContextProvider>
      </ModalContextProvider>
    </AuthContextProvider>
  );
};

export default App;
