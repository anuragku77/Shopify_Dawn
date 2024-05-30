checkExpiredProducts() {
    setInterval(() => {
      const productsInCart = Object.keys(localStorage).filter(key => key.startsWith('cartItemExpirationTime-'));
      const currentTime = Date.now();
    
      productsInCart.forEach(key => {
        const expirationTime = Number(localStorage.getItem(key));
        const variantId = key.split('cartItemExpirationTime-')[1];
        console.log("variantId =", variantId);
    
        if (expirationTime && currentTime >= expirationTime) {
          // Remove product from the cart
          console.log(`Variant ID ${variantId} expired and removed from the cart.`);
          this.removeExpiredProductFromCart(variantId)
            .then(() => {
              localStorage.removeItem(key);
              location.reload();
            })
            .catch(error => {
              console.error('Error removing item from cart:', error);
            });
        }
      });
    }, 1000);
  };
  
  removeExpiredProductFromCart(variantId) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: 0, id: variantId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
  
      console.log(`Variant ID ${variantId} removed from the cart.`);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error; // Rethrow the error to be caught in the calling function
    }
  };
  