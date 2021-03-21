import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import algoliasearch from 'algoliasearch';

admin.initializeApp();

const env = functions.config();

const productsCollection = 'products';
const ordersCollection = 'orders';
const orderCountsCollection = 'order-counts';
const orderCountsDocument = 'counts';
const usersCollection = 'users';
const userCountsCollection = 'user-counts';
const userCountsDocument = 'counts';

const stripe = new Stripe(env.stripe.secret_key, {
  apiVersion: '2020-08-27',
  typescript: true,
});

const algoliaClient = algoliasearch(
  env.algolia.app_id,
  env.algolia.admin_api_key
);

// Create the indices in Algolia
const usersIndex = algoliaClient.initIndex('users');
const productsIndex = algoliaClient.initIndex('products');
const ordersIndex = algoliaClient.initIndex('orders');

type Role = 'SUPER_ADMIN' | 'CLIENT' | 'ADMIN';

type ProductCategory = 'Clothing' | 'Shoes' | 'Watches' | 'Accessories';
type Counts = {
  [key in 'All' | ProductCategory]: number;
};

type CartItem = {
  id: string;
  product: string;
  quantity: number;
  user: string;
  item: Product;
};

type Order = {
  id: string;
  items: Pick<CartItem, 'quantity' | 'user' | 'item'>[];
  amount: number;
  totalQuantity: number;
  user: { id: string; name: string };
};

type Product = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageRef: string;
  imageFileName: string;
  price: number;
  category: ProductCategory;
  inventory: number;
  creator: string;
};

