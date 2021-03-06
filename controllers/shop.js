const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    let userName;
    if (req.session.user) {
      userName = req.session.user.name;
    } else {
      userName = '';
    }
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn,
      userName: userName
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      if (req.session.user) {
        userName = req.session.user.name;
      } else {
        userName = '';
      }
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
        userName: userName
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    let userName;
    if (req.session.user) {
      userName = req.session.user.name;
    } else {
      userName = '';
    }
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      userName: userName
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  console.log(req.session.user);
  req.session.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          let userName;
          if (req.session.user) {
            userName = req.session.user.name;
          } else {
            userName = '';
          }
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
            isAuthenticated: req.session.isLoggedIn,
            userName: req.session.user.name
          });
        });
    })
    .catch(err => {
      console.log(err);
    })
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.session.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } })
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);

    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: {
          quantity: newQuantity
        }
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    })

};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.session.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.session.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.session.user.createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            products.orderItem = { quantity: product.cartItem.quantity }; // this orderItem is the anme of the model(exact)
            return product;
          }));
        })
        .catch(err => {
          console.log(err);
        });
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
    })
}

exports.getOrders = (req, res, next) => {
  req.session.user.getOrders({ include: ['products'] })
    .then(orders => {
      let userName;
      if (req.session.user) {
        userName = req.session.user.name;
      } else {
        userName = '';
      }
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
        userName: userName
      });
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    userName: req.session.user.name
  });
};
