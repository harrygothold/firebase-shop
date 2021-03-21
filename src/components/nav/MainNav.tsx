import { ChangeEvent, FC, useState, KeyboardEvent, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Button from '../Button/Button';
import { useAuthContext } from '../../state/auth-context';
import { useSearchContext } from '../../state/search-context';
import { useSearchItems } from '../../hooks/useSearchItems';
import LoggedOutNav from './LoggedOutNav';
import LoggedInNav from './LoggedInNav';

interface Props {}

const MainNav: FC<Props> = () => {
  const location = useLocation();
  const history = useHistory();
  const { searchItems, loading, error } = useSearchItems(location.pathname);
  const {
    authState: { authUser },
  } = useAuthContext();

  const { setSearchedItems } = useSearchContext();

  const [searchString, setSearchString] = useState('');

  useEffect(() => {
    if (!searchString) {
      setSearchedItems(null);
      history.replace(location.pathname);
    }
  }, [searchString, setSearchedItems, location.pathname, history]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      return handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!searchString) return;
    return searchItems(searchString);
  };

  useEffect(() => {
    if (error) alert(error);
  }, [error]);

  return (
    <header className="head">
      <div className="head__section">
        <div className="header__logo">
          <NavLink to="/">
            <h2 className="header header--logo">AwesomeShop</h2>
          </NavLink>
        </div>
        <div className="head__search">
          <div className="search-input">
            <input
              type="text"
              className="search"
              placeholder="Search"
              value={searchString}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {searchString && (
              <FontAwesomeIcon
                icon={['fas', 'times']}
                size="lg"
                color="grey"
                className="clear-search"
                onClick={() => {
                  setSearchString('');
                  setSearchedItems(null);
                  history.replace(location.pathname);
                }}
              />
            )}
          </div>
          <Button
            loading={loading}
            disabled={loading}
            onClick={handleSearch}
            className="btn--search"
          >
            SEARCH
          </Button>
        </div>
        <nav className="head__navbar">
          {!authUser ? <LoggedOutNav /> : <LoggedInNav />}
        </nav>
      </div>
    </header>
  );
};

export default MainNav;
