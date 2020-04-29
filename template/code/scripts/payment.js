// A reference to Stripe.js
let stripe;
let paymentIntent;

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch(`${urlBase}/stripe-key`, {
    credentials: 'include'
}).then(function (result) {
    return result.json();
}).then(async function (data) {
    stripe = Stripe(data.publishableKey);
    document.querySelector("button").disabled = false;

    document.getElementById("formCompraBilhetes").addEventListener("submit", (event) => {
        event.preventDefault();
        pay();
    });
});

async function pay() {
    await createPaymentIntent();
    const paymentRequest = stripe.paymentRequest({
        country: 'PT',
        currency: 'eur',
        total: {
            label: 'Total',
            amount: parseInt((parseFloat(document.getElementById('preco').value.replace(",", ".")) * 100).toFixed(0)),
        },
        requestPayerName: true
    });

    // Callback when a payment method is created.
    paymentRequest.on('paymentmethod', async event => {
        // Confirm the PaymentIntent with the payment method returned from the payment request.
        console.log(1);
        const {
            error
        } = await stripe.confirmCardPayment(
            paymentIntent.client_secret, {
                payment_method: event.paymentMethod.id,
            }, {
                handleActions: false
            }
        );
        if (error) {
            // Report to the browser that the payment failed.
            event.complete('fail');
            handlePayment({
                error
            });
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

    if (document.getElementById('referencia').className == "checkbox radio-two radio-two-checked") {
        const sourceData = {
            type: 'multibanco',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            owner: {
                name: document.getElementById("nomeUtilizador").value,
                email: `isi+fill_now@gmail.com`
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
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const response = await stripe.confirmCardPayment(
                paymentIntent.client_secret, {
                    payment_method: {
                        card,
                        billing_details: {
                            name: document.getElementById("nomeUtilizador").value,
                        },
                    }
                }
            );
            handlePayment(response);
        });
    }
}

// Create the PaymentIntent with the cart details.
async function createPaymentIntent(payment_method) {
    try {
        let tipoBilhete = document.getElementById("tipoBilhete").options[document.getElementById("tipoBilhete").selectedIndex].value;
        let res = tipoBilhete.split("-");

        let orderData = {
            product_id: res[0],
            company: res[1],
            quantity: document.getElementById('quantidade').value,
            payment_method: payment_method
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
        }).then(result => {
            window.location.reload();
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
                    <strong>Valor: </strong>${((source.amount/100).toFixed(2)).replace(".", ",")} €
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
    let timeout = 3000000;
    let interval = 500;
    start = start ? start : new Date();
    console.log(start, new Date());
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
        console.log(response);
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
        console.log(error);
        swal({
            title: 'Ocorreu um erro! Tente novamente mais tarde',
            type: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        }).then(() => {
            window.location.reload();
        })
    } else if (paymentIntent.status === 'succeeded') {
        swal({
            title: 'Pagamento efetuado com sucesso!',
            type: 'success',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        }).then(() => {
            window.location.reload();
        })
    } else if (paymentIntent.status === 'processing') {
        swal({
            title: 'A aguardar que o pagamento seja processado!',
            type: 'warning',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        }).then(() => {
            window.location.reload();
        })
    } else {
        swal({
            title: 'Não foi efetuado nenhum pagamento!',
            type: 'error',
            showCloseButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            timer: 2000
        }).then(() => {
            window.location.reload();
        })
    }
}