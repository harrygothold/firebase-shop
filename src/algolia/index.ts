import algoliasearch from 'algoliasearch';

const algoliaClient = algoliasearch(
  'F1UOMW463E',
  '16a8c5ac6c4bdf87ee3d39f79f450e88'
);

// Create the indices in Algolia
export const usersIndex = algoliaClient.initIndex('users');
export const productsIndex = algoliaClient.initIndex('products');
export const ordersIndex = algoliaClient.initIndex('orders');
