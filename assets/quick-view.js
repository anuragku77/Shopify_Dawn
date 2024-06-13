document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetailsContainer = document.getElementById('product-details');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-handle');
            if (productHandle) {
                fetchProductDetails(productHandle);
            } else {
                console.error('Product handle is missing.');
            }
        });
    });

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function fetchProductDetails(handle) {
        fetch(`/products/${handle}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                displayProductDetails(product.product);
                modal.style.display = 'block'; // Display the modal after fetching product details
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to fetch product details. Please try again later.');
            });
    }

    function displayProductDetails(product) {
        // Check if variants exist
        if (product.variants && product.variants.length > 0) {
            let variantOptionsHtml = '';
            let hiddenVariantsHtml = '';

            // Create variant options
            product.options.forEach(option => {
                let optionHtml = `
                    <div class="option-${option.name}">
                        <h6>${option.name}</h6>`;
                option.values.forEach((value, index) => {
                    optionHtml += `
                        <label for="${index}-${value}">
                            <input type="radio" name="${option.name}" value="${value}" id="${index}-${value}">
                            ${value}
                        </label>`;
                });
                optionHtml += '</div>';
                variantOptionsHtml += optionHtml;
            });

            // Create hidden variants
            product.variants.forEach(variant => {
                hiddenVariantsHtml += `
                    <input type="hidden" name="variant" value="${variant.id}" data-title="${variant.title}">
                `;
            });

            // Set product image
            const productImage = `
                <div class="product-media">
                    <img src="${product.images && product.images.length > 0 ? product.images[0].src : ''}" alt="${product.title}">
                </div>
            `;

            // Create product details HTML
            const productHtml = `
                <div class="product-main">
                    ${productImage}
                    <div class="pro-information">
                        <div>${hiddenVariantsHtml}</div>
                        <h5>${product.title}</h5>
                        <p class="price">$${(product.variants[0].price / 100).toFixed(2)}</p>
                        <div>${variantOptionsHtml}</div>
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" value="1" min="1">
                        <button type="button" id="add-to-cart-button">Add to cart</button>
                        <div class="product-description">
                            <p>${product.body_html}</p>
                        </div>
                    </div>
                </div>
            `;

            productDetailsContainer.innerHTML = productHtml;

            // Add event listener for "Add to cart" button
            document.getElementById('add-to-cart-button').addEventListener('click', function() {
                addToCart(product);
            });

            // Event delegation for variant options
            productDetailsContainer.addEventListener('change', function(event) {
                if (event.target && event.target.matches('input[type="radio"][name^="option-"]')) {
                    let selectedVariant = event.target.value;
                    let selectedPrice = product.variants.find(variant => variant.id == selectedVariant).price / 100;
                    document.querySelector('.price').textContent = `$${selectedPrice.toFixed(2)}`;
                }
            });

        } else {
            // If no variants exist, handle this scenario
            productDetailsContainer.innerHTML = `
                <div class="product-main">
                    <div class="product-media">
                        <img src="${product.images && product.images.length > 0 ? product.images[0].src : ''}" alt="${product.title}">
                    </div>
                    <div class="pro-information">
                        <h5>${product.title}</h5>
                        <p class="price">$0.00</p>
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" value="1" min="1">
                        <button type="button" id="add-to-cart-button">Add to cart</button>
                        <div class="product-description">
                            <p>${product.body_html}</p>
                        </div>
                    </div>
                </div>
            `;

            // Add event listener for "Add to cart" button
            document.getElementById('add-to-cart-button').addEventListener('click', function() {
                addToCart(product);
            });
        }
    }

    function addToCart(product) {
        var quantity = document.getElementById('quantity').value;
        var variantId = null;

        // Check if variants exist and a variant is selected
        if (product.variants && product.variants.length > 0) {
            var selectedVariant = document.querySelector('input[name="variant"]:checked');
            console.log(selectedVariant);
            if (selectedVariant) {
                variantId = selectedVariant.value;
            } else {
                alert('Please select a variant.');
                return;
            }
        }

        // Perform the add to cart action
        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: variantId,
                quantity: quantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Product added to cart!');
            modal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
            alert('Failed to add product to cart.');
        });
    }
});
