import React, {
  FC,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';
import { Order, Product, UserInfo } from '../types';

interface Props {}

type SearchedItems = Product[] | Order[] | UserInfo[] | null;

type SearchState = {
  searchedItems: SearchedItems;
};

type SearchDispatch = {
  setSearchedItems: Dispatch<SetStateAction<SearchedItems>>;
};

const SearchStateContext = createContext<SearchState | undefined>(undefined);
const SearchDispatchContext = createContext<SearchDispatch | undefined>(
  undefined
);

const SearchContextProvider: FC<Props> = ({ children }) => {
  const [searchedItems, setSearchedItems] = useState<SearchedItems>(null);
  return (
    <SearchStateContext.Provider value={{ searchedItems }}>
      <SearchDispatchContext.Provider value={{ setSearchedItems }}>
        {children}
      </SearchDispatchContext.Provider>
    </SearchStateContext.Provider>
  );
};

export default SearchContextProvider;

export const useSearchContext = () => {
  const searchedState = useContext(SearchStateContext);
  const searchedDispatch = useContext(SearchDispatchContext);

  if (searchedState === undefined || searchedDispatch === undefined) {
    throw new Error(
      'useSearchContext must be used within SearchContextProvider'
    );
  }

  return { ...searchedState, ...searchedDispatch };
};
