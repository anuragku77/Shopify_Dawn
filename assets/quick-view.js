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
        // Clear previous content
        productDetailsContainer.innerHTML = '';

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
                    <h5>${product.title}</h5>
                    <p class="price">$${(product.variants && product.variants.length > 0) ? (product.variants[0].price / 100).toFixed(2) : '0.00'}</p>
                    ${product.variants && product.variants.length > 0 ? generateVariantOptions(product.options, product.variants) : ''}
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
        if (product.variants && product.variants.length > 0) {
            productDetailsContainer.addEventListener('change', function(event) {
                if (event.target && event.target.matches('input[type="radio"][name^="option-"]')) {
                    let selectedVariantId = event.target.value;
                    console.log("Selected One",selectedVariantId)
                    updatePrice(selectedVariantId, product);
                }
            });
        }
    }

    function generateVariantOptions(options, variants) {
        let variantOptionsHtml = '';

        options.forEach(option => {
            variantOptionsHtml += `
                <div class="option-${option.name}">
                    <h6>${option.name}</h6>
                    ${generateOptionValues(option.values, option.name, variants)}
                </div>
            `;
        });

        return variantOptionsHtml;
    }

    function generateOptionValues(values, optionName, variants) {
        let optionValuesHtml = '';

        values.forEach((value, index) => {
            let variant = findVariantByOptionValue(variants, optionName, value);
            if (variant) {
                optionValuesHtml += `
                    <label for="${index}-${value}">
                        <input type="radio" name="${optionName}" value="${variant.id}" id="${index}-${value}">
                        ${value}
                    </label>
                `;
            }
        });

        return optionValuesHtml;
    }

    function findVariantByOptionValue(variants, optionName, value) {
        return variants.find(variant => {
            return variant.options[optionName] === value;
        });
    }

    function updatePrice(selectedVariantId, product) {
        let selectedPrice = product.variants.find(variant => variant.id == selectedVariantId).price / 100;
        document.querySelector('.price').textContent = `$${selectedPrice.toFixed(2)}`;
    }

    function addToCart(product) {
        var quantity = document.getElementById('quantity').value;
        var variantId = null;

        // Check if variants exist and a variant is selected
        if (product.variants && product.variants.length > 0) {
            var selectedVariant = document.querySelector('input[name^="option-"]:checked');
            console.log("sle",selectedVariant);
            if (selectedVariant) {
                variantId = selectedVariant.value;
                console.log("Vai", variantId);
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
            console.log(res)
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
