
const signupFormHandler = async (event) => {
    event.preventDefault();
    console.log(" Click CVlikck");
    const email = document.querySelector('#inputEmail').value.trim();
    const first_name = document.querySelector('#inputFirstName').value.trim();
    const last_name = document.querySelector('#inputLastName').value.trim();
    const address = document.querySelector('#inputStreet').value.trim();
    const city = document.querySelector('#inputCity').value.trim();
    const state = document.querySelector('#inputState').value.trim();
    const phone_number = document.querySelector('#inputPhone').value.trim();
    const zipcode = document.querySelector('#inputZipcode').value.trim();
    const password = document.querySelector('#inputPassword').value.trim();

  
    if (email && password) {
      const response = await fetch('api/chefs', {
        method: 'POST',
        body: JSON.stringify({ email, first_name, last_name, address, city, state, phone_number, zipcode, password }),
        headers: { 'Content-Type': 'application/json' },
      });
     
  
      if (response.ok) {
        document.location.replace('/login');
      } else {
        alert( await response.statusText);
      }
    }
};


const submitButton = document.querySelector('#signupbtn');
submitButton.addEventListener("click", signupFormHandler);