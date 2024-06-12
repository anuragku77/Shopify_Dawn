document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetails = document.getElementById('product-details');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-handle');
            console.log('Button clicked. Product handle:', productHandle);
            if (productHandle) {
                console.log('Fetching details for product handle:', productHandle);
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
        console.log('Fetching product details for:', handle);
        fetch(`/products/${handle}.json`)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                console.log('Product details fetched:', product);
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
            // Assuming product.images[0] contains the image URL
            productImage = `<img src="${product.images[0].src}" alt="${product.title}">`;
        } else {
            productImage = '<p>No image available</p>';
        }
    
        let variantsOptionsHtml = '';
        if (product.variants && product.variants.length > 0) {
            variantsOptionsHtml = product.variants.map(variant => `
                <option value="${variant.id}" data-price="${variant.price / 100}">${variant.title} - $${(variant.price / 100).toFixed(2)}</option>
            `).join('');
        }
    
        let formHtml = '';
        if (variantsOptionsHtml) {
            formHtml = `
                <form id="add-to-cart-form">
                    <label for="variant">Options:</label>
                    <select id="variant">${variantsOptionsHtml}</select>
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value="1" min="1">
                    <button type="submit">Add to Cart</button>
                    <p>Price: $<span id="product-price">${(product.variants && product.variants.length > 0) ? (product.variants[0].price / 100).toFixed(2) : '0.00'}</span></p>
                </form>
            `;
        }
    
        productDetails.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.body_html}</p>
            ${productImage}
            ${formHtml}
        `;
    
        if (variantsOptionsHtml) {
            document.getElementById('variant').addEventListener('change', function() {
                let selectedOption = this.options[this.selectedIndex];
                let price = selectedOption.getAttribute('data-price');
                document.getElementById('product-price').textContent = parseFloat(price).toFixed(2);
            });
    
            document.getElementById('add-to-cart-form').addEventListener('submit', function(event) {
                event.preventDefault();
                addToCart(product.id);
            });
        }
    }
    
    
    

    function addToCart(productId) {
        var form = document.getElementById('add-to-cart-form');
        var variantId = form.variant.value;
        var quantity = form.quantity.value;

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
