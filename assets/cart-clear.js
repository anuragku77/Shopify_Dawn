<script>
  document.querySelector('.clear-cart').addEventListener('click', function(e) {
    e.preventDefault();
    
    fetch('/cart/clear.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        alert('Are You Sure ?? You Want to clear the cart  !!!');
        response.json().then(() => {
          window.location.reload();
        });
      } else {
        throw new Error('Failed to clear the cart.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });  
</script>