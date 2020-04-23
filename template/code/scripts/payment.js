// A reference to Stripe.js
let stripe;


// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch(`${urlBase}/stripe-key`, {
    credentials: 'include'
}).then(function (result) {
    return result.json();
}).then(function (data) {
    stripe = Stripe(data.publishableKey);

    if (document.getElementById('referencia').className == "checkbox radio-two radio-two-checked") {
        // FALTA TERMINAR ESTE IF E O ELSE
    } else {
        document.querySelector("button").disabled = false;

        var form = document.getElementById("payment-form");
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            pay(stripe, card, clientSecret);
        });
    }
});

// Create the PaymentIntent with the cart details.
async function createPaymentIntent() {
    try {
        let tipoBilhete = document.getElementById("tipoBilhete").options[document.getElementById("tipoBilhete").selectedIndex].value;
        let res = tipoBilhete.split("-");

        let orderData = {
            product_id: res[0],
            company: res[1],
            quantity: document.getElementById('quantidade').value
        }
        const response = await fetch(`${urlBase}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
        });
        const data = await response.json();
        if (data.error) {
            return {
                error: data.error
            };
        } else {
            return data;
        }
    } catch (err) {
        return {
            error: err.message
        };
    }
}