// A reference to Stripe.js
let stripe;
let paymentIntent;
createPaymentIntent();

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch(`${urlBase}/stripe-key`, {
    credentials: 'include'
}).then(function (result) {
    return result.json();
}).then(function (data) {
    stripe = Stripe(data.publishableKey);

    if (document.getElementById('referencia').className == "checkbox radio-two radio-two-checked") {
        const sourceData = {
            type: 'multibanco',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            owner: {
                name: document.getElementById("nomeUtilizador").value,
            },
            statement_descriptor: 'Stripe Payments Demo',
            metadata: {
                paymentIntent: paymentIntent.id,
            },
        };
        const {
            source
        } = await stripe.createSource(sourceData);
        handleSourceActiviation(source);
    } else {
        document.querySelector("button").disabled = false;
        let elements = stripe.elements();
        let style = {
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
    
        let card = elements.create("card", {
        hidePostalCode: true,
        style: style
        });
        card.mount("#card-element");
        let form = document.getElementById("payment-form");
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const response = await stripe.confirmCardPayment(
                paymentIntent.client_secret,
                {
                  payment_method: {
                    card,
                    billing_details: {
                      name,
                    },
                  },
                  shipping,
                }
              );
              handlePayment(response);
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
           throw new Error(data.error);
        } else {
            paymentIntent = data.paymentIntent;
        }
    } catch (err) {
        swal({
            title: 'Ocorreu um erro! Tente novamente mais tarde',
            type: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        })
    }
}

function handleSourceActiviation(source) {
    if (source.flow == 'receiver') {
        if (source.type == 'multibanco') {
            // Display the Multibanco payment information to the user.
            const multibanco = source.multibanco;
            document.getElementById('pagamentoReferencia').innerHTML = `
            <br>
            <div style="border: 2px; border-style: ridge;">
                <br>
                <p style="line-height: 27px; font-size: 15px; text-align: center; margin-bottom: 20px;">
                    <strong>Entidade: </strong>${multibanco.entity} <br>
                    <strong>Referência: </strong>${multibanco.reference} <br>
                    <strong>Valor: </strong>${source.amount} €
                </p>
            </div>
            <br>
            <center>
                <img src="/images/warning.gif" style="width: 40px; margin-bottom: 6px;">
                <p style=" text-align:center; line-height: 20px; font-size: 14px;">Atenção! Esta referêcia
                    tem uma validade de <strong>8 horas</strong>!</p>
            </center>`;
        } else {
            console.log('Unhandled receiver flow.', source);
        }
        // Poll the PaymentIntent status.
        pollPaymentIntentStatus(paymentIntent.id, null);
    }
};

async function pollPaymentIntentStatus(paymentIntent, start) {
    let timeout = 30000;
    let interval = 500;
    start = start ? start : new Date();
    const endStates = ['succeeded', 'processing', 'canceled'];
    // Retrieve the PaymentIntent status from our server.
    const rawResponse = await fetch(`${urlBase}/payment/${paymentIntent}/status`, {
        credentials: 'include'
    })
    const response = await rawResponse.json();
    if (!endStates.includes(response.paymentIntent.status) && new Date() < start + timeout) {
        // Not done yet. Let's wait and check again.
        setTimeout(
            pollPaymentIntentStatus(paymentIntent, start),
            interval
        );
    } else {
        handlePayment(response);
        if (!endStates.includes(response.paymentIntent.status)) {
            // Status has not changed yet. Let's time out.
            console.warn(new Error('Polling timed out.'));
        }
    }
};

function handlePayment(paymentResponse) {
    const {
        paymentIntent,
        error
    } = paymentResponse;

    if (error) {
        swal({
            title: 'Ocorreu um erro! Tente novamente mais tarde',
            type: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        })
    } else if (paymentIntent.status === 'succeeded') {
        swal({
            title: 'Pagamento efetuado com sucesso!',
            type: 'success',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        })
    } else if (paymentIntent.status === 'processing') {
        swal({
            title: 'A aguardar que o pagamento seja processado!',
            type: 'warning',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        })
    } else {
        swal({
            title: 'Não foi efetuado nenhum pagamento!',
            type: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        })
    }
}

const paymentRequest = stripe.paymentRequest({
    country: 'PT',
    currency: 'eur',
    total: {
        label: 'Total',
        amount: document.getElementById('preco').value,
    },
    requestPayerName: true
});

  // Callback when a payment method is created.
paymentRequest.on('paymentmethod', async event => {
    // Confirm the PaymentIntent with the payment method returned from the payment request.
    const {error} = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: event.paymentMethod.id,
      },
      {handleActions: false}
    );
    if (error) {
      // Report to the browser that the payment failed.
      event.complete('fail');
      handlePayment({error});
    } else {
      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      event.complete('success');
      // Let Stripe.js handle the rest of the payment flow, including 3D Secure if needed.
      const response = await stripe.confirmCardPayment(
        paymentIntent.client_secret
      );
      handlePayment(response);
    }
  });