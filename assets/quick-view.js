document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetails = document.getElementById('product-details');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-product-handle');
            console.log('Button clicked. Fetching details for product handle:', productHandle); // Debugging statement
            fetchProductDetails(productHandle);
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
        console.log('Fetching product details for:', handle); // Debugging statement
        fetch(`/products/${handle}.js`)
            .then(response => {
                console.log('Response status:', response.status); // Debugging statement
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                console.log('Product details fetched:', product); // Debugging statement
                displayProductDetails(product);
                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to fetch product details. Please try again later.');
            });
    }

    function displayProductDetails(product) {
        let variantsOptionsHtml = product.variants.map(variant => `
            <option value="${variant.id}" data-price="${variant.price / 100}">${variant.title} - $${(variant.price / 100).toFixed(2)}</option>
        `).join('');

        productDetails.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.body_html}</p>
            <img src="${product.images[0]}" alt="${product.title}">
            <form id="add-to-cart-form">
                <label for="variant">Options:</label>
                <select id="variant">${variantsOptionsHtml}</select>
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" name="quantity" value="1" min="1">
                <button type="submit">Add to Cart</button>
            </form>
            <p>Price: $<span id="product-price">${(product.variants[0].price / 100).toFixed(2)}</span></p>
        `;

        document.getElementById('variant').addEventListener('change', function() {
            let selectedOption = this.options[this.selectedIndex];
            let price = selectedOption.getAttribute('data-price');
            document.getElementById('product-price').textContent = parseFloat(price).toFixed(2);
        });

        document.getElementById('add-to-cart-form').addEventListener('submit', function(event) {
            event.preventDefault();
            addToCart();
        });
    }

    function addToCart() {
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
