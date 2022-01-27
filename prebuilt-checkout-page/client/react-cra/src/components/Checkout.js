import React from 'react';

const Checkout = () => {
  return (
    <div className="sr-root">
      <div className="sr-main">
        <section className="container">
          <div>
            <h1>Single photo</h1>
            <h4>Purchase a Pasha original photo</h4>
            <div className="pasha-image">
              <img
                alt="Random asset from Picsum"
                src="https://picsum.photos/280/320?random=4"
                width="140"
                height="160"
              />
            </div>
          </div>

          <form action="/create-checkout-session" method="POST">
            <button id="submit" role="link">Buy</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
