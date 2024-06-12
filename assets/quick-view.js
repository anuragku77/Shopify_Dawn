document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetails = document.getElementById('product-details');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-product-handle');
            if (productHandle) {
                console.log('Button clicked. Fetching details for product handle:', productHandle);
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
                displayProductDetails(product);
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to fetch product details. Please try again later.');
            });
    }

    function displayProductDetails(product) {
        var title = product.title;
        var desc = product.body_html;
        var images = product.images;

        var imageElements = images.map(image => `<img src="${image}" alt="${title}">`).join('');

        productDetails.innerHTML = `
            <h2>${title}</h2>
            <div>${desc}</div>
            <div>${imageElements}</div>
        `;

        modal.style.display = 'block';
    }
});
