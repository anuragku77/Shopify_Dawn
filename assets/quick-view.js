document.addEventListener('DOMContentLoaded', function() {
    var quickViewButtons = document.querySelectorAll('.quick-view-button');

    quickViewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var productHandle = this.getAttribute('data-product-handle');
            console.log('Button clicked. Fetching details for product handle:', productHandle);
            fetchProductDetails(productHandle);
        });
    });

    function fetchProductDetails(handle) {
        console.log('Fetching product details for:', handle);
        fetch(`/products/${handle}.js`)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                console.log('Product details fetched:', product);
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to fetch product details. Please try again later.');
            });
    }
});
