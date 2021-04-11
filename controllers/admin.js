const Product = require('../models/product');
const alert = require('alert');

exports.getAddProduct = (req, res, next) => {
  let userName;
  if (req.session.user) {
    userName = req.session.user.name;
  } else {
    userName = '';
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    userName: userName
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  if (!(title && imageUrl && price && description)) {
    alert("Please enter all values");
    res.redirect('/admin/add-product');
  }
  //req.user.createProduct();
  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.session.user.id
  }).then(result => {
    console.log(result);
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findAll({ where: { id: prodId } })
    //Product.findAll({ where: { id: prodId } })
    //Product.findByPk(prodId)
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      let userName;
      if (req.session.user) {
        userName = req.session.user.name;
      } else {
        userName = '';
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        userName: userName
      })
    }).catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findByPk(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(result => {
      console.log('Product Updated and saved');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  console.log(req.session.user);
  //req.session.user.getProducts()
  Product.findAll()
    .then(products => {
      let userName;
      if (req.session.user) {
        userName = req.session.user.name;
      } else {
        userName = '';
      }
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn,
        userName: userName
      });
    }).catch(err => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      console.log('Product Deleted');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};