export const onSignup = functions.https.onCall(async (data, context) => {
  try {
    const { username } = data as { username: string };
    if (!context.auth?.uid) {
      return;
    }

    // 1. Create a role on the user in the firebase authentication
    await admin.auth().setCustomUserClaims(context.auth.uid, {
      role:
        context.auth.token.email === env.admin.super_admin
          ? 'SUPER_ADMIN'
          : 'CLIENT',
    });

    // 2. Create a new user document om users collection in firestore
    const result = await admin
      .firestore()
      .collection('users')
      .doc(context.auth?.uid)
      .set({
        username,
        email: context.auth.token.email,
        role:
          context.auth.token.email === env.admin.super_admin
            ? 'SUPER_ADMIN'
            : 'CLIENT',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    if (!result) return;
    return { message: 'User has been created on Firestore' };
  } catch (error) {
    throw error;
  }
});

export const updateUserRole = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error('Not Authorizated');

    const { userId, newRole } = data as { userId: string; newRole: Role };

    // check authorization of the user
    const adminUser = await admin.auth().getUser(context.auth.uid);
    const { role } = adminUser.customClaims as { role: Role };
    if (role !== 'SUPER_ADMIN') throw new Error('Not Authorized');

    // Update the auth user (FB Auth)
    await admin.auth().setCustomUserClaims(userId, { role: newRole });

    // Update the user in the users collection
    return admin.firestore().collection(usersCollection).doc(userId).set(
      {
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
});

export const onUserCreated = functions.firestore
  .document(`${usersCollection}/{userId}`)
  .onCreate(async (snapshot, context) => {
    const user = snapshot.data();
    // Query user-counts/counts document
    const countsData = await admin
      .firestore()
      .collection(userCountsCollection)
      .doc(userCountsDocument)
      .get();

    if (!countsData.exists) {
      await admin
        .firestore()
        .collection(userCountsCollection)
        .doc(userCountsDocument)
        .set({ userCounts: 1 });
    } else {
      const { userCounts } = countsData.data() as { userCounts: number };
      await admin
        .firestore()
        .collection(userCountsCollection)
        .doc(userCountsDocument)
        .set({ userCounts: userCounts + 1 });
    }
    // Create a new user object in Algolia
    return usersIndex.saveObject({
      objectID: snapshot.id,
      ...user,
    });
  });

export const onUserUpdated = functions.firestore
  .document(`${usersCollection}/{userId}`)
  .onUpdate(async (snapshot, context) => {
    const user = snapshot.after.data();
    return usersIndex.saveObject({
      objectID: snapshot.after.id,
      ...user,
    });
  });

export const onUserDeleted = functions.firestore
  .document(`${usersCollection}/{userId}`)
  .onDelete(async (snapshot, context) => {
    const countsData = await admin
      .firestore()
      .collection(userCountsCollection)
      .doc(userCountsDocument)
      .get();

    if (!countsData.exists) {
      return;
    } else {
      const { userCounts } = countsData.data() as { userCounts: number };
      await admin
        .firestore()
        .collection(userCountsCollection)
        .doc(userCountsDocument)
        .set({ userCounts: userCounts >= 1 ? userCounts - 1 : 0 });
    }
    return usersIndex.deleteObject(snapshot.id);
  });

export const onProductCreated = functions.firestore
  .document(`${productsCollection}/{productId}`)
  .onCreate(async (snapshot, context) => {
    const product = snapshot.data() as Product;
    let counts: Counts;
    // Query the product-counts collection
    const countsData = await admin
      .firestore()
      .collection('product-counts')
      .doc('counts')
      .get();
    if (!countsData.exists) {
      // first product item

      // construct counts object
      counts = {
        All: 1,
        Clothing: product.category === 'Clothing' ? 1 : 0,
        Shoes: product.category === 'Shoes' ? 1 : 0,
        Watches: product.category === 'Watches' ? 1 : 0,
        Accessories: product.category === 'Accessories' ? 1 : 0,
      };
    } else {
      const {
        All,
        Clothing,
        Accessories,
        Shoes,
        Watches,
      } = countsData.data() as Counts;
      counts = {
        All: All + 1,
        Clothing: product.category === 'Clothing' ? Clothing + 1 : Clothing,
        Shoes: product.category === 'Shoes' ? Shoes + 1 : Shoes,
        Watches: product.category === 'Watches' ? Watches + 1 : Watches,
        Accessories:
          product.category === 'Accessories' ? Accessories + 1 : Accessories,
      };
    }
    await admin
      .firestore()
      .collection('product-counts')
      .doc('counts')
      .set(counts);

    return productsIndex.saveObject({
      objectID: snapshot.id,
      ...product,
    });
  });

export const onProductUpdated = functions.firestore
  .document(`${productsCollection}/{productId}`)
  .onUpdate(async (snapshot, context) => {
    const beforeProd = snapshot.before.data() as Product;
    const afterProd = snapshot.after.data() as Product;

    // check if category has been changed
    if (beforeProd.category !== afterProd.category) {
      const countsData = await admin
        .firestore()
        .collection('product-counts')
        .doc('counts')
        .get();
      if (!countsData.exists) return;
      const counts = countsData.data() as Counts;
      counts[beforeProd.category] = counts[beforeProd.category] - 1;
      counts[afterProd.category] = counts[afterProd.category] + 1;

      await admin
        .firestore()
        .collection('product-counts')
        .doc('counts')
        .set(counts);
    }

    return productsIndex.saveObject({
      objectID: snapshot.after.id,
      ...afterProd,
    });
  });

export const onProductDeleted = functions.firestore
  .document(`${productsCollection}/{productId}`)
  .onDelete(async (snapshot, context) => {
    const product = snapshot.data() as Product;
    const countsData = await admin
      .firestore()
      .collection('product-counts')
      .doc('counts')
      .get();
    if (!countsData.exists) return;
    const counts = countsData.data() as Counts;
    counts.All = counts.All - 1;
    counts[product.category] = counts[product.category] - 1;

    await admin
      .firestore()
      .collection('product-counts')
      .doc('counts')
      .set(counts);

    return productsIndex.deleteObject(snapshot.id);
  });

export const onOrderCreated = functions.firestore
  .document(`${ordersCollection}/{orderId}`)
  .onCreate(async (snapshot, _) => {
    const order = snapshot.data() as Order;

    // update products inventory
    order.items.forEach((cartItem) =>
      admin
        .firestore()
        .collection(productsCollection)
        .doc(cartItem.item.id)
        .get()
        .then((doc) => {
          if (!doc.exists) return;

          const product = doc.data() as Product;
          return admin
            .firestore()
            .collection(productsCollection)
            .doc(cartItem.item.id)
            .set(
              {
                inventory:
                  product.inventory >= cartItem.quantity
                    ? product.inventory - cartItem.quantity
                    : 0,
              },
              { merge: true }
            );
        })
    );
    // create/update order-counts/counts
    const countsData = await admin
      .firestore()
      .collection(orderCountsCollection)
      .doc(orderCountsDocument)
      .get();
    if (!countsData.exists) {
      // first order - create new counts document
      await admin
        .firestore()
        .collection(orderCountsCollection)
        .doc(orderCountsDocument)
        .set({ orderCounts: 1 });
    } else {
      // Found counts document - update it
      const { orderCounts } = countsData.data() as { orderCounts: number };
      await admin
        .firestore()
        .collection(orderCountsCollection)
        .doc(orderCountsDocument)
        .set({ orderCounts: orderCounts + 1 });
    }
    return ordersIndex.saveObject({
      objectID: snapshot.id,
      ...order,
    });
  });

export const createPaymentIntents = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth) throw new Error('Not Authenticated');

      const { amount, customer, payment_method } = data as {
        amount: number;
        customer?: string;
        payment_method?: string;
      };

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'gbp',
        customer,
        payment_method,
      });
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw error;
    }
  }
);

