// A reference to Stripe.js
let stripe;


// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch(`${urlBase}/stripe-key`).then(function (result) {
  return result.json();
}).then(function (data) {
  return setupElements(data);
}).then(function ({
  stripe,
  card,
  clientSecret
}) {
  document.querySelector("button").disabled = false;

  var form = document.getElementById("payment-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    pay(stripe, card, clientSecret);
  });
});

var setupElements = function (data) {
  stripe = Stripe(data.publishableKey);
  /* ------- Set up Stripe Elements to use in checkout form ------- */
  var elements = stripe.elements();
  var style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };

  var card = elements.create("card", {
    style: style
  });
  card.mount("#card-element");

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret
  };
};

var handleAction = function (clientSecret) {
  stripe.handleCardAction(clientSecret).then(function (data) {
    if (data.error) {
      showMessage("Your card was not authenticated, please try again");
    } else if (data.paymentIntent.status === "requires_confirmation") {
      fetch(`${urlBase}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntent.id
        })
      }).then(function (result) {
        return result.json();
      }).then(function (json) {
        if (json.error) {
          showMessage(json.error);
        } else {
          orderComplete(clientSecret);
        }
      });
    }
  });
};

/*
 * Collect card details and pay for the order
 */
var pay = function (stripe, card) {
  changeLoadingState(true);

  // Collects card details and creates a PaymentMethod
  stripe.createPaymentMethod("card", card).then(function (result) {
    if (result.error) {
      showMessage(result.error.message);
    } else {
      let tipoBilhete = document.getElementById("tipoBilhete").options[document.getElementById("tipoBilhete").selectedIndex].value;
      let res = tipoBilhete.split("-");

      let orderData = {
        product_id: res[0],
        company: res[1],
        quantity: document.getElementById('quantidade').value,
        paymentMethodId: result.paymentMethod.id
      };

      return fetch(`${urlBase}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
    }
  }).then(function (result) {
    return result.json();
  }).then(function (response) {
    if (response.error) {
      showMessage(response.error);
    } else if (response.requiresAction) {
      // Request authentication
      handleAction(response.clientSecret);
    } else {
      orderComplete(response.clientSecret);
    }
  });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function (clientSecret) {
  let tipoBilhete = document.getElementById("tipoBilhete").options[document.getElementById("tipoBilhete").selectedIndex].value;
  let res = tipoBilhete.split("-");
  let id = res[0];
  let company = res[1];
  let data = {};
  data.product_id = id;
  data.company = company;
  data.quantity = document.getElementById('quantidade').value;

  return fetch(`${urlBase}/purchases`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(data)
  }).then(response => {
    return response.json();
  }).then(result => {
    if (result.message == "Purchase inserted with success") {
      swal({
        title: 'Compra efetuada com sucesso!',
        type: 'success',
        showCloseButton: false,
        showConfirmButton: false,
        focusConfirm: false,
        timer: 2000
      }).then(() => {
        window.location.reload();
      })
    } else {
      throw new Error(result.message);
    }
  }).catch(error => {
    showMessage(error.message);
  })
};

var showMessage = function (errorMsgText) {
  changeLoadingState(false);
  var errorMsg = document.querySelector(".sr-field-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
var changeLoadingState = function (isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};