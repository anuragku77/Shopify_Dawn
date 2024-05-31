document.addEventListener('DOMContentLoaded', function () {
    const timers = document.querySelectorAll('.countdown-timer');

    const getTimersFromLocalStorage = () => {
        const timersArray = [];
        timers.forEach(timer => {
            const variantId = timer.getAttribute('data-variant-id');
            const localStorageKey = `cartItemExpirationTime-${variantId}`;
            const expirationValue = parseInt(localStorage.getItem(localStorageKey)); 
            console.log("Expiration value from local storage:", expirationValue);

            const currentTime = Date.now();
            const remainingTime = Math.max(0, expirationValue - currentTime); 
            let minutes = Math.floor(remainingTime / 60000); 
            let seconds = Math.floor((remainingTime % 60000) / 1000); // Calculate remaining seconds
            console.log("Minutes:", minutes, "Seconds:", seconds); // Debugging

            timersArray.push({ timerElement: timer, minutes, seconds });
        });
        return timersArray;
    };

    const displayTimers = (timersArray) => {
        timersArray.forEach(timerData => {
            const { timerElement, minutes, seconds } = timerData;

            const updateTimer = () => {
                if (timerData.seconds === 0 && timerData.minutes === 0) {
                    clearInterval(timerData.interval);
                    return;
                }
                
                if (timerData.seconds === 0) {
                    if (timerData.minutes > 0) {
                        timerData.minutes--;
                        timerData.seconds = 59;
                    }
                } else {
                    timerData.seconds--;
                }

                timerElement.textContent = `${timerData.minutes}:${timerData.seconds < 10 ? '0' + timerData.seconds : timerData.seconds}`;
            };

            timerData.interval = setInterval(updateTimer, 1000);
            updateTimer();
        });
    };

    const timersArray = getTimersFromLocalStorage();
    displayTimers(timersArray);

    checkExpiredProducts();

    // Get expired variant IDs and remove them
    const expiredVariantIds = getExpiredVariantIds();
    expiredVariantIds.forEach(variantId => {
        removeExpiredProductFromCart(variantId, true); // Pass true to trigger reload
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
                    removeExpiredProductFromCart(variantId, true); // Pass true to trigger reload
                    localStorage.removeItem(key);

                    // Store expired variant ID to local storage
                    let expiredVariantIds = JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
                    expiredVariantIds.push(variantId);
                    localStorage.setItem('expiredVariantIds', JSON.stringify(expiredVariantIds));
                }
            });
        }, 1000);
    }

    function removeExpiredProductFromCart(variantId, shouldReload = false) {
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
                if (shouldReload) {
                    location.reload(); // Reload the page after removing the product
                }
            })
            .catch((error) => {
                console.error('Error removing item from cart:', error);
            })
            .finally(() => {
                // Remove the variant ID from expired variant IDs after processing
                let expiredVariantIds = JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
                expiredVariantIds = expiredVariantIds.filter(id => id !== variantId);
                localStorage.setItem('expiredVariantIds', JSON.stringify(expiredVariantIds));
            });
    }

    function getExpiredVariantIds() {
        return JSON.parse(localStorage.getItem('expiredVariantIds')) || [];
    }
});