export const onOrderUpdated = functions.firestore
  .document(`${ordersCollection}/{orderId}`)
  .onUpdate(async (snapshot, context) => {
    const updatedOrder = snapshot.after.data();
    return ordersIndex.saveObject({
      objectID: snapshot.after.id,
      ...updatedOrder,
    });
  });

export const onOrderDeleted = functions.firestore
  .document(`${ordersCollection}/{orderId}`)
  .onDelete(async (snapshot, context) => {
    // Update the order-counts/counts
    const countsData = await admin
      .firestore()
      .collection(orderCountsCollection)
      .doc(orderCountsDocument)
      .get();

    if (!countsData.exists) {
      return;
    } else {
      // Found the counts document, update it
      const counts = countsData.data() as { orderCounts: number };

      await admin
        .firestore()
        .collection(orderCountsCollection)
        .doc(orderCountsDocument)
        .set({
          orderCounts: counts.orderCounts >= 1 ? counts.orderCounts - 1 : 0,
        });
    }

    return ordersIndex.deleteObject(snapshot.id);
  });

export const createStripeCustomer = functions.https.onCall(
  async (_, context) => {
    try {
      if (!context.auth) throw new Error('Not Authenticated');

      const customer = await stripe.customers.create({
        email: context.auth.token.email,
      });
      // update the user document in users collection
      await admin
        .firestore()
        .collection('users')
        .doc(context.auth.uid)
        .set({ stripeCustomerId: customer.id }, { merge: true });

      return { customerId: customer.id };
    } catch (error) {
      throw error;
    }
  }
);

export const setDefaultCard = functions.https.onCall((data, context) => {
  try {
    if (!context.auth) throw new Error('Not Authenticated');
    const { customerId, payment_method } = data as {
      customerId: string;
      payment_method: string;
    };

    return stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });
  } catch (error) {
    throw error;
  }
});

export const listPaymentMethods = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth) throw new Error('Not Authenticated');
      const { customerId } = data as { customerId: string };
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const customer = await stripe.customers.retrieve(customerId);

      return { paymentMethods, customer };
    } catch (error) {
      throw error;
    }
  }
);

export const detachPaymentMethod = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth) throw new Error('Not Authenticated');

      const { payment_method } = data as { payment_method: string };
      const paymentMethod = await stripe.paymentMethods.detach(payment_method);
      if (!paymentMethod) throw new Error('Sorry, something went wrong');

      return { paymentMethod };
    } catch (error) {
      throw error;
    }
  }
);
