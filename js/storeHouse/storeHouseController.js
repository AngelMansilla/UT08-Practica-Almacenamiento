"use strict";
import StoreHouse from './storeHouseModel.js';
import {
  BaseException,
  InvalidAccessConstructorException,
  EmptyValueException,
  InvalidValueException,
  AbstractClassException,
  NotExistException,
  ExistException
} from '../exceptions.js';
import { Product, Processor, Graphic_Card, RAM } from './storeHouseModel.js';
import { Category } from './storeHouseModel.js';
import { StoreException, CoordsStoreException, Store, Coords } from './storeHouseModel.js';

class StoreHouseController {
  //Campos privados
  #storeHouseModel;
  #storeHouseView;

  #loadStoreHouseObjects() {
    let storeHouseModel = this.#storeHouseModel;
    fetch('./datos.json').then(function (response) {
      return response.json();
    }).then(function (data) {
      data.cat.forEach(cat => {
        storeHouseModel.addCategory(new Category(cat.title, data.cat.description));
      });

      data.store.forEach(store => {
        storeHouseModel.addShop(new Store(store.CIF, store.name, store.address, store.phone, new Coords(store.coords.lon, store.coords.lat)));
      })

      let cat1 = storeHouseModel.getCategory("Gaming RGB");
      let cat2 = storeHouseModel.getCategory("Gaming minimal");
      let cat3 = storeHouseModel.getCategory("Ofimatica");

      let shop1 = storeHouseModel.getStore("Amazon");
      let shop2 = storeHouseModel.getStore("PC Componentes");
      let shop3 = storeHouseModel.getStore("Aliexpress");

      let p1 = new Processor(data.pro[0].serialNumber, data.pro[0].name, data.pro[0].description, data.pro[0].price, data.pro[0].tax, data.pro[0].images, data.pro[0].speed, data.pro[0].socket, data.pro[0].chipset, data.pro[0].graphics);
      let p2 = new Processor(data.pro[1].serialNumber, data.pro[1].name, data.pro[1].description, data.pro[1].price, data.pro[1].tax, data.pro[1].images, data.pro[1].speed, data.pro[1].socket, data.pro[1].chipset, data.pro[1].graphics);
      let p3 = new Graphic_Card(data.gra[0].serialNumber, data.gra[0].name, data.gra[0].description, data.gra[0].price, data.gra[0].tax, data.gra[0].images, data.gra[0].brand, data.gra[0].model, data.gra[0].memory);
      let p4 = new Graphic_Card(data.gra[1].serialNumber, data.gra[1].name, data.gra[1].description, data.gra[1].price, data.gra[1].tax, data.gra[1].images, data.gra[1].brand, data.gra[1].model, data.gra[1].memory);
      let p5 = new RAM(data.ram[0].serialNumber, data.ram[0].name, data.ram[0].description, data.ram[0].price, data.ram[0].tax, data.ram[0].images, data.ram[0].technology, data.ram[0].capacity, data.ram[0].speed);
      let p6 = new RAM(data.ram[1].serialNumber, data.ram[1].name, data.ram[1].description, data.ram[1].price, data.ram[1].tax, data.ram[1].images, data.ram[1].technology, data.ram[1].capacity, data.ram[1].speed);

      storeHouseModel.addProduct(p6, [cat3]);
      storeHouseModel.addProduct(p2, [cat2]);
      storeHouseModel.addProduct(p3, [cat3]);
      storeHouseModel.addProduct(p4, [cat1, cat2]);
      storeHouseModel.addProduct(p5, [cat2, cat3]);
      storeHouseModel.addProductInShop(p2, shop1, [cat2.title]);
      storeHouseModel.addProductInShop(p1, shop1, [cat1.title]);
      storeHouseModel.addProductInShop(p2, shop2, [cat2.title]);
      storeHouseModel.addProductInShop(p3, shop3, [cat3.title]);
      storeHouseModel.addProductInShop(p4, shop1, [cat1.title, cat2.title]);
      storeHouseModel.addProductInShop(p6, shop2, [cat2.title, cat3.title]);
      storeHouseModel.addQuantityProductInShop(p3, shop3, 5);
      storeHouseModel.addQuantityProductInShop(p2, shop1, 7);
      storeHouseModel.addQuantityProductInShop(p2, shop2, 3);
      storeHouseModel.addQuantityProductInShop(p6, shop2, 9);
      storeHouseModel.addQuantityProductInShop(p4, shop1, 2);
    });
  }

  constructor(storeHouseModel, storeHouseView) {
    this.#storeHouseModel = storeHouseModel;
    this.#storeHouseView = storeHouseView;

    // Eventos iniciales del Controlador
    this.onLoad();
    this.onInit();

    // Enlazamos handlers con la vista
    this.#storeHouseView.bindInit(this.handleInit);
  }

  onInit = () => {
    this.onAddCategory();
    this.onAddStore();
    this.#storeHouseView.bindCloseProductInNewWindow();
  }

  onLoad = () => {
    this.#loadStoreHouseObjects();
    this.onLogin();
  }


  onAddCategory = () => {
    this.#storeHouseView.showCategories(this.#storeHouseModel.categories);
    this.#storeHouseView.bindProductsCategoryList(this.handleProductsCategoryList);
  }

  onAddStore = () => {
    this.#storeHouseView.showStores(this.#storeHouseModel.stores);
    this.#storeHouseView.bindProductsStoreList(this.handleProductsStoreList);
  }

  onLogin = () => {
    function getCookie(cname) {
      let re = new RegExp('(?:(?:^|.*;\\s*)' + cname + '\\s*\\=\\s*([^;]*).*$)|^.*$');
      return document.cookie.replace(re, "$1");
    }
    if (!getCookie("username")) {
      this.#storeHouseView.showLoginMenu();
      this.#storeHouseView.bindLoginMenu(this.handleLoginForm);
    } else {
      this.#storeHouseView.showAdministracion();
      this.#storeHouseView.bindAdministracionMenu(
        this.handleNewCategoryForm,
        this.handleRemoveCategoryForm,
        this.handleNewStoreForm,
        this.handleRemoveStoreForm,
        this.handleNewProductForm,
        this.handleRemoveProductForm,
        this.handleModStockForm,
        this.handleBackup
      );
      this.#storeHouseView.showLogoutMenu();
      this.#storeHouseView.showAdmin();
      this.#storeHouseView.bindLogoutMenu(this.handleLogout)
    }
  }

  handleInit = () => {
    this.onInit();
  }


  handleProductsCategoryList = (title) => {
    let category = this.#storeHouseModel.getCategory(title);
    this.#storeHouseView.listProducts(this.#storeHouseModel.getCategoryProducts(category), category.title);
    this.#storeHouseView.bindShowProduct(this.handleShowProduct);
    this.#storeHouseView.bindProductsStoreCategoryTypeList(this.handleProductsType, "", category);
  }
  handleProductsStoreList = (name) => {
    let store = this.#storeHouseModel.getStore(name);
    this.#storeHouseView.showCategories(this.#storeHouseModel.getShopCategories(store));
    this.#storeHouseView.listProducts(this.#storeHouseModel.getShopProducts(store), store.name);
    this.#storeHouseView.bindShowProduct(this.handleShowProduct);
    this.#storeHouseView.bindProductsStoreCategoryList(this.handleProductsStoreCategoryList, store);
    this.#storeHouseView.bindProductsStoreCategoryTypeList(this.handleProductsType, store, "");
  }
  handleProductsStoreCategoryList = (name, title) => {
    let store = this.#storeHouseModel.getStore(name);
    let category = this.#storeHouseModel.getCategory(title);
    this.#storeHouseView.listProducts(this.#storeHouseModel.getShowCategoryProducts(store, category), store.name + " - " + category.title);
    this.#storeHouseView.bindShowProduct(this.handleShowProduct);
    this.#storeHouseView.bindProductsStoreCategoryTypeList(this.handleProductsType, store, category);
  }

  handleProductsType = (type, store, category) => {
    // En caso de pasar nombre de la tienda o de la categoria, cambiamos la variable al objeto de estos.
    if (store) {
      store = this.#storeHouseModel.getStore(store);
    }
    if (category) {
      category = this.#storeHouseModel.getCategory(category);
    }
    if (type) {
      if (store && category) {
        this.#storeHouseView.listProducts(this.#storeHouseModel.getShowCategoryProducts(store, category, type), store.name + " - " + category.title);
      } else if (store) {
        this.#storeHouseView.listProducts(this.#storeHouseModel.getShopProducts(store, type), store.name);
      } else if (category) {
        this.#storeHouseView.listProducts(this.#storeHouseModel.getCategoryProducts(category, type), category.title);
      } else {
        throw new EmptyValueException("store and category");
      }
    }
    this.#storeHouseView.bindShowProduct(this.handleShowProduct);
    this.#storeHouseView.bindProductsStoreCategoryTypeList(this.handleProductsType, store, category);
    this.#storeHouseView.showType(type);
  }

  handleShowProduct = (serialNumber) => {
    try {
      let product = this.#storeHouseModel.getProduct(Number.parseInt(serialNumber));
      this.#storeHouseView.showProduct(product);
      this.#storeHouseView.bindProductsCategoryList(this.handleProductsCategoryList);
      this.#storeHouseView.bindShowProductInNewWindow(this.handleShowProductInNewWindow);
    } catch (error) {
      this.#storeHouseView.showProduct(null, 'No existe este producto en la página.');
    }
  }

  handleShowProductInNewWindow = (serial) => {
    try {
      let product = this.#storeHouseModel.getProduct(Number.parseInt(serial));
      this.#storeHouseView.showProductInNewWindow(product);
    }
    catch (error) {
      this.#storeHouseView.showProductInNewWindow(null, 'No existe este producto en la página.');
    }
  }

  handleNewCategoryForm = () => {
    this.#storeHouseView.showNewCategoryForm();
    this.#storeHouseView.bindNewCategoryForm(this.handleCreateCategory);
  }

  handleCreateCategory = (title, desc) => {
    let cat = new Category(title);
    cat.description = desc;

    let done = false;
    let error;
    try {
      this.#storeHouseModel.addCategory(cat);
      done = true;
      this.onAddCategory();
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showNewCategoryModal(done, cat, error);
  }

  handleRemoveCategoryForm = () => {
    this.#storeHouseView.showRemoveCategoryForm(this.#storeHouseModel.categories);
    this.#storeHouseView.bindRemoveCategoryForm(this.handleRemoveCategory);
  }

  handleRemoveCategory = (title) => {
    let error, cat;
    let done = false;
    try {
      cat = this.#storeHouseModel.getCategory(title);
      this.#storeHouseModel.removeCategory(cat);
      done = true;
      this.onAddCategory();
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showRemoveCategoryModal(done, cat, error);
  }

  handleNewStoreForm = () => {
    this.#storeHouseView.showNewStoreForm();
    this.#storeHouseView.bindNewStoreForm(this.handleCreateStore);
  }

  handleCreateStore = (cif, name, address, phone, latitude, longitude) => {
    let store = new Store(cif, name);
    store.address = address;
    store.phone = phone;
    // store.coords = new Coords(latitude, longitude);
    let done = false;
    let error;
    try {
      this.#storeHouseModel.addShop(store);
      done = true;
      this.onAddStore();
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showNewStoreModal(done, store, error);
  }

  handleRemoveStoreForm = () => {
    this.#storeHouseView.showRemoveStoreForm(this.#storeHouseModel.stores);
    this.#storeHouseView.bindRemoveStoreForm(this.handleRemoveStore);
  }

  handleRemoveStore = (name) => {
    let error, store;
    let done = false;
    try {
      store = this.#storeHouseModel.getStore(name);
      this.#storeHouseModel.removeShop(store);
      done = true;
      this.onAddStore();
      //Se necesita volver a mostrar el formulario para mantenernos en él y no ir a las tiendas.
      this.handleRemoveStoreForm();
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showRemoveStoreModal(done, store, error);
  }

  handleNewProductForm = () => {
    this.#storeHouseView.showNewProductForm(this.#storeHouseModel.categories, this.#storeHouseModel.stores);
    this.#storeHouseView.bindNewProductForm(this.handleCreateProduct);
  }

  handleCreateProduct = (serialNumber, name, description, type, price, tax, images, categories, storeName) => {
    let instance = {
      Processor: Processor,
      Graphic_Card: Graphic_Card,
      RAM: RAM,
    }

    let done = false;
    let error, product, store;
    try {
      store = this.#storeHouseModel.getStore(storeName);
      product = new instance[type](serialNumber, name, "", price);
      product.description = description;
      product.tax = tax;
      product.images = images;
      this.#storeHouseModel.addProductInShop(product, store, categories);
      done = true;
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showNewProductModal(done, product, error);
  }

  handleRemoveProductForm = () => {
    let products = this.#storeHouseModel.getAllProducts();
    this.#storeHouseView.showRemoveProductForm(products);
    this.#storeHouseView.bindRemoveProductForm(this.handleRemoveProduct);
  }

  handleRemoveProduct = (serialNumber) => {
    let error, product;
    let done = false;
    try {
      product = this.#storeHouseModel.getProduct(serialNumber);
      this.#storeHouseModel.removeProduct(product.product);
      done = true;
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showRemoveProductModal(done, product, error);
  }

  handleModStockForm = () => {
    this.#storeHouseView.showModStockForm(this.#storeHouseModel.stores);
    this.#storeHouseView.bindModStockSelects(this.handleModStockSelects);
  }

  handleModStockSelects = (nameStore) => {
    let store = this.#storeHouseModel.getStore(nameStore);
    this.#storeHouseView.showModStockList(this.#storeHouseModel.getShopProducts(store));
    this.#storeHouseView.bindModStock(this.handleModStock);
  }

  handleModStock = (storeName, productSerial, stock) => {
    let done = false;
    let error;
    let store = this.#storeHouseModel.getStore(storeName);
    let product = this.#storeHouseModel.getProductStore(productSerial, store);
    try {
      if (stock > 0) {
        this.#storeHouseModel.addQuantityProductInShop(product.product, store, parseInt(stock));
      } else {
        this.#storeHouseModel.removeProductInShop(product.product, store);
      }
      done = true;
    } catch (exception) {
      error = exception;
    }
    this.#storeHouseView.showModStockModal(done, store, product, stock, error);
  }

  handleLoginForm = () => {
    this.#storeHouseView.showLoginForm();
    this.#storeHouseView.bindLogin(this.handleLogin);
  }

  handleLogin = (user, pass) => {
    function setCookie(cname, cvalue, exdays) {
      const d = new Date(); d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    if (user == "admin" && pass == "admin") {
      setCookie("username", user, 10);
    }
  }
  handleLogout = () => {
    function setCookie(cname, cvalue, exdays) {
      const d = new Date(); d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    setCookie("username", '', 0);
  }

  handleBackup = () => {
    let datos = JSON.stringify(this.#storeHouseModel.categories) + JSON.stringify(this.#storeHouseModel.stores);
    let base = location.protocol + '//' + location.host + location.pathname;
    let url = new URL('submitForm.php', base);
    let formData = new FormData();
    let blob = new Blob([datos], { type: "text/xml" });
    formData.append("blobField", blob);
    formData.append("categories", JSON.stringify(this.#storeHouseModel.categories));
    formData.append("stores", JSON.stringify(this.#storeHouseModel.stores));

    fetch(url, {
      method: 'post',
      body: formData
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      console.dir(data);
    }).catch(function (err) {
      console.log('No se ha recibido respuesta.');
      console.log(err.toString());
    });
  }
}

export default StoreHouseController;
