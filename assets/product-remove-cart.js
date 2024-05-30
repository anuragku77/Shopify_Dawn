document.addEventListener('DOMContentLoaded', function() {
    checkExpiredProducts();
    
    removeExpiredProductFromCart();

    function checkExpiredProducts() {
        setInterval(() => {
            const productsInCart = Object.keys(localStorage).filter(key => key.startsWith('cartItemExpirationTime-'));
            const currentTime = Date.now();
        
            productsInCart.forEach(key => {
                const expirationTime = localStorage.getItem(key);
                const variantId = key.split('-')[1];
            
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
      
    function removeExpiredProductFromCart() {
        // Retrieve the variant ID from local storage
        const variantId = localStorage.getItem('expiredVariantId');
        if (!variantId) return; 

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
        })
        .finally(() => {
            // Remove the variant ID from local storage after processing
            localStorage.removeItem('expiredVariantId');
        });
    }
});
