document.addEventListener('DOMContentLoaded', function () {


    const timers = document.querySelectorAll('.countdown-timer');

    const getTimersFromLocalStorage = () => {
        const timersArray = [];
        timers.forEach(timer => {
            const variantId = timer.getAttribute('data-variant-id');
            const localStorageKey = `cartItemExpirationTime-${variantId}`;
            const expirationValue = parseInt(localStorage.getItem(localStorageKey)); // Get the value from localStorage and parse it as an integer
            console.log("Expiration value from local storage:", expirationValue); // Debugging

            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            const remainingTime = Math.max(0, expirationValue - currentTime); // Remaining time in seconds
            let minutes = Math.floor(remainingTime / 60); // Calculate minutes (let instead of const)
            let seconds = remainingTime % 60; // Calculate remaining seconds (let instead of const)
            console.log("Minutes:", minutes, "Seconds:", seconds); // Debugging

            timersArray.push({ timerElement: timer, getMinutes: () => minutes, getSeconds: () => seconds });
        });
        return timersArray;
    };

    const displayTimers = (timersArray) => {
        timersArray.forEach(timerData => {
            const { timerElement, getMinutes, getSeconds } = timerData;

            const updateTimer = () => {
                let minutes = getMinutes();
                let seconds = getSeconds();

                timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                
                // Update seconds and minutes if necessary
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                }
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
