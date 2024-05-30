document.addEventListener('DOMContentLoaded', function() {
    checkExpiredProducts();
    
    // Get expired variant IDs and remove them
    const expiredVariantIds = getExpiredVariantIds();
    console.log("expire = ", expiredVariantIds);
    expiredVariantIds.forEach(variantId => {
        removeExpiredProductFromCart(variantId);
    });

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

                    // Store expired variant ID to local storage
                    let expiredVariantIds = JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
                    expiredVariantIds.push(variantId);
                    localStorage.setItem('expiredVariantIds', JSON.stringify(expiredVariantIds));

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
        })
        .finally(() => {
            // Remove the variant ID from expired variant IDs after processing
            let expiredVariantIds = JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
            console.log("GGGGGG", expiredVariantIds)
            expiredVariantIds = expiredVariantIds.filter(id => id !== variantId);
            console.log("GGGGGG2", expiredVariantIds)
            localStorage.setItem('expiredVariantIds', JSON.stringify(expiredVariantIds));
        });
    }

    function getExpiredVariantIds() {
        return JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
    }
});
