document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');
    var modal = document.getElementById('quick-view-modal');
    var closeButton = document.querySelector('.close-button');
    var productDetails = document.getElementById('product-details');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-handle'); // Change to data-handle
            console.log('Button clicked. Product handle:', productHandle); // Add this line for debugging
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
        // Here, you should make your fetch request to fetch product details
        // You can replace this placeholder code with your actual fetch request
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
                displayProductDetails(product.product); // Access product object from the response
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to fetch product details. Please try again later.');
            });
    }

    function displayProductDetails(product) {
        var title = product.title;
        var desc = product.body_html;
        var images = product.images || []; // Handle if images array is not present

        var imageElements = images.map(image => `<img src="${image.src}" alt="${title}">`).join(''); // Access src property of image object

        productDetails.innerHTML = `
            <h2>${title}</h2>
            <div>${desc}</div>
            <div>${imageElements}</div>
        `;

        modal.style.display = 'block';
    }
});
