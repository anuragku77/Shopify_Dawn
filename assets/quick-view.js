document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetails = document.getElementById('product-details');

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
        if (event.target == modal) {
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
        let productImage = '';
        if (product.images && product.images.length > 0) {
            productImage = `<img src="${product.images[0].src}" alt="${product.title}">`;
        } else {
            productImage = '<p>No image available</p>';
        }

        let formHtml = '';
        if (product.options && product.options.length > 0 && !(product.options.length === 1 && product.options[0].name === "Title" && product.options[0].values.length === 1 && product.options[0].values[0] === "Default Title")) {
            formHtml = '<form id="add-to-cart-form">';
            product.options.forEach(option => {
                let optionHtml = option.values.map(value => `
                    <option value="${value}" data-option-name="${option.name}">${value}</option>
                `).join('');
                formHtml += `
                    <div class="option-${option.name}">
                        <h6>${option.name}:</h6>
                        <select id="${option.name.toLowerCase()}" data-option-name="${option.name}">
                            ${optionHtml}
                        </select>
                    </div>
                `;
            });
            formHtml += `
                <div class="option-Quantity">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value="1" min="1">
                </div>
                <button type="submit" id="add-to-cart-button">Add to Cart</button>
            `;
            formHtml += '</form>';
        } else {
            // If no options, show default quantity input and add to cart button
            formHtml = `
                <form id="add-to-cart-form">
                    <div class="option-Quantity">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" value="1" min="1">
                    </div>
                    <button type="submit" id="add-to-cart-button">Add to Cart</button>
                </form>
            `;
        }

        // Display product details including image and form
        productDetails.innerHTML = `
            <div class="product-main">
                <div class="product-media">${productImage}</div>
                <div class="pro-information">
                    <h2>${product.title}</h2>
                    <p>Price: <span id="product-price">${formatPrice(getInitialPrice(product.variants))}</span></p>
                    <p class="product-description">${product.body_html}</p>
                    ${formHtml}
                </div>
            </div>
        `;

        // Update price when variant selection changes
        document.querySelectorAll('select[data-option-name]').forEach(selectElement => {
            selectElement.addEventListener('change', updatePrice);
        });

        // Function to update price based on selected options
        function updatePrice() {
            let selectedOptions = {};
            document.querySelectorAll('select[data-option-name]').forEach(selectElement => {
                selectedOptions[selectElement.getAttribute('data-option-name')] = selectElement.value;
            });

            let selectedVariant = findVariant(product.variants, selectedOptions);
            if (selectedVariant) {
                document.getElementById('product-price').textContent = formatPrice(selectedVariant.price);
            }
        }

        // Function to find variant based on selected options
        function findVariant(variants, selectedOptions) {
            return variants.find(variant => {
                return Object.keys(selectedOptions).every(optionName => {
                    return variant[`option${Object.keys(selectedOptions).indexOf(optionName) + 1}`] === selectedOptions[optionName];
                });
            });
        }

        // Function to get initial price of the first variant
        function getInitialPrice(variants) {
            if (variants && variants.length > 0) {
                return variants[0].price;
            }
            return 0.00;
        }

        // Function to format the price according to the store's currency
        function formatPrice(price) {
            return `Rs. ${price.toFixed(2)}`;
        }

        // Add to cart form submission handling
        document.getElementById('add-to-cart-form')?.addEventListener('submit', function(event) {
            event.preventDefault();
            let selectedOptions = {};
            document.querySelectorAll('select[data-option-name]').forEach(selectElement => {
                selectedOptions[selectElement.getAttribute('data-option-name')] = selectElement.value;
            });

            let selectedVariant = findVariant(product.variants, selectedOptions);
            if (selectedVariant) {
                addToCart(selectedVariant.id);
            } else {
                alert('Please select valid options before adding to cart.');
            }
        });

        // Function to add selected variant to cart
        function addToCart(variantId) {
            let quantity = document.getElementById('quantity').value;

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
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
                alert('Failed to add product to cart.');
            });
        }
    }
});
