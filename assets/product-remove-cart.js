document.addEventListener('DOMContentLoaded', function() {
    checkExpiredProducts();
    removeExpiredProductFromCart(;)


    function checkExpiredProducts() {
        setInterval(() => {
            const productsInCart = Object.keys(localStorage).filter(key => key.startsWith('cartItemExpirationTime-'));
            const currentTime = Date.now();
        
            productsInCart.forEach(key => {
                const expirationTime = localStorage.getItem(key);
                const variantId = key.split('-')[1];
                console.log("variantId =", variantId)
            
                if (expirationTime && currentTime >= expirationTime) {
                    // Remove product from the cart
                    console.log(`Variant ID ${variantId} expired and removed from the cart.`);
                    removeExpiredProductFromCart(variantId);
                    localStorage.removeItem(key);
                    location.reload();
                }
            });
        }, 1000);
    }
      
    function removeExpiredProductFromCart(variantId) {
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
});
