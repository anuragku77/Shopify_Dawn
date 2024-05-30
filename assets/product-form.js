if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';

        this.setupAddToCartListener();
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        // this.setupAddToCartListener();
        
        this.handleErrorMessage();


        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            // console.log(response);
            // return false;
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButton.querySelector('span').classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
      
      setupAddToCartListener() {
        let btn = this.submitButton;
        btn.addEventListener('click', async () => {
          const formData = new FormData(this.form);
          const config = fetchConfig('javascript');
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
          delete config.headers['Content-Type'];
          config.body = formData;
      
          try {
            const response = await fetch(`${routes.cart_add_url}`, config);
            console.log("Response",response);
            const data = await response.json();
            console.log("Response Data = ", data);;
      
            if (!data.status && data.variant_id) {
              const timestamp = Date.now();
              const expirationTime = timestamp + 1 * 60 * 1000;
              localStorage.setItem(`cartItemExpirationTime-${data.variant_id}`, expirationTime);
              console.log(`Variant ID ${data.variant_id} added to cart. Expiration time set to:`, new Date(expirationTime));
      
              // Start timer to remove product after expiration
              setTimeout(() => {
                this.removeExpiredProductFromCart(data.variant_id);
              }, expirationTime - timestamp);
            }
          } catch (error) {
            console.error(error);
          }
        });
        // Check for expired products when the page loads
        this.checkExpiredProducts();
      }
      
      checkExpiredProducts() {
        setInterval(() => {
          const productsInCart = Object.keys(localStorage).filter(key => key.startsWith('cartItemExpirationTime-'));
          const currentTime = Date.now();
      
          productsInCart.forEach(key => {
            const expirationTime = localStorage.getItem(key);
            const variantId = key.split('-')[1];
            console.log("varientId =", variantId)
      
            if (expirationTime && currentTime >= expirationTime) {
              // Remove product from the cart
              console.log(`Variant ID ${variantId} expired and removed from the cart.`);
              this.removeExpiredProductFromCart(variantId);
              localStorage.removeItem(key);
              location.reload();
            }
          });
        }, 1000);
      }
      
      removeExpiredProductFromCart(variantId) {
        fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: 0, id: variantId }),
        })
        .then((response) => {
          console.log(response);
          if (!response.ok) {
            throw new Error('Failed to remove item from cart');
          }
          console.log(`Variant ID ${variantId} removed from the cart.`);
        })
        .catch((error) => {
          console.error('Error removing item from cart:', error);
        });
      }

    }
  );
}
